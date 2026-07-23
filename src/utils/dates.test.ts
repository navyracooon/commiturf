import assert from 'node:assert/strict';
import test from 'node:test';

import type { ContributionDay } from '../types/garden';
import { fillThroughToday, getGardenStats, selectPeriod } from './dates';

const garden: ContributionDay[] = [
  { date: '2026-07-17', count: 0, level: 0 },
  { date: '2026-07-18', count: 2, level: 1 },
  { date: '2026-07-19', count: 5, level: 3 },
  { date: '2026-07-20', count: 1, level: 1 },
  { date: '2026-07-21', count: 4, level: 2 },
];

test('fills missing calendar days through today', () => {
  const result = fillThroughToday(garden, 7, new Date(2026, 6, 22));
  assert.equal(result.length, 7);
  assert.equal(result[0]?.date, '2026-07-16');
  assert.equal(result.at(-1)?.date, '2026-07-22');
  assert.equal(result.at(-1)?.count, 0);
});

test('starts the month view on the first and ends it on the last day', () => {
  const result = selectPeriod(garden, 'month', new Date(2026, 6, 22));
  assert.equal(result.length, 31);
  assert.equal(result[0]?.date, '2026-07-01');
  assert.equal(result.at(-1)?.date, '2026-07-31');
});

test('starts the year view on January 1 and includes the full calendar year', () => {
  const result = selectPeriod(garden, 'year', new Date(2026, 6, 22));
  assert.equal(result.length, 365);
  assert.equal(result[0]?.date, '2026-01-01');
  assert.equal(result.at(-1)?.date, '2026-12-31');
});

test('includes February 29 when navigating to a leap year', () => {
  const result = selectPeriod(garden, 'year', new Date(2024, 6, 22));
  assert.equal(result.length, 366);
  assert.equal(result[59]?.date, '2024-02-29');
  assert.equal(result.at(-1)?.date, '2024-12-31');
});

test('starts the week view on Monday and includes future dates through Sunday', () => {
  const result = selectPeriod(garden, 'week', new Date(2026, 6, 22));
  assert.equal(result.length, 7);
  assert.equal(result[0]?.date, '2026-07-20');
  assert.equal(result.at(-1)?.date, '2026-07-26');
});

test('keeps a streak alive when today has no contributions yet', () => {
  const week = selectPeriod(garden, 'week', new Date(2026, 6, 22));
  const stats = getGardenStats(week, new Date(2026, 6, 22));
  assert.deepEqual(stats, {
    activeDays: 2,
    currentStreak: 2,
    strongestDay: { date: '2026-07-21', count: 4, level: 2 },
    total: 5,
  });
});
