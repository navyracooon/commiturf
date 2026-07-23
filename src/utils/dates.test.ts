import assert from 'node:assert/strict';
import test from 'node:test';

import type { ContributionDay } from '../types/garden';
import {
  fillThroughToday,
  formatWeekDateLabel,
  generateDemoGarden,
  getCurrentContributionStreak,
  getGardenStats,
  selectPeriod,
} from './dates';

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

test('adds the month only to the first day when a week crosses a month', () => {
  const result = selectPeriod(garden, 'week', new Date(2026, 6, 30));
  assert.deepEqual(
    result.map((day) => formatWeekDateLabel(day.date, result)),
    ['27', '28', '29', '30', '31', '8/1', '2'],
  );
});

test('shows day numbers only when a week stays in one month', () => {
  const result = selectPeriod(garden, 'week', new Date(2026, 6, 22));
  assert.deepEqual(
    result.map((day) => formatWeekDateLabel(day.date, result)),
    ['20', '21', '22', '23', '24', '25', '26'],
  );
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

test('counts the current streak across a week boundary', () => {
  const days: ContributionDay[] = [
    { date: '2026-07-17', count: 3, level: 2 },
    { date: '2026-07-18', count: 1, level: 1 },
    { date: '2026-07-19', count: 4, level: 3 },
    { date: '2026-07-20', count: 2, level: 2 },
    { date: '2026-07-21', count: 0, level: 0 },
  ];

  assert.equal(getCurrentContributionStreak(days, new Date(2026, 6, 20)), 4);
});

test('does not count a streak across a missing calendar day', () => {
  const days: ContributionDay[] = [
    { date: '2026-07-18', count: 3, level: 2 },
    { date: '2026-07-20', count: 2, level: 2 },
  ];

  assert.equal(getCurrentContributionStreak(days, new Date(2026, 6, 20)), 1);
});

test('maps each calendar date to stable demo growth across install dates', () => {
  const earlierInstall = generateDemoGarden(20, new Date(2026, 6, 24));
  const laterInstall = generateDemoGarden(30, new Date(2026, 6, 30));
  const laterByDate = new Map(laterInstall.map((day) => [day.date, day]));

  assert.deepEqual(
    earlierInstall.map((day) => laterByDate.get(day.date)),
    earlierInstall,
  );
  assert.equal(earlierInstall.at(-1)?.date, '2026-07-24');
  assert.equal(laterInstall.at(-1)?.date, '2026-07-30');
});
