import type { AppLanguage } from '../i18n/translations';

export const GARDEN_FRESHNESS_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function isPreviousCalendarDay(date: Date, now: Date): boolean {
  const previous = new Date(now);
  previous.setDate(previous.getDate() - 1);
  return (
    date.getFullYear() === previous.getFullYear() &&
    date.getMonth() === previous.getMonth() &&
    date.getDate() === previous.getDate()
  );
}

export function formatGardenFreshness(
  lastSyncedAt: string | null,
  language: AppLanguage,
  now = new Date(),
): string {
  const syncedAt = lastSyncedAt ? new Date(lastSyncedAt) : null;
  if (!syncedAt || !Number.isFinite(syncedAt.getTime())) {
    return language === 'ja' ? 'タップして更新' : 'Tap to refresh';
  }

  const age = Math.max(0, now.getTime() - syncedAt.getTime());
  if (age >= GARDEN_FRESHNESS_MAX_AGE_MS) {
    return language === 'ja' ? 'タップして更新' : 'Tap to refresh';
  }
  if (isPreviousCalendarDay(syncedAt, now)) {
    return language === 'ja' ? '昨日更新' : 'Updated yesterday';
  }

  const time = new Intl.DateTimeFormat(language === 'ja' ? 'ja-JP' : 'en-US', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
  }).format(syncedAt);
  return language === 'ja' ? `${time}に更新` : `Updated ${time}`;
}
