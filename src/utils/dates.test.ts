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

test('fills the month view as a complete five-week grid', () => {
  const result = selectPeriod(garden, 'month', new Date(2026, 6, 22));
  assert.equal(result.length, 35);
  assert.equal(result[0]?.date, '2026-06-18');
  assert.equal(result.at(-1)?.date, '2026-07-22');
});

test('keeps a streak alive when today has no contributions yet', () => {
  const week = selectPeriod(garden, 'week', new Date(2026, 6, 22));
  const stats = getGardenStats(week, new Date(2026, 6, 22));
  assert.deepEqual(stats, {
    activeDays: 4,
    currentStreak: 4,
    strongestDay: { date: '2026-07-19', count: 5, level: 3 },
    total: 12,
  });
});
