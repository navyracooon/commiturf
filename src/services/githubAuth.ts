import * as SecureStore from 'expo-secure-store';

import type { GardenErrorCode } from '../i18n/translations';

const AUTH_KEY = 'commiturf.github-auth.v1';
const DEVICE_CODE_ENDPOINT = 'https://github.com/login/device/code';
const TOKEN_ENDPOINT = 'https://github.com/login/oauth/access_token';
const VERIFICATION_URI = 'https://github.com/login/device';
const REQUEST_TIMEOUT_MS = 15_000;
const EXPIRY_SAFETY_WINDOW_MS = 60_000;

export interface GitHubDeviceVerification {
  expiresAt: number;
  intervalSeconds: number;
  userCode: string;
  verificationUri: string;
}

interface PendingDeviceAuthorization extends GitHubDeviceVerification {
  deviceCode: string;
}

interface GitHubAuthSession {
  accessToken: string;
  accessTokenExpiresAt: number | null;
  refreshToken: string | null;
  refreshTokenExpiresAt: number | null;
}

interface TokenResponse {
  access_token?: unknown;
  error?: unknown;
  expires_in?: unknown;
  interval?: unknown;
  refresh_token?: unknown;
  refresh_token_expires_in?: unknown;
}

export class GitHubAuthError extends Error {
  readonly code: Extract<
    GardenErrorCode,
    | 'authConfiguration'
    | 'authDenied'
    | 'authExpired'
    | 'githubUnavailable'
    | 'network'
    | 'storageUnavailable'
  >;

  constructor(code: GitHubAuthError['code']) {
    super(code);
    this.name = 'GitHubAuthError';
    this.code = code;
  }
}

function clientId(): string {
  const value = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID?.trim();
  if (!value) throw new GitHubAuthError('authConfiguration');
  return value;
}

function formBody(values: Record<string, string>): string {
  return Object.entries(values)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

function isSession(value: unknown): value is GitHubAuthSession {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<GitHubAuthSession>;
  return (
    typeof session.accessToken === 'string' &&
    session.accessToken.length > 0 &&
    (session.accessTokenExpiresAt === null ||
      (typeof session.accessTokenExpiresAt === 'number' &&
        Number.isFinite(session.accessTokenExpiresAt))) &&
    (session.refreshToken === null ||
      (typeof session.refreshToken === 'string' && session.refreshToken.length > 0)) &&
    (session.refreshTokenExpiresAt === null ||
      (typeof session.refreshTokenExpiresAt === 'number' &&
        Number.isFinite(session.refreshTokenExpiresAt)))
  );
}

async function loadSession(): Promise<GitHubAuthSession | null> {
  let raw: string | null;
  try {
    raw = await SecureStore.getItemAsync(AUTH_KEY);
  } catch {
    throw new GitHubAuthError('storageUnavailable');
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isSession(parsed)) return parsed;
  } catch {
    // Invalid or interrupted credentials are removed below.
  }

  try {
    await SecureStore.deleteItemAsync(AUTH_KEY);
  } catch {
    throw new GitHubAuthError('storageUnavailable');
  }
  return null;
}

async function saveSession(session: GitHubAuthSession): Promise<void> {
  try {
    await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify(session), {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  } catch {
    throw new GitHubAuthError('storageUnavailable');
  }
}

function abortError(): Error {
  const error = new Error('The GitHub authorization was cancelled.');
  error.name = 'AbortError';
  return error;
}

function wait(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', cancel);
      resolve();
    }, milliseconds);
    const cancel = () => {
      clearTimeout(timeout);
      reject(abortError());
    };
    signal?.addEventListener('abort', cancel, { once: true });
  });
}

async function postForm(
  endpoint: string,
  values: Record<string, string>,
  signal?: AbortSignal,
): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) controller.abort();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      body: formBody(values),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      signal: controller.signal,
    });
    if (!response.ok) throw new GitHubAuthError('githubUnavailable');
    return await response.json() as Record<string, unknown>;
  } catch (error) {
    if (signal?.aborted) throw abortError();
    if (error instanceof GitHubAuthError) throw error;
    throw new GitHubAuthError('network');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}

