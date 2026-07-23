import type { ContributionDay, GrowthLevel } from '../types/garden';
import type { GardenErrorCode } from '../i18n/translations';

const USERNAME_PATTERN = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
const CELL_PATTERN =
  /<td(?=[^>]*data-date="([^"]+)")(?=[^>]*data-level="([0-4])")[^>]*><\/td>\s*<tool-tip[^>]*>([^<]*)<\/tool-tip>/g;
const REQUEST_TIMEOUT_MS = 15_000;

export interface ContributionRange {
  from: string;
  to: string;
}

export class GitHubGardenError extends Error {
  readonly code: Exclude<GardenErrorCode, 'network'>;

  constructor(code: Exclude<GardenErrorCode, 'network'>) {
    super(code);
    this.name = 'GitHubGardenError';
    this.code = code;
  }
}

export function normalizeUsername(value: string): string {
  const username = value.trim().replace(/^@/, '');
  if (!USERNAME_PATTERN.test(username)) {
    throw new GitHubGardenError('invalidUsername');
  }
  return username;
}

export function parseContributionCalendar(html: string, minimumDays = 300): ContributionDay[] {
  const days: ContributionDay[] = [];

  for (const match of html.matchAll(CELL_PATTERN)) {
    const date = match[1];
    const level = Number(match[2]) as GrowthLevel;
    const label = match[3] ?? '';
    const countMatch = label.match(/([\d,]+) contributions?/i);
    const count = countMatch ? Number(countMatch[1]?.replaceAll(',', '')) : 0;

    if (date) days.push({ date, level, count });
  }

  if (days.length < minimumDays) {
    throw new GitHubGardenError('unavailableGarden');
  }

  return days.sort((left, right) => left.date.localeCompare(right.date));
}

export async function fetchGitHubGarden(
  usernameInput: string,
  range?: ContributionRange,
): Promise<ContributionDay[]> {
  const username = normalizeUsername(usernameInput);
  const query = range
    ? `?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`
    : '';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(
      `https://github.com/users/${encodeURIComponent(username)}/contributions${query}`,
      {
        headers: {
          Accept: 'text/html',
          'Accept-Language': 'en-US,en;q=0.9',
          'X-Requested-With': 'XMLHttpRequest',
        },
        signal: controller.signal,
      },
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new GitHubGardenError(
      response.status === 404 ? 'profileNotFound' : 'githubUnavailable',
    );
  }

  return parseContributionCalendar(await response.text(), range ? 1 : 300);
}
