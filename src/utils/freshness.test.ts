import assert from 'node:assert/strict';
import test from 'node:test';

import { formatGardenFreshness } from './freshness';

test('formats recent garden freshness in the selected language', () => {
  const syncedAt = new Date(2026, 6, 23, 18, 42);
  const now = new Date(2026, 6, 23, 19, 0);
  const expectedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
  }).format(syncedAt);

  assert.equal(
    formatGardenFreshness(syncedAt.toISOString(), 'en', now),
    `Updated ${expectedTime}`,
  );
  assert.equal(
    formatGardenFreshness(syncedAt.toISOString(), 'ja', now),
    `${expectedTime}に更新`,
  );
});

test('distinguishes yesterday from stale or missing data', () => {
  const now = new Date(2026, 6, 23, 8, 0);
  const yesterday = new Date(2026, 6, 22, 23, 0);
  const stale = new Date(2026, 6, 21, 8, 0);

  assert.equal(formatGardenFreshness(yesterday.toISOString(), 'en', now), 'Updated yesterday');
  assert.equal(formatGardenFreshness(stale.toISOString(), 'en', now), 'Tap to refresh');
  assert.equal(formatGardenFreshness(null, 'ja', now), 'タップして更新');
});
