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
      };
    } catch {
      // Use the safe initial snapshot below if stored data was interrupted.
    }
  }

  return {
    language: 'en',
    levels: [0, 0, 0, 0, 0, 0, 0],
    streak: 0,
    total: 0,
    username: 'your-garden',
  };
}
