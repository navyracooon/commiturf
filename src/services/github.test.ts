import assert from 'node:assert/strict';
import test from 'node:test';

import { GitHubGardenError, normalizeUsername, parseContributionCalendar } from './github';

function contributionCell(index: number, count: number, level: number) {
  const day = String((index % 28) + 1).padStart(2, '0');
  const month = String((Math.floor(index / 28) % 12) + 1).padStart(2, '0');
  const year = 2000 + Math.floor(index / 336);
  const id = `contribution-day-${index}`;
  const label = count === 0 ? 'No contributions' : `${count} contribution${count === 1 ? '' : 's'}`;
  return `<td data-date="${year}-${month}-${day}" id="${id}" data-level="${level}"></td>
    <tool-tip for="${id}">${label} on a day.</tool-tip>`;
}

test('normalizes a GitHub username', () => {
  assert.equal(normalizeUsername('  @octocat  '), 'octocat');
  assert.throws(() => normalizeUsername('-not-valid'), GitHubGardenError);
});

test('parses GitHub contribution cells and counts', () => {
  const html = Array.from({ length: 336 }, (_, index) =>
    contributionCell(index, index === 335 ? 12_345 : index % 4, index % 5),
  ).join('\n');

  const result = parseContributionCalendar(html);
  assert.equal(result.length, 336);
  assert.deepEqual(result.at(-1), {
    count: 12_345,
    date: '2000-12-28',
    level: 0,
  });
});

test('rejects an unavailable contribution calendar', () => {
  assert.throws(() => parseContributionCalendar(contributionCell(0, 1, 1)), GitHubGardenError);
});
