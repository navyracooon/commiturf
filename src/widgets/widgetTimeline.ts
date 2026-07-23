import type { WidgetSnapshot } from '../types/garden';
import { GARDEN_FRESHNESS_MAX_AGE_MS } from '../utils/freshness';

export interface WidgetTimelineEntry<T extends WidgetSnapshot> {
  date: Date;
  props: T;
}

export function makeWidgetTimeline(
  snapshot: WidgetSnapshot,
  now = new Date(),
): WidgetTimelineEntry<WidgetSnapshot>[] {
  const safeSnapshot = {
    ...snapshot,
    lastSyncedAt: snapshot.lastSyncedAt ?? '',
  };

  if (safeSnapshot.username === 'your-garden') {
    return [{ date: now, props: safeSnapshot }];
  }

  const syncedAt = safeSnapshot.lastSyncedAt
    ? new Date(safeSnapshot.lastSyncedAt)
    : null;
  const staleAt = syncedAt
    ? new Date(syncedAt.getTime() + GARDEN_FRESHNESS_MAX_AGE_MS)
    : null;

  if (staleAt && Number.isFinite(staleAt.getTime()) && staleAt > now) {
    return [
      { date: now, props: safeSnapshot },
      { date: staleAt, props: { ...safeSnapshot, lastSyncedAt: '' } },
    ];
  }

  return [{ date: now, props: { ...safeSnapshot, lastSyncedAt: '' } }];
}
