import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import type { GardenStats } from '../types/garden';
import { formatShortDate } from '../utils/dates';

interface StatsPanelProps {
  stats: GardenStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const items = [
    { label: 'Contributions', value: stats.total.toLocaleString('en-US') },
    { label: 'Day streak', value: `${stats.currentStreak}` },
    {
      label: 'Lushest day',
      value: stats.strongestDay?.count
        ? `${stats.strongestDay.count} · ${formatShortDate(stats.strongestDay.date)}`
        : '—',
    },
  ];

  return (
    <View style={styles.panel}>
      {items.map((item, index) => (
        <View key={item.label} style={[styles.item, index > 0 && styles.itemBorder]}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.value}>
            {item.value}
          </Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  itemBorder: {
    borderLeftColor: colors.line,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  label: {
    color: colors.inkMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.15,
    marginTop: 5,
  },
  panel: {
    backgroundColor: 'rgba(251, 250, 244, 0.78)',
    borderColor: 'rgba(255,255,255,0.72)',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  value: {
    color: colors.ink,
    fontSize: 17,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
