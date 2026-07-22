import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { type AppLanguage, translations } from '../i18n/translations';
import type { GardenPeriod } from '../types/garden';

interface PeriodControlProps {
  language: AppLanguage;
  onChange: (period: GardenPeriod) => void;
  value: GardenPeriod;
}

const periods: GardenPeriod[] = ['week', 'month', 'year'];

export function PeriodControl({ language, onChange, value }: PeriodControlProps) {
  const labels = translations[language].periods;

  return (
    <View accessibilityRole="tablist" style={styles.control}>
      {periods.map((period) => {
        const selected = period === value;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={period}
            onPress={() => {
              void Haptics.selectionAsync();
              onChange(period);
            }}
            style={({ pressed }) => [
              styles.item,
              selected && styles.itemSelected,
              pressed && styles.itemPressed,
            ]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{labels[period]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  control: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(20, 55, 45, 0.07)',
    borderRadius: 18,
    flexDirection: 'row',
    padding: 4,
  },
  item: {
    alignItems: 'center',
    borderRadius: 14,
    minWidth: 72,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  itemPressed: {
    opacity: 0.72,
  },
  itemSelected: {
    backgroundColor: colors.card,
    elevation: 2,
    shadowColor: colors.forest,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.11,
    shadowRadius: 5,
  },
  label: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  labelSelected: {
    color: colors.ink,
    fontWeight: '700',
  },
});
