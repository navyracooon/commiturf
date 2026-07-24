import assert from 'node:assert/strict';
import test from 'node:test';

import {
  contributionVariables,
  fetchGitHubGarden,
  GitHubGardenError,
  parseGraphQLGarden,
} from './github';

function responseWithDays() {
  return {
    data: {
      viewer: {
        avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
        contributionsCollection: {
          contributionCalendar: {
            weeks: [
              {
                contributionDays: [
                  {
                    contributionCount: 0,
                    contributionLevel: 'NONE',
                    date: '2026-07-22',
                  },
                  {
                    contributionCount: 7,
                    contributionLevel: 'THIRD_QUARTILE',
                    date: '2026-07-23',
                  },
                  {
                    contributionCount: 14,
                    contributionLevel: 'FOURTH_QUARTILE',
                    date: '2026-07-24',
                  },
                ],
              },
            ],
          },
        },
        login: 'octocat',
      },
    },
  };
}

test('maps the official GraphQL contribution calendar to garden days', () => {
  assert.deepEqual(parseGraphQLGarden(responseWithDays()), {
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
    days: [
      { count: 0, date: '2026-07-22', level: 0 },
      { count: 7, date: '2026-07-23', level: 3 },
      { count: 14, date: '2026-07-24', level: 4 },
    ],
    username: 'octocat',
  });
});

test('uses inclusive UTC boundaries for a requested calendar range', () => {
  assert.deepEqual(contributionVariables({ from: '2024-01-01', to: '2024-12-31' }), {
    from: '2024-01-01T00:00:00Z',
    to: '2024-12-31T23:59:59Z',
  });
  assert.deepEqual(contributionVariables(), { from: null, to: null });
});

test('maps GraphQL authentication and rate limit errors', () => {
  assert.throws(
    () => parseGraphQLGarden({ errors: [{ type: 'UNAUTHENTICATED' }] }),
    (error) => error instanceof GitHubGardenError && error.code === 'authExpired',
  );
  assert.throws(
    () => parseGraphQLGarden({ errors: [{ type: 'RATE_LIMITED' }] }),
    (error) => error instanceof GitHubGardenError && error.code === 'rateLimited',
  );
});

test('rejects malformed GraphQL contribution data', () => {
  const payload = responseWithDays();
  payload.data.viewer.contributionsCollection.contributionCalendar.weeks[0]!
    .contributionDays[0]!.contributionLevel = 'UNKNOWN';

  assert.throws(
    () => parseGraphQLGarden(payload),
    (error) =>
      error instanceof GitHubGardenError &&
      error.code === 'unsupportedGitHubResponse',
  );
});

test('requests the contribution calendar through the official GraphQL API', async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async (input, init) => {
    assert.equal(input, 'https://api.github.com/graphql');
    assert.equal(init?.method, 'POST');
    assert.equal(
      (init?.headers as Record<string, string>).Authorization,
      'Bearer test-access-token',
    );
    assert.deepEqual(
      JSON.parse(init?.body as string).variables,
      contributionVariables({ from: '2026-07-01', to: '2026-07-24' }),
    );
    return new Response(JSON.stringify(responseWithDays()), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  };

  const garden = await fetchGitHubGarden(
    'test-access-token',
    { from: '2026-07-01', to: '2026-07-24' },
  );
  assert.equal(garden.username, 'octocat');
});

test('recognizes GitHub rate-limit responses that use HTTP 403', async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async () => new Response(null, {
    headers: { 'X-RateLimit-Remaining': '0' },
    status: 403,
  });

  await assert.rejects(
    () => fetchGitHubGarden('test-access-token'),
    (error) => error instanceof GitHubGardenError && error.code === 'rateLimited',
  );
});
