import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchGitHubGarden, GitHubGardenError } from '../services/github';
import { loadGarden, saveGarden } from '../storage/gardenStorage';
import type { ContributionDay, GardenPeriod } from '../types/garden';
import { generateDemoGarden, getGardenStats, selectPeriod } from '../utils/dates';
import { makeWidgetSnapshot, updateHomeWidgets } from '../widgets/updateWidgets';

export function useGarden(period: GardenPeriod) {
  const autoSyncStarted = useRef(false);
  const widgetsBootstrapped = useRef(false);
  const [days, setDays] = useState<ContributionDay[]>(() => generateDemoGarden());
  const [username, setUsername] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(async (usernameInput?: string) => {
    const target = usernameInput ?? username;
    if (!target) return false;

    setError(null);
    setIsSyncing(true);
    try {
      const nextDays = await fetchGitHubGarden(target);
      const normalized = target.trim().replace(/^@/, '');
      const snapshot = makeWidgetSnapshot(nextDays, normalized);
      await saveGarden({ days: nextDays, username: normalized }, snapshot);
      setDays(nextDays);
      setUsername(normalized);
      void updateHomeWidgets(snapshot);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return true;
    } catch (caught) {
      setError(
        caught instanceof GitHubGardenError
          ? caught.message
          : 'Could not reach GitHub. Your saved garden is still safe.',
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [username]);

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
    if (isHydrating || widgetsBootstrapped.current) return;
    widgetsBootstrapped.current = true;
    const snapshot = makeWidgetSnapshot(days, username ?? 'your-garden');
    void updateHomeWidgets(snapshot);
  }, [days, isHydrating, username]);

  const visibleDays = useMemo(() => selectPeriod(days, period), [days, period]);
  const stats = useMemo(() => getGardenStats(visibleDays), [visibleDays]);

  return {
    days: visibleDays,
    error,
    isDemo: !username,
    isHydrating,
    isSyncing,
    setError,
    stats,
    sync,
    username,
  };
}
