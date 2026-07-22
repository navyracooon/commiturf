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
  levels: GrowthLevel[];
  streak: number;
  total: number;
  username: string;
}
