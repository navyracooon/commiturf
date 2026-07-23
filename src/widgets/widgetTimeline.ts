import type { WidgetSnapshot } from '../types/garden';
import { GARDEN_FRESHNESS_MAX_AGE_MS } from '../utils/freshness';

export interface WidgetTimelineEntry<T extends WidgetSnapshot> {
  date: Date;
  props: T;
}

export function makeWidgetTimeline<T extends WidgetSnapshot>(
  snapshot: T,
  now = new Date(),
): WidgetTimelineEntry<T>[] {
  if (snapshot.username === 'your-garden') {
    return [{ date: now, props: snapshot }];
  }

  const syncedAt = snapshot.lastSyncedAt
    ? new Date(snapshot.lastSyncedAt)
    : null;
  const staleAt = syncedAt
    ? new Date(syncedAt.getTime() + GARDEN_FRESHNESS_MAX_AGE_MS)
    : null;

  if (staleAt && Number.isFinite(staleAt.getTime()) && staleAt > now) {
    return [
      { date: now, props: snapshot },
      { date: staleAt, props: { ...snapshot, lastSyncedAt: null } },
    ];
  }

  return [{ date: now, props: { ...snapshot, lastSyncedAt: null } }];
}
