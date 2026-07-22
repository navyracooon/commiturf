import type { ContributionDay, GrowthLevel } from '../types/garden';

const USERNAME_PATTERN = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
const CELL_PATTERN =
  /<td(?=[^>]*data-date="([^"]+)")(?=[^>]*data-level="([0-4])")[^>]*><\/td>\s*<tool-tip[^>]*>([^<]*)<\/tool-tip>/g;

export class GitHubGardenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubGardenError';
  }
}

export function normalizeUsername(value: string): string {
  const username = value.trim().replace(/^@/, '');
  if (!USERNAME_PATTERN.test(username)) {
    throw new GitHubGardenError('Enter a valid GitHub username.');
  }
  return username;
}

export function parseContributionCalendar(html: string): ContributionDay[] {
  const days: ContributionDay[] = [];

  for (const match of html.matchAll(CELL_PATTERN)) {
    const date = match[1];
    const level = Number(match[2]) as GrowthLevel;
    const label = match[3] ?? '';
    const countMatch = label.match(/([\d,]+) contributions?/i);
    const count = countMatch ? Number(countMatch[1]?.replaceAll(',', '')) : 0;

    if (date) days.push({ date, level, count });
  }

  if (days.length < 300) {
    throw new GitHubGardenError('That garden is not available yet. Check the username and try again.');
  }

  return days.sort((left, right) => left.date.localeCompare(right.date));
}

export async function fetchGitHubGarden(usernameInput: string): Promise<ContributionDay[]> {
  const username = normalizeUsername(usernameInput);
  const response = await fetch(
    `https://github.com/users/${encodeURIComponent(username)}/contributions`,
    {
      headers: {
        Accept: 'text/html',
        'X-Requested-With': 'XMLHttpRequest',
      },
    },
  );

  if (!response.ok) {
    throw new GitHubGardenError(
      response.status === 404
        ? 'We could not find that GitHub profile.'
        : 'GitHub could not be reached. Try again in a moment.',
    );
  }

  return parseContributionCalendar(await response.text());
}
