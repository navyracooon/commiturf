import { requireOptionalNativeModule } from 'expo';
import { createElement } from 'react';
import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';

import type { ContributionDay, WidgetSnapshot } from '../types/garden';
import type { AppLanguage } from '../i18n/translations';
import { getGardenStats, selectPeriod } from '../utils/dates';

export function makeWidgetSnapshot(
  days: ContributionDay[],
  username: string,
  language: AppLanguage = 'en',
  today = new Date(),
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
    language,
    levels: week.map((day) => day.level),
    monthCurrentDay: today.getDate(),
    monthLabel: monthFormatter.format(today),
    monthLevels: Array.from({ length: 35 }, (_, index) => month[index]?.level ?? -1),
    monthTotal: monthStats.total,
    streak: stats.currentStreak,
    total: stats.total,
    username,
  };
}

export async function updateHomeWidgets(snapshot: WidgetSnapshot): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      if (!requireOptionalNativeModule('ExpoWidgets')) return;
      const { default: GardenWidget } = require('./ios/GardenWidget') as typeof import('./ios/GardenWidget');
      GardenWidget.updateSnapshot(snapshot);
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
