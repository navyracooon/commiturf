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
  username: string;
}

export async function loadGarden(): Promise<StoredGarden | null> {
  const [username, rawGarden] = await Promise.all([
    AsyncStorage.getItem(USERNAME_KEY),
    AsyncStorage.getItem(GARDEN_KEY),
  ]);

  if (!username && !rawGarden) return null;
  if (!username || !rawGarden) {
    await clearGarden();
    return null;
  }

  try {
    const days = JSON.parse(rawGarden) as unknown;
    if (Array.isArray(days) && days.every(isContributionDay)) {
      return { days, username };
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

export async function saveGarden(garden: StoredGarden, widget: WidgetSnapshot): Promise<void> {
  await AsyncStorage.multiSet([
    [USERNAME_KEY, garden.username],
    [GARDEN_KEY, JSON.stringify(garden.days)],
    [WIDGET_SNAPSHOT_KEY, JSON.stringify(widget)],
  ]);
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
      };
    } catch {
      // Use the safe initial snapshot below if stored data was interrupted.
    }
  }

  return {
    language: 'en',
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
  };
}
