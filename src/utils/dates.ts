import type {
  ContributionDay,
  GardenPeriod,
  GardenStats,
  GrowthLevel,
} from '../types/garden';
import { type AppLanguage, localeFor } from '../i18n/translations';

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

function fillFromDate(
  source: ContributionDay[],
  start: Date,
  days: number,
): ContributionDay[] {
  const byDate = new Map(source.map((day) => [day.date, day]));

  return Array.from({ length: days }, (_, index) => {
    const date = toDateKey(addDays(start, index));
    return byDate.get(date) ?? { date, count: 0, level: 0 };
  });
}

export function selectPeriod(
  source: ContributionDay[],
  period: GardenPeriod,
  today = new Date(),
): ContributionDay[] {
  const year = today.getFullYear();
  const month = today.getMonth();

  if (period === 'week') {
    const mondayOffset = (today.getDay() + 6) % 7;
    return fillFromDate(source, addDays(today, -mondayOffset), 7);
  }

  if (period === 'month') {
    const monthLength = new Date(year, month + 1, 0).getDate();
    return fillFromDate(source, new Date(year, month, 1), monthLength);
  }

  const yearLength = new Date(year, 1, 29).getMonth() === 1 ? 366 : 365;
  return fillFromDate(source, new Date(year, 0, 1), yearLength);
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

export function getCurrentContributionStreak(
  days: ContributionDay[],
  today = new Date(),
): number {
  const byDate = new Map(days.map((day) => [day.date, day]));
  let cursor = new Date(today);
  const todayContribution = byDate.get(toDateKey(cursor));

  if (!todayContribution || todayContribution.count === 0) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while ((byDate.get(toDateKey(cursor))?.count ?? 0) > 0) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function generateDemoGarden(days = 365, today = new Date()): ContributionDay[] {
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(today, index - days + 1);
    const dateNumber =
      date.getFullYear() * 10_000 + (date.getMonth() + 1) * 100 + date.getDate();
    let hash = Math.imul(dateNumber ^ (dateNumber >>> 16), 0x45d9f3b);
    hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
    const signal = ((hash ^ (hash >>> 16)) >>> 0) / 0x1_0000_0000;
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const active = signal > (weekend ? 0.62 : 0.28);
    const level = active ? (Math.min(4, 1 + Math.floor(signal * 4)) as GrowthLevel) : 0;
    const count = level === 0 ? 0 : Math.max(1, Math.round(signal * level * 4));
    return { date: toDateKey(date), count, level };
  });
}

export function formatShortDate(key: string, language: AppLanguage = 'en'): string {
  return new Intl.DateTimeFormat(localeFor(language), { month: 'short', day: 'numeric' }).format(
    fromDateKey(key),
  );
}

export function formatWeekDateLabel(
  dateKey: string,
  week: readonly ContributionDay[],
): string {
  const date = fromDateKey(dateKey);
  const first = week.at(0);
  const last = week.at(-1);
  const crossesMonth =
    first !== undefined &&
    last !== undefined &&
    fromDateKey(first.date).getMonth() !== fromDateKey(last.date).getMonth();

  if (crossesMonth && date.getDate() === 1) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  return String(date.getDate());
}
