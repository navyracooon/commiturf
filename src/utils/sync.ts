import type { ContributionRange } from '../services/github';
import { toDateKey } from './dates';

export const FOREGROUND_SYNC_INTERVAL_MS = 15 * 60 * 1000;

export function refreshesCurrentGarden(
  range: ContributionRange | undefined,
  now = new Date(),
): boolean {
  return range === undefined || range.to === toDateKey(now);
}

export function shouldSyncOnForeground(
  lastSyncedAt: string | null,
  now = new Date(),
  intervalMs = FOREGROUND_SYNC_INTERVAL_MS,
): boolean {
  if (!lastSyncedAt) return true;

  const syncedAt = Date.parse(lastSyncedAt);
  return !Number.isFinite(syncedAt) || now.getTime() - syncedAt >= intervalMs;
}
