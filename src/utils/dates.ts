import type {
  ContributionDay,
  GardenPeriod,
  GardenStats,
  GrowthLevel,
} from '../types/garden';

export const periodLengths: Record<GardenPeriod, number> = {
  week: 7,
  month: 30,
  year: 365,
};

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function fillThroughToday(
  source: ContributionDay[],
  days: number,
  today = new Date(),
): ContributionDay[] {
  const byDate = new Map(source.map((day) => [day.date, day]));

  return Array.from({ length: days }, (_, index) => {
    const date = toDateKey(addDays(today, index - days + 1));
    return byDate.get(date) ?? { date, count: 0, level: 0 };
  });
}

export function selectPeriod(
  source: ContributionDay[],
  period: GardenPeriod,
  today = new Date(),
): ContributionDay[] {
  return fillThroughToday(source, periodLengths[period], today);
}

export function getGardenStats(
  days: ContributionDay[],
  today = new Date(),
): GardenStats {
  const chronological = [...days].sort((left, right) => left.date.localeCompare(right.date));
  const todayKey = toDateKey(today);
  const throughToday = chronological.filter((day) => day.date <= todayKey);
  const total = throughToday.reduce((sum, day) => sum + day.count, 0);
  const activeDays = throughToday.filter((day) => day.count > 0).length;
  const strongestDay = throughToday.reduce<ContributionDay | null>((best, day) => {
    if (!best || day.count > best.count) return day;
    return best;
  }, null);

  let cursor = throughToday.length - 1;
  if (throughToday[cursor]?.date === todayKey && throughToday[cursor]?.count === 0) cursor -= 1;

  let currentStreak = 0;
  while (cursor >= 0 && (throughToday[cursor]?.count ?? 0) > 0) {
    currentStreak += 1;
    cursor -= 1;
  }

  return { activeDays, currentStreak, strongestDay, total };
}

export function generateDemoGarden(days = 365, today = new Date()): ContributionDay[] {
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(today, index - days + 1);
    const dayNumber = Math.floor(date.getTime() / 86_400_000);
    const signal = Math.abs(Math.sin(dayNumber * 12.9898) * 43758.5453) % 1;
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const active = signal > (weekend ? 0.62 : 0.28);
    const level = active ? (Math.min(4, 1 + Math.floor(signal * 4)) as GrowthLevel) : 0;
    const count = level === 0 ? 0 : Math.max(1, Math.round(signal * level * 4));
    return { date: toDateKey(date), count, level };
  });
}

export function formatShortDate(key: string): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(fromDateKey(key));
}
