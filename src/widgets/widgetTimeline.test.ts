import assert from 'node:assert/strict';
import test from 'node:test';

import type { WidgetSnapshot } from '../types/garden';
import { makeWidgetTimeline } from './widgetTimeline';

function snapshot(lastSyncedAt: string | null, username = 'navyracooon'): WidgetSnapshot {
  return {
    language: 'en',
    lastSyncedAt,
    levels: [0, 1, 2, 3, 4, 0, 1],
    monthCurrentDay: 24,
    monthLabel: 'July 2026',
    monthLevels: Array.from({ length: 35 }, () => 0),
    monthTotal: 10,
    streak: 3,
    total: 5,
    username,
  };
}

const now = new Date('2026-07-24T09:00:00.000Z');

test('schedules a stale widget entry exactly 24 hours after sync', () => {
  const syncedAt = '2026-07-24T08:30:00.000Z';
  const entries = makeWidgetTimeline(snapshot(syncedAt), now);

  assert.equal(entries.length, 2);
  assert.equal(entries[0]?.props.lastSyncedAt, syncedAt);
  assert.equal(entries[1]?.date.toISOString(), '2026-07-25T08:30:00.000Z');
  assert.equal(entries[1]?.props.lastSyncedAt, null);
});

test('immediately marks an already stale widget for refresh', () => {
  const entries = makeWidgetTimeline(
    snapshot('2026-07-23T08:59:59.000Z'),
    now,
  );

  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.props.lastSyncedAt, null);
});

test('does not make a demo widget stale', () => {
  const demo = snapshot(null, 'your-garden');
  const entries = makeWidgetTimeline(demo, now);

  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.props, demo);
});
