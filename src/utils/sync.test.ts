import assert from 'node:assert/strict';
import test from 'node:test';

import { refreshesCurrentGarden, shouldSyncOnForeground } from './sync';

const now = new Date(2026, 6, 24, 18, 30);

test('only a full or current-through-today request refreshes the current garden', () => {
  assert.equal(refreshesCurrentGarden(undefined, now), true);
  assert.equal(
    refreshesCurrentGarden({ from: '2026-07-01', to: '2026-07-24' }, now),
    true,
  );
  assert.equal(
    refreshesCurrentGarden({ from: '2024-01-01', to: '2024-12-31' }, now),
    false,
  );
});

test('foreground sync is due after fifteen minutes or without a valid sync time', () => {
  assert.equal(shouldSyncOnForeground(null, now), true);
  assert.equal(shouldSyncOnForeground('invalid', now), true);
  assert.equal(
    shouldSyncOnForeground(new Date(now.getTime() - 14 * 60 * 1000).toISOString(), now),
    false,
  );
  assert.equal(
    shouldSyncOnForeground(new Date(now.getTime() - 15 * 60 * 1000).toISOString(), now),
    true,
  );
});
