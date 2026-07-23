import { requireOptionalNativeModule } from 'expo';
import { Asset } from 'expo-asset';
import { copyAsync, getInfoAsync } from 'expo-file-system/legacy';
import { createElement } from 'react';
import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';

import { defaultGrassVarietyId, type GrassVarietyId } from '../design/grass';
import { widgetGrassAssets } from '../design/generatedWidgetGrassAssets';
import type { ContributionDay, WidgetSnapshot } from '../types/garden';
import type { AppLanguage } from '../i18n/translations';
import {
  getCurrentContributionStreak,
  getGardenStats,
  selectPeriod,
} from '../utils/dates';
import { makeWidgetTimeline } from './widgetTimeline';

const grassImageUrisPromises = new Map<GrassVarietyId, Promise<string[]>>();

async function loadGrassImageUris(
  widgetsDirectory: string,
  variety: GrassVarietyId,
): Promise<string[]> {
  const directory = widgetsDirectory.endsWith('/') ? widgetsDirectory : `${widgetsDirectory}/`;
  const existing = grassImageUrisPromises.get(variety);
  if (existing) return existing;

  const loading = Promise.all(
    widgetGrassAssets[variety].map(async (entry, level) => {
      const asset = Asset.fromModule(entry.module);
      await asset.downloadAsync();
      const destination = `${directory}detailed-grass-${variety}-${level}-${entry.fingerprint}.png`;
      const destinationInfo = await getInfoAsync(destination);
      if (!destinationInfo.exists) {
        await copyAsync({
          from: asset.localUri ?? asset.uri,
          to: destination,
        });
      }
      return destination;
    }),
  );
  grassImageUrisPromises.set(variety, loading);
  return loading;
}

export function makeWidgetSnapshot(
  days: ContributionDay[],
  username: string,
  language: AppLanguage = 'en',
  today = new Date(),
  lastSyncedAt: string | null = null,
): WidgetSnapshot {
  const week = selectPeriod(days, 'week', today);
  const month = selectPeriod(days, 'month', today);
  const stats = getGardenStats(week, today);
  const monthStats = getGardenStats(month, today);
  const monthFormatter = new Intl.DateTimeFormat(language === 'ja' ? 'ja-JP' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });
  return {
    grassVariety: defaultGrassVarietyId,
    language,
    lastSyncedAt,
    levels: week.map((day) => day.level),
    monthCurrentDay: today.getDate(),
    monthLabel: monthFormatter.format(today),
    monthLevels: Array.from({ length: 35 }, (_, index) => month[index]?.level ?? -1),
    monthTotal: monthStats.total,
    streak: getCurrentContributionStreak(days, today),
    total: stats.total,
    username,
    weekCurrentDayIndex: (today.getDay() + 6) % 7,
  };
}

export async function updateHomeWidgets(snapshot: WidgetSnapshot): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      if (!requireOptionalNativeModule('ExpoWidgets')) return;
      const [{ widgetsDirectory }, { default: GardenWidget }] = await Promise.all([
        import('expo-widgets'),
        import('./ios/GardenWidget'),
      ]);
      const grassVariety = snapshot.grassVariety ?? defaultGrassVarietyId;
      const props = {
        ...snapshot,
        grassImageUris: await loadGrassImageUris(widgetsDirectory, grassVariety),
        grassVariety,
      };
      GardenWidget.updateTimeline(makeWidgetTimeline(props));
    }

    if (Platform.OS === 'android') {
      const androidWidgetModule =
        TurboModuleRegistry.get('AndroidWidget') ?? NativeModules.AndroidWidget;
      if (!androidWidgetModule) return;

      const [{ requestWidgetUpdate }, { GardenAndroidWidget }] = await Promise.all([
        import('react-native-android-widget'),
        import('./android/GardenAndroidWidget'),
      ]);
      await requestWidgetUpdate({
        widgetName: 'Garden',
        renderWidget: ({ height, width }) =>
          createElement(GardenAndroidWidget, { height, snapshot, width }),
      });
    }
  } catch {
    // Expo Go cannot load widget extensions. Data is persisted and the next native build refreshes it.
  }
}
