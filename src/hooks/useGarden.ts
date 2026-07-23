import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  type ContributionRange,
  fetchGitHubGarden,
  GitHubGardenError,
} from '../services/github';
import {
  clearGarden,
  loadGarden,
  saveGarden,
  saveWidgetSnapshot,
} from '../storage/gardenStorage';
import { type AppLanguage, type GardenErrorCode, translations } from '../i18n/translations';
import type { ContributionDay, GardenPeriod } from '../types/garden';
import { generateDemoGarden, getGardenStats, selectPeriod, toDateKey } from '../utils/dates';
import { makeWidgetSnapshot, updateHomeWidgets } from '../widgets/updateWidgets';

function mergeContributionDays(
  current: ContributionDay[],
  incoming: ContributionDay[],
): ContributionDay[] {
  const byDate = new Map(current.map((day) => [day.date, day]));
  incoming.forEach((day) => byDate.set(day.date, day));
  return [...byDate.values()].sort((left, right) => left.date.localeCompare(right.date));
}

type SyncMode = 'idle' | 'refresh' | 'connect' | 'background' | 'period';
type ActiveSyncMode = Exclude<SyncMode, 'idle'>;

export function useGarden(
  period: GardenPeriod,
  language: AppLanguage,
  referenceDate = new Date(),
) {
  const autoSyncStarted = useRef(false);
  const activeRequest = useRef(false);
  const lastRequestedView = useRef<string | null>(null);
  const [days, setDays] = useState<ContributionDay[]>(() => generateDemoGarden(366 * 5));
  const daysRef = useRef(days);
  const [username, setUsername] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [syncMode, setSyncMode] = useState<SyncMode>('idle');
  const [errorCode, setErrorCode] = useState<GardenErrorCode | null>(null);

  const performSync = useCallback(async (
    usernameInput?: string,
    range?: ContributionRange,
    feedback = true,
    mode: ActiveSyncMode = 'background',
  ) => {
    const target = usernameInput ?? username;
    if (!target || activeRequest.current) return false;

    activeRequest.current = true;
    setErrorCode(null);
    setSyncMode(mode);
    try {
      const fetchedDays = await fetchGitHubGarden(target, range);
      const normalized = target.trim().replace(/^@/, '');
      const nextDays = mergeContributionDays(
        normalized === username ? daysRef.current : [],
        fetchedDays,
      );
      const snapshot = makeWidgetSnapshot(nextDays, normalized, language);
      try {
        await saveGarden({ days: nextDays, username: normalized }, snapshot);
      } catch {
        setErrorCode('storageUnavailable');
        if (feedback) {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        return false;
      }
      daysRef.current = nextDays;
      setDays(nextDays);
      setUsername(normalized);
      void updateHomeWidgets(snapshot);
      autoSyncStarted.current = true;
      if (feedback) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      return true;
    } catch (caught) {
      setErrorCode(caught instanceof GitHubGardenError ? caught.code : 'network');
      if (feedback) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return false;
    } finally {
      activeRequest.current = false;
      setSyncMode('idle');
    }
  }, [language, username]);

  useEffect(() => {
    let active = true;
    loadGarden()
      .then((garden) => {
        if (!active || !garden) return;
        daysRef.current = garden.days;
        setDays(garden.days);
        setUsername(garden.username);
      })
      .catch(() => {
        if (active) setErrorCode('storageUnavailable');
      })
      .finally(() => {
        if (active) setIsHydrating(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isHydrating || !username || autoSyncStarted.current) return;
    autoSyncStarted.current = true;
    void performSync(username, undefined, false, 'background');
  }, [isHydrating, performSync, username]);

  useEffect(() => {
    if (isHydrating) return;
    const snapshot = makeWidgetSnapshot(days, username ?? 'your-garden', language);
    void saveWidgetSnapshot(snapshot).catch(() => undefined);
    void updateHomeWidgets(snapshot);
  }, [days, isHydrating, language, username]);

  const disconnect = useCallback(async () => {
    if (activeRequest.current) return false;

    const demoDays = generateDemoGarden(366 * 5);
    const snapshot = makeWidgetSnapshot(demoDays, 'your-garden', language);
    try {
      await clearGarden();
    } catch {
      setErrorCode('storageUnavailable');
      return false;
    }

    daysRef.current = demoDays;
    autoSyncStarted.current = false;
    lastRequestedView.current = null;
    setDays(demoDays);
    setErrorCode(null);
    setUsername(null);
    void saveWidgetSnapshot(snapshot).catch(() => undefined);
    void updateHomeWidgets(snapshot);
    return true;
  }, [language]);

  const visibleDays = useMemo(
    () => selectPeriod(days, period, referenceDate),
    [days, period, referenceDate],
  );

  const sync = useCallback(
    (usernameInput?: string) => {
      if (usernameInput) {
        return performSync(usernameInput, undefined, true, 'connect');
      }

      const todayKey = toDateKey(new Date());
      const refreshableDays = visibleDays.filter((day) => day.date <= todayKey);
      const from = refreshableDays.at(0)?.date;
      const to = refreshableDays.at(-1)?.date;
      const range = from && to && to !== todayKey ? { from, to } : undefined;
      return performSync(undefined, range, true, 'refresh');
    },
    [performSync, visibleDays],
  );

  useEffect(() => {
    if (isHydrating || syncMode !== 'idle' || !username) return;

    const todayKey = toDateKey(new Date());
    const requiredDays = visibleDays.filter((day) => day.date <= todayKey);
    const from = requiredDays.at(0)?.date;
    const to = requiredDays.at(-1)?.date;
    if (!from || !to) return;

    // The current period is already refreshed by the full-calendar background sync.
    // Resetting this key ensures returning to a past view revalidates it again.
    if (to === todayKey) {
      lastRequestedView.current = null;
      return;
    }

    const viewKey = `${username}:${period}:${from}:${to}`;
    if (lastRequestedView.current === viewKey) return;

    const availableDates = new Set(days.map((day) => day.date));
    const hasCachedRange = requiredDays.every((day) => availableDates.has(day.date));

    lastRequestedView.current = viewKey;
    void performSync(
      username,
      { from, to },
      false,
      hasCachedRange ? 'background' : 'period',
    );
  }, [days, isHydrating, performSync, period, syncMode, username, visibleDays]);

  const stats = useMemo(() => getGardenStats(visibleDays), [visibleDays]);
  const error = errorCode ? translations[language].errors[errorCode] : null;
  const todayKey = toDateKey(new Date());
  const visibleThroughToday = visibleDays.filter((day) => day.date <= todayKey);
  const visibleFrom = visibleThroughToday.at(0)?.date;
  const visibleTo = visibleThroughToday.at(-1)?.date;
  const cachedDates = new Set(days.map((day) => day.date));
  const hasVisibleCache = visibleThroughToday.every((day) => cachedDates.has(day.date));

  return {
    days: visibleDays,
    disconnect,
    error,
    isDemo: !username,
    isHydrating,
    isLoadingPeriod:
      Boolean(username && visibleFrom && visibleTo && visibleTo !== todayKey) &&
      !hasVisibleCache,
    isRefreshing: syncMode === 'refresh',
    isSyncing: syncMode !== 'idle',
    setError: (next: string | null) => {
      if (next === null) setErrorCode(null);
    },
    stats,
    sync,
    username,
  };
}
