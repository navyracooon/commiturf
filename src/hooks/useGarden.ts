import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { type AppLanguage, type GardenErrorCode, translations } from '../i18n/translations';
import {
  authorizeGitHub,
  clearGitHubSession,
  getGitHubAccessToken,
  GitHubAuthError,
  type GitHubDeviceVerification,
  hasStoredGitHubSession,
  isAuthorizationCancellation,
} from '../services/githubAuth';
import {
  type ContributionRange,
  fetchGitHubGarden,
  type GitHubGarden,
  GitHubGardenError,
} from '../services/github';
import {
  clearGarden,
  loadGarden,
  saveGarden,
  saveWidgetSnapshot,
} from '../storage/gardenStorage';
import type { ContributionDay, GardenPeriod } from '../types/garden';
import { generateDemoGarden, getGardenStats, selectPeriod, toDateKey } from '../utils/dates';
import { refreshesCurrentGarden, shouldSyncOnForeground } from '../utils/sync';
import { makeWidgetSnapshot, updateHomeWidgets } from '../widgets/updateWidgets';

function mergeContributionDays(
  current: ContributionDay[],
  incoming: ContributionDay[],
): ContributionDay[] {
  const byDate = new Map(current.map((day) => [day.date, day]));
  incoming.forEach((day) => byDate.set(day.date, day));
  return [...byDate.values()].sort((left, right) => left.date.localeCompare(right.date));
}

function errorCodeFor(error: unknown): GardenErrorCode {
  if (error instanceof GitHubGardenError || error instanceof GitHubAuthError) {
    return error.code;
  }
  return 'network';
}

type SyncMode = 'idle' | 'refresh' | 'connect' | 'background' | 'period';
type ActiveSyncMode = Exclude<SyncMode, 'idle'>;