function sessionFromTokenResponse(
  payload: TokenResponse,
  now = Date.now(),
): GitHubAuthSession {
  if (typeof payload.access_token !== 'string' || payload.access_token.length === 0) {
    throw new GitHubAuthError('githubUnavailable');
  }

  const expiresIn =
    typeof payload.expires_in === 'number' && Number.isFinite(payload.expires_in)
      ? payload.expires_in
      : null;
  const refreshExpiresIn =
    typeof payload.refresh_token_expires_in === 'number' &&
    Number.isFinite(payload.refresh_token_expires_in)
      ? payload.refresh_token_expires_in
      : null;

  return {
    accessToken: payload.access_token,
    accessTokenExpiresAt: expiresIn === null ? null : now + expiresIn * 1000,
    refreshToken:
      typeof payload.refresh_token === 'string' && payload.refresh_token.length > 0
        ? payload.refresh_token
        : null,
    refreshTokenExpiresAt:
      refreshExpiresIn === null ? null : now + refreshExpiresIn * 1000,
  };
}

async function startDeviceAuthorization(
  signal?: AbortSignal,
): Promise<PendingDeviceAuthorization> {
  const payload = await postForm(DEVICE_CODE_ENDPOINT, { client_id: clientId() }, signal);
  if (
    typeof payload.device_code !== 'string' ||
    typeof payload.user_code !== 'string' ||
    typeof payload.verification_uri !== 'string' ||
    typeof payload.expires_in !== 'number' ||
    typeof payload.interval !== 'number'
  ) {
    throw new GitHubAuthError('githubUnavailable');
  }
  if (payload.verification_uri.replace(/\/$/, '') !== VERIFICATION_URI) {
    throw new GitHubAuthError('githubUnavailable');
  }

  return {
    deviceCode: payload.device_code,
    expiresAt: Date.now() + payload.expires_in * 1000,
    intervalSeconds: payload.interval,
    userCode: payload.user_code,
    verificationUri: payload.verification_uri,
  };
}

async function pollForSession(
  pending: PendingDeviceAuthorization,
  signal?: AbortSignal,
): Promise<GitHubAuthSession> {
  let intervalSeconds = pending.intervalSeconds;

  while (Date.now() < pending.expiresAt) {
    await wait(intervalSeconds * 1000, signal);
    const payload = await postForm(
      TOKEN_ENDPOINT,
      {
        client_id: clientId(),
        device_code: pending.deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      },
      signal,
    ) as TokenResponse;

    if (typeof payload.access_token === 'string') {
      return sessionFromTokenResponse(payload);
    }

    switch (payload.error) {
      case 'authorization_pending':
        break;
      case 'slow_down':
        intervalSeconds += 5;
        break;
      case 'access_denied':
        throw new GitHubAuthError('authDenied');
      case 'expired_token':
      case 'incorrect_device_code':
        throw new GitHubAuthError('authExpired');
      case 'device_flow_disabled':
      case 'incorrect_client_credentials':
        throw new GitHubAuthError('authConfiguration');
      default:
        throw new GitHubAuthError('githubUnavailable');
    }
  }

  throw new GitHubAuthError('authExpired');
}

async function refreshSession(session: GitHubAuthSession): Promise<GitHubAuthSession> {
  if (
    !session.refreshToken ||
    (session.refreshTokenExpiresAt !== null &&
      session.refreshTokenExpiresAt <= Date.now() + EXPIRY_SAFETY_WINDOW_MS)
  ) {
    await clearGitHubSession();
    throw new GitHubAuthError('authExpired');
  }

  const payload = await postForm(TOKEN_ENDPOINT, {
    client_id: clientId(),
    grant_type: 'refresh_token',
    refresh_token: session.refreshToken,
  }) as TokenResponse;

  if (payload.error) {
    await clearGitHubSession();
    throw new GitHubAuthError('authExpired');
  }

  const refreshed = sessionFromTokenResponse(payload);
  await saveSession(refreshed);
  return refreshed;
}

export async function authorizeGitHub(
  onVerification: (verification: GitHubDeviceVerification) => void,
  signal?: AbortSignal,
): Promise<string> {
  const pending = await startDeviceAuthorization(signal);
  onVerification({
    expiresAt: pending.expiresAt,
    intervalSeconds: pending.intervalSeconds,
    userCode: pending.userCode,
    verificationUri: pending.verificationUri,
  });
  const session = await pollForSession(pending, signal);
  await saveSession(session);
  return session.accessToken;
}

export async function clearGitHubSession(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_KEY);
}

export async function getGitHubAccessToken(): Promise<string> {
  const session = await loadSession();
  if (!session) throw new GitHubAuthError('authExpired');
  if (
    session.accessTokenExpiresAt === null ||
    session.accessTokenExpiresAt > Date.now() + EXPIRY_SAFETY_WINDOW_MS
  ) {
    return session.accessToken;
  }
  return (await refreshSession(session)).accessToken;
}

export async function hasStoredGitHubSession(): Promise<boolean> {
  return (await loadSession()) !== null;
}

export function isAuthorizationCancellation(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}
