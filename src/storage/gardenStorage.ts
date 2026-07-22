import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ContributionDay, WidgetSnapshot } from '../types/garden';

const USERNAME_KEY = '@commiturf/username';
const GARDEN_KEY = '@commiturf/garden';
export const WIDGET_SNAPSHOT_KEY = '@commiturf/widget-snapshot';

export interface StoredGarden {
  days: ContributionDay[];
  username: string;
}

export async function loadGarden(): Promise<StoredGarden | null> {
  const [username, rawGarden] = await Promise.all([
    AsyncStorage.getItem(USERNAME_KEY),
    AsyncStorage.getItem(GARDEN_KEY),
  ]);

  if (!username || !rawGarden) return null;

  try {
    const days = JSON.parse(rawGarden) as ContributionDay[];
    return Array.isArray(days) ? { days, username } : null;
  } catch {
    return null;
  }
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