export function useGarden(
  period: GardenPeriod,
  language: AppLanguage,
  referenceDate = new Date(),
) {
  const autoSyncStarted = useRef(false);
  const activeRequest = useRef(false);
  const connectRequest = useRef<AbortController | null>(null);
  const lastRequestedView = useRef<string | null>(null);
  const [days, setDays] = useState<ContributionDay[]>(() => generateDemoGarden(366 * 5));
  const daysRef = useRef(days);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const lastSyncedAtRef = useRef(lastSyncedAt);
  const [isHydrating, setIsHydrating] = useState(true);
  const [syncMode, setSyncMode] = useState<SyncMode>('idle');
  const [errorCode, setErrorCode] = useState<GardenErrorCode | null>(null);

  const applyFetchedGarden = useCallback(async (
    fetched: GitHubGarden,
    range?: ContributionRange,
  ) => {
    const nextDays = mergeContributionDays(
      fetched.username === username ? daysRef.current : [],
      fetched.days,
    );
    const now = new Date();
    const updatesCurrentGarden = refreshesCurrentGarden(range, now);
    const nextLastSyncedAt = updatesCurrentGarden
      ? now.toISOString()
      : lastSyncedAtRef.current;
    const snapshot = updatesCurrentGarden
      ? makeWidgetSnapshot(
          nextDays,
          fetched.username,
          language,
          now,
          nextLastSyncedAt,
        )
      : undefined;

    await saveGarden(
      {
        avatarUrl: fetched.avatarUrl,
        days: nextDays,
        lastSyncedAt: nextLastSyncedAt,
        schemaVersion: 2,
        username: fetched.username,
      },
      snapshot,
    );

    daysRef.current = nextDays;
    setDays(nextDays);
    setAvatarUrl(fetched.avatarUrl);
    setUsername(fetched.username);
    if (updatesCurrentGarden) {
      lastSyncedAtRef.current = nextLastSyncedAt;
      setLastSyncedAt(nextLastSyncedAt);
    }
    autoSyncStarted.current = true;
  }, [language, username]);

  const performSync = useCallback(async (
    range?: ContributionRange,
    feedback = true,
    mode: ActiveSyncMode = 'background',
  ) => {
    if (!username || activeRequest.current) return false;

    activeRequest.current = true;
    setErrorCode(null);
    setSyncMode(mode);
    try {
      const accessToken = await getGitHubAccessToken();
      const fetched = await fetchGitHubGarden(accessToken, range);
      await applyFetchedGarden(fetched, range);
      if (feedback) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      return true;
    } catch (error) {
      setErrorCode(errorCodeFor(error));
      if (feedback) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return false;
    } finally {
      activeRequest.current = false;
      setSyncMode('idle');
    }
  }, [applyFetchedGarden, username]);

  const connect = useCallback(async (
    onVerification: (verification: GitHubDeviceVerification) => void,
  ) => {
    if (activeRequest.current) return false;

    const controller = new AbortController();
    connectRequest.current = controller;
    activeRequest.current = true;
    setErrorCode(null);
    setSyncMode('connect');
    try {
      const accessToken = await authorizeGitHub(onVerification, controller.signal);
      const fetched = await fetchGitHubGarden(accessToken, undefined, controller.signal);
      await applyFetchedGarden(fetched);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return true;
    } catch (error) {
      await clearGitHubSession().catch(() => undefined);
      if (!isAuthorizationCancellation(error)) {
        setErrorCode(errorCodeFor(error));
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return false;
    } finally {
      connectRequest.current = null;
      activeRequest.current = false;
      setSyncMode('idle');
    }
  }, [applyFetchedGarden]);

  const cancelConnection = useCallback(() => {
    connectRequest.current?.abort();
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([loadGarden(), hasStoredGitHubSession()])
      .then(async ([garden, hasSession]) => {
        if (!active) return;

        if (garden && hasSession) {
          daysRef.current = garden.days;
          setDays(garden.days);
          setAvatarUrl(garden.avatarUrl);
          lastSyncedAtRef.current = garden.lastSyncedAt;
          setLastSyncedAt(garden.lastSyncedAt);
          setUsername(garden.username);
          return;
        }

        if (garden) await clearGarden();
        if (hasSession) await clearGitHubSession();
      })
      .catch(() => {
        if (active) setErrorCode('storageUnavailable');
      })
      .finally(() => {
        if (active) setIsHydrating(false);
      });
    return () => {
      active = false;
      connectRequest.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (isHydrating || !username || autoSyncStarted.current) return;
    autoSyncStarted.current = true;
    void performSync(undefined, false, 'background');
  }, [isHydrating, performSync, username]);

  useEffect(() => {
    if (isHydrating) return;
    const snapshot = makeWidgetSnapshot(
      daysRef.current,
      username ?? 'your-garden',
      language,
      new Date(),
      lastSyncedAt,
    );
    void saveWidgetSnapshot(snapshot).catch(() => undefined);
    void updateHomeWidgets(snapshot);
  }, [isHydrating, language, lastSyncedAt, username]);

  useEffect(() => {
    if (isHydrating || !username) return;

    let previousState = AppState.currentState;
    const subscription = AppState.addEventListener('change', (nextState) => {
      const becameActive = previousState !== 'active' && nextState === 'active';
      previousState = nextState;
      if (becameActive && shouldSyncOnForeground(lastSyncedAtRef.current)) {
        void performSync(undefined, false, 'background');
      }
    });

    return () => subscription.remove();
  }, [isHydrating, performSync, username]);

  const disconnect = useCallback(async () => {
    if (activeRequest.current && !connectRequest.current) return false;
    cancelConnection();

    const demoDays = generateDemoGarden(366 * 5);
    const snapshot = makeWidgetSnapshot(demoDays, 'your-garden', language);
    try {
      await Promise.all([clearGarden(), clearGitHubSession()]);
    } catch {
      setErrorCode('storageUnavailable');
      return false;
    }

    daysRef.current = demoDays;
    lastSyncedAtRef.current = null;
    autoSyncStarted.current = false;
    lastRequestedView.current = null;
    setAvatarUrl(null);
    setDays(demoDays);
    setErrorCode(null);
    setLastSyncedAt(null);
    setUsername(null);
    void saveWidgetSnapshot(snapshot).catch(() => undefined);
    void updateHomeWidgets(snapshot);
    return true;
  }, [cancelConnection, language]);

  const visibleDays = useMemo(
    () => selectPeriod(days, period, referenceDate),
    [days, period, referenceDate],
  );

  const sync = useCallback(() => {
    const todayKey = toDateKey(new Date());
    const refreshableDays = visibleDays.filter((day) => day.date <= todayKey);
    const from = refreshableDays.at(0)?.date;
    const to = refreshableDays.at(-1)?.date;
    const range = from && to && to !== todayKey ? { from, to } : undefined;
    return performSync(range, true, 'refresh');
  }, [performSync, visibleDays]);

  useEffect(() => {
    if (isHydrating || syncMode !== 'idle' || !username) return;

    const todayKey = toDateKey(new Date());
    const requiredDays = visibleDays.filter((day) => day.date <= todayKey);
    const from = requiredDays.at(0)?.date;
    const to = requiredDays.at(-1)?.date;
    if (!from || !to) return;

    // The current period is already refreshed by the full-calendar background sync.
    // Resetting this key ensures returning to a past view revalidates it again.
    if (to === todayKey) {
      lastRequestedView.current = null;
      return;
    }

    const viewKey = `${username}:${period}:${from}:${to}`;
    if (lastRequestedView.current === viewKey) return;

    const availableDates = new Set(days.map((day) => day.date));
    const hasCachedRange = requiredDays.every((day) => availableDates.has(day.date));

    lastRequestedView.current = viewKey;
    void performSync(
      { from, to },
      false,
      hasCachedRange ? 'background' : 'period',
    );
  }, [days, isHydrating, performSync, period, syncMode, username, visibleDays]);

  const stats = useMemo(() => getGardenStats(visibleDays), [visibleDays]);
  const error = errorCode ? translations[language].errors[errorCode] : null;
  const todayKey = toDateKey(new Date());
  const visibleThroughToday = visibleDays.filter((day) => day.date <= todayKey);
  const visibleFrom = visibleThroughToday.at(0)?.date;
  const visibleTo = visibleThroughToday.at(-1)?.date;
  const cachedDates = new Set(days.map((day) => day.date));
  const hasVisibleCache = visibleThroughToday.every((day) => cachedDates.has(day.date));

  return {
    avatarUrl,
    cancelConnection,
    connect,
    days: visibleDays,
    disconnect,
    error,
    isConnecting: syncMode === 'connect',
    isDemo: !username,
    isHydrating,
    isLoadingPeriod:
      Boolean(username && visibleFrom && visibleTo && visibleTo !== todayKey) &&
      !hasVisibleCache,
    isRefreshing: syncMode === 'refresh',
    isSyncing: syncMode !== 'idle',
    lastSyncedAt,
    setError: (next: string | null) => {
      if (next === null) setErrorCode(null);
    },
    stats,
    sync,
    username,
  };
}
