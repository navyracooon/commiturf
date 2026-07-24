import type { ContributionDay, GrowthLevel } from '../types/garden';
import type { GardenErrorCode } from '../i18n/translations';

const GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';
const REQUEST_TIMEOUT_MS = 15_000;

const CONTRIBUTION_LEVELS: Record<string, GrowthLevel> = {
  FOURTH_QUARTILE: 4,
  FIRST_QUARTILE: 1,
  NONE: 0,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
};

const CONTRIBUTIONS_QUERY = `
  query CommiturfGarden($from: DateTime, $to: DateTime) {
    viewer {
      avatarUrl(size: 96)
      login
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              contributionCount
              contributionLevel
              date
            }
          }
        }
      }
    }
  }
`;

export interface ContributionRange {
  from: string;
  to: string;
}

export interface GitHubGarden {
  avatarUrl: string;
  days: ContributionDay[];
  username: string;
}

interface GraphQLContributionDay {
  contributionCount?: unknown;
  contributionLevel?: unknown;
  date?: unknown;
}

interface GraphQLResponse {
  data?: {
    viewer?: {
      avatarUrl?: unknown;
      contributionsCollection?: {
        contributionCalendar?: {
          weeks?: Array<{
            contributionDays?: GraphQLContributionDay[];
          }>;
        };
      };
      login?: unknown;
    };
  };
  errors?: Array<{
    message?: string;
    type?: string;
  }>;
}

export class GitHubGardenError extends Error {
  readonly code: Exclude<GardenErrorCode, 'network' | 'storageUnavailable'>;

  constructor(code: Exclude<GardenErrorCode, 'network' | 'storageUnavailable'>) {
    super(code);
    this.name = 'GitHubGardenError';
    this.code = code;
  }
}

function dateTimeAtBoundary(date: string, endOfDay: boolean): string {
  return `${date}T${endOfDay ? '23:59:59' : '00:00:00'}Z`;
}

export function contributionVariables(range?: ContributionRange) {
  return range
    ? {
        from: dateTimeAtBoundary(range.from, false),
        to: dateTimeAtBoundary(range.to, true),
      }
    : { from: null, to: null };
}

export function parseGraphQLGarden(payload: GraphQLResponse): GitHubGarden {
  if (payload.errors?.length) {
    const errorType = payload.errors[0]?.type;
    if (errorType === 'RATE_LIMITED') throw new GitHubGardenError('rateLimited');
    if (errorType === 'UNAUTHENTICATED' || errorType === 'FORBIDDEN') {
      throw new GitHubGardenError('authExpired');
    }
    throw new GitHubGardenError('githubUnavailable');
  }

  const viewer = payload.data?.viewer;
  const weeks = viewer?.contributionsCollection?.contributionCalendar?.weeks;
  if (
    typeof viewer?.login !== 'string' ||
    typeof viewer.avatarUrl !== 'string' ||
    !Array.isArray(weeks)
  ) {
    throw new GitHubGardenError('unsupportedGitHubResponse');
  }

  const days = weeks
    .flatMap((week) => week.contributionDays ?? [])
    .map((day): ContributionDay => {
      const level =
        typeof day.contributionLevel === 'string'
          ? CONTRIBUTION_LEVELS[day.contributionLevel]
          : undefined;
      if (
        typeof day.date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
        typeof day.contributionCount !== 'number' ||
        !Number.isInteger(day.contributionCount) ||
        day.contributionCount < 0 ||
        level === undefined
      ) {
        throw new GitHubGardenError('unsupportedGitHubResponse');
      }
      return {
        count: day.contributionCount,
        date: day.date,
        level,
      };
    })
    .sort((left, right) => left.date.localeCompare(right.date));

  if (days.length === 0) throw new GitHubGardenError('unsupportedGitHubResponse');

  return {
    avatarUrl: viewer.avatarUrl,
    days,
    username: viewer.login,
  };
}

export async function fetchGitHubGarden(
  accessToken: string,
  range?: ContributionRange,
  signal?: AbortSignal,
): Promise<GitHubGarden> {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) controller.abort();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(GRAPHQL_ENDPOINT, {
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: contributionVariables(range),
      }),
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2026-03-10',
      },
      method: 'POST',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }

  if (response.status === 401) throw new GitHubGardenError('authExpired');
  if (
    response.status === 429 ||
    (response.status === 403 &&
      (response.headers.get('x-ratelimit-remaining') === '0' ||
        response.headers.has('retry-after')))
  ) {
    throw new GitHubGardenError('rateLimited');
  }
  if (response.status === 403) throw new GitHubGardenError('authExpired');
  if (!response.ok) throw new GitHubGardenError('githubUnavailable');

  return parseGraphQLGarden(await response.json() as GraphQLResponse);
}
