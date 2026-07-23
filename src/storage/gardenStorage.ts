import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ContributionDay, WidgetSnapshot } from '../types/garden';

const USERNAME_KEY = '@commiturf/username';
const GARDEN_KEY = '@commiturf/garden';
export const WIDGET_SNAPSHOT_KEY = '@commiturf/widget-snapshot';

function isContributionDay(value: unknown): value is ContributionDay {
  if (!value || typeof value !== 'object') return false;
  const day = value as Partial<ContributionDay>;
  return (
    typeof day.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(day.date) &&
    typeof day.count === 'number' &&
    Number.isFinite(day.count) &&
    Number.isInteger(day.count) &&
    day.count >= 0 &&
    Number.isInteger(day.level) &&
    typeof day.level === 'number' &&
    day.level >= 0 &&
    day.level <= 4
  );
}

export interface StoredGarden {
  days: ContributionDay[];
  lastSyncedAt: string | null;
  schemaVersion: 1;
  username: string;
}

export async function loadGarden(): Promise<StoredGarden | null> {
  const [username, rawGarden] = await Promise.all([
    AsyncStorage.getItem(USERNAME_KEY),
    AsyncStorage.getItem(GARDEN_KEY),
  ]);

  if (!rawGarden) {
    if (!username) return null;
    await clearGarden();
    return null;
  }

  try {
    const stored = JSON.parse(rawGarden) as unknown;
    if (username && Array.isArray(stored) && stored.every(isContributionDay)) {
      return { days: stored, lastSyncedAt: null, schemaVersion: 1, username };
    }
    if (stored && typeof stored === 'object') {
      const garden = stored as Partial<StoredGarden>;
      const validSyncTime =
        garden.lastSyncedAt === null ||
        (typeof garden.lastSyncedAt === 'string' &&
          Number.isFinite(Date.parse(garden.lastSyncedAt)));
      if (
        garden.schemaVersion === 1 &&
        typeof garden.username === 'string' &&
        garden.username.length > 0 &&
        Array.isArray(garden.days) &&
        garden.days.every(isContributionDay) &&
        validSyncTime
      ) {
        return garden as StoredGarden;
      }
    }
  } catch {
    // Invalid or interrupted local data is removed below instead of being retried forever.
  }

  await clearGarden();
  return null;
}

export async function clearGarden(): Promise<void> {
  await AsyncStorage.multiRemove([USERNAME_KEY, GARDEN_KEY, WIDGET_SNAPSHOT_KEY]);
}

export async function saveGarden(
  garden: StoredGarden,
  widget?: WidgetSnapshot,
): Promise<void> {
  const entries: [string, string][] = [
    [USERNAME_KEY, garden.username],
    [GARDEN_KEY, JSON.stringify(garden)],
  ];
  if (widget) entries.push([WIDGET_SNAPSHOT_KEY, JSON.stringify(widget)]);
  await AsyncStorage.multiSet(entries);
}

export async function saveWidgetSnapshot(widget: WidgetSnapshot): Promise<void> {
  await AsyncStorage.setItem(WIDGET_SNAPSHOT_KEY, JSON.stringify(widget));
}

export async function loadWidgetSnapshot(): Promise<WidgetSnapshot> {
  const rawSnapshot = await AsyncStorage.getItem(WIDGET_SNAPSHOT_KEY);
  if (rawSnapshot) {
    try {
      const snapshot = JSON.parse(rawSnapshot) as WidgetSnapshot;
      return {
        ...snapshot,
        language: snapshot.language === 'ja' ? 'ja' : 'en',
        lastSyncedAt:
          typeof snapshot.lastSyncedAt === 'string' &&
          Number.isFinite(Date.parse(snapshot.lastSyncedAt))
            ? snapshot.lastSyncedAt
            : null,
        monthCurrentDay: snapshot.monthCurrentDay ?? new Date().getDate(),
        monthLabel:
          snapshot.monthLabel ??
          new Intl.DateTimeFormat(snapshot.language === 'ja' ? 'ja-JP' : 'en-US', {
            month: 'long',
            year: 'numeric',
          }).format(new Date()),
        monthLevels: Array.from({ length: 35 }, (_, index) => {
          const level = snapshot.monthLevels?.[index];
          return level === 0 || level === 1 || level === 2 || level === 3 || level === 4
            ? level
            : -1;
        }),
        monthTotal: snapshot.monthTotal ?? 0,
        weekCurrentDayIndex:
          typeof snapshot.weekCurrentDayIndex === 'number'
            ? Math.max(0, Math.min(6, snapshot.weekCurrentDayIndex))
            : (new Date().getDay() + 6) % 7,
      };
    } catch {
      // Use the safe initial snapshot below if stored data was interrupted.
    }
  }

  return {
    language: 'en',
    lastSyncedAt: null,
    levels: [0, 0, 0, 0, 0, 0, 0],
    monthCurrentDay: new Date().getDate(),
    monthLabel: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
      new Date(),
    ),
    monthLevels: Array.from({ length: 35 }, () => -1),
    monthTotal: 0,
    streak: 0,
    total: 0,
    username: 'your-garden',
    weekCurrentDayIndex: (new Date().getDay() + 6) % 7,
  };
}
