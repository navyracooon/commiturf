import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchGitHubGarden, GitHubGardenError } from '../services/github';
import { loadGarden, saveGarden, saveWidgetSnapshot } from '../storage/gardenStorage';
import { type AppLanguage, type GardenErrorCode, translations } from '../i18n/translations';
import type { ContributionDay, GardenPeriod } from '../types/garden';
import { generateDemoGarden, getGardenStats, selectPeriod } from '../utils/dates';
import { makeWidgetSnapshot, updateHomeWidgets } from '../widgets/updateWidgets';

export function useGarden(period: GardenPeriod, language: AppLanguage) {
  const autoSyncStarted = useRef(false);
  const [days, setDays] = useState<ContributionDay[]>(() => generateDemoGarden());
  const [username, setUsername] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorCode, setErrorCode] = useState<GardenErrorCode | null>(null);

  const sync = useCallback(async (usernameInput?: string) => {
    const target = usernameInput ?? username;
    if (!target) return false;

    setErrorCode(null);
    setIsSyncing(true);
    try {
      const nextDays = await fetchGitHubGarden(target);
      const normalized = target.trim().replace(/^@/, '');
      const snapshot = makeWidgetSnapshot(nextDays, normalized, language);
      await saveGarden({ days: nextDays, username: normalized }, snapshot);
      setDays(nextDays);
      setUsername(normalized);
      void updateHomeWidgets(snapshot);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return true;
    } catch (caught) {
      setErrorCode(caught instanceof GitHubGardenError ? caught.code : 'network');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [language, username]);

  useEffect(() => {
    let active = true;
    loadGarden()
      .then((garden) => {
        if (!active || !garden) return;
        setDays(garden.days);
        setUsername(garden.username);
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
    void sync(username);
  }, [isHydrating, sync, username]);

  useEffect(() => {
    if (isHydrating) return;
    const snapshot = makeWidgetSnapshot(days, username ?? 'your-garden', language);
    void saveWidgetSnapshot(snapshot);
    void updateHomeWidgets(snapshot);
  }, [days, isHydrating, language, username]);

  const visibleDays = useMemo(() => selectPeriod(days, period), [days, period]);
  const stats = useMemo(() => getGardenStats(visibleDays), [visibleDays]);
  const error = errorCode ? translations[language].errors[errorCode] : null;

  return {
    days: visibleDays,
    error,
    isDemo: !username,
    isHydrating,
    isSyncing,
    setError: (next: string | null) => {
      if (next === null) setErrorCode(null);
    },
    stats,
    sync,
    username,
  };
}
