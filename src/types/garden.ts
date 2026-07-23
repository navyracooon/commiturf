import type { AppLanguage } from '../i18n/translations';
import type { GrassVarietyId } from '../design/grass';

export type GrowthLevel = 0 | 1 | 2 | 3 | 4;

export type GardenPeriod = 'week' | 'month' | 'year';

export interface ContributionDay {
  date: string;
  count: number;
  level: GrowthLevel;
}

export interface GardenStats {
  activeDays: number;
  currentStreak: number;
  strongestDay: ContributionDay | null;
  total: number;
}

export interface WidgetSnapshot {
  grassVariety?: GrassVarietyId;
  grassImageUris?: string[];
  language: AppLanguage;
  lastSyncedAt: string | null;
  levels: GrowthLevel[];
  monthCurrentDay: number;
  monthLabel: string;
  monthLevels: Array<GrowthLevel | -1>;
  monthTotal: number;
  streak: number;
  total: number;
  username: string;
  weekCurrentDayIndex?: number;
}
