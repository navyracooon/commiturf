import { LinearGradient } from 'expo-linear-gradient';
import { memo, useMemo } from 'react';
import type { Animated as AnimatedType } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Polygon } from 'react-native-svg';

import { colors } from '../theme/colors';
import { type AppLanguage, localeFor, translations } from '../i18n/translations';
import type { ContributionDay, GardenPeriod } from '../types/garden';
import { formatShortDate, fromDateKey } from '../utils/dates';
import { GrassTuft } from './GrassTuft';
import { WindLines } from './WindLines';
import { useWind } from '../hooks/useWind';

interface GardenFieldProps {
  days: ContributionDay[];
  language: AppLanguage;
  period: GardenPeriod;
}

const YearField = memo(function YearField({ days }: { days: ContributionDay[] }) {
  return (
    <View style={styles.yearFrame}>
      <Svg width="100%" height="100%" viewBox="0 0 360 202">
        {days.map((day, index) => {
          const week = Math.floor(index / 7);
          const row = index % 7;
          const band = Math.floor(week / 27);
          const column = week % 27;
          const x = 4 + column * 13;
          const y = 12 + row * 12.5 + band * 96;
          const height = day.level * 2.1;
          const growth = colors.growth[day.level];

          return (
            <G key={day.date}>
              <Polygon
                points={`${x},${y} ${x + 4},${y - 2.3} ${x + 8},${y} ${x + 4},${y + 2.3}`}
                fill={day.level === 0 ? 'rgba(89,90,67,0.17)' : 'rgba(43,91,58,0.20)'}
              />
              {day.level > 0 ? (
                <>
                  <Line x1={x + 4} y1={y} x2={x + 4.8} y2={y - 3 - height} stroke={growth} strokeLinecap="round" strokeWidth="1.7" />
                  <Line x1={x + 4} y1={y} x2={x + 1.8} y2={y - 1.5 - height * 0.72} stroke={growth} strokeLinecap="round" strokeWidth="1.25" />
                  {day.level >= 3 ? (
                    <Line x1={x + 4} y1={y} x2={x + 7.2} y2={y - 2 - height * 0.8} stroke={growth} strokeLinecap="round" strokeWidth="1.15" />
                  ) : null}
                  {day.level === 4 ? <Circle cx={x + 4.8} cy={y - 3 - height} fill={colors.sun} r="1.25" /> : null}
                </>
              ) : null}
            </G>
          );
        })}
      </Svg>
    </View>
  );
});

function DetailedField({
  days,
  language,
  period,
  sway,
}: GardenFieldProps & {
  sway: AnimatedType.AnimatedInterpolation<string | number>;
}) {
  const isWeek = period === 'week';
  const visibleDays = isWeek ? days.slice(-7) : days.slice(-35);
  const weekday = useMemo(
    () => new Intl.DateTimeFormat(localeFor(language), { weekday: 'narrow' }),
    [language],
  );

  if (isWeek) {
    return (
      <View style={styles.weekRow}>
        {visibleDays.map((day) => (
          <View key={day.date} style={styles.weekPlot}>
            <View style={[styles.soil, styles.soilWeek]} />
            <GrassTuft level={day.level} size={54} sway={sway} />
            <Text style={styles.plotLabel}>{weekday.format(fromDateKey(day.date))}</Text>
          </View>
        ))}
      </View>
    );
  }

  const rows = Array.from({ length: 5 }, (_, row) => visibleDays.slice(row * 7, row * 7 + 7));

  return (
    <View style={styles.monthGrid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.monthRow}>
          {row.map((day) => (
            <View key={day.date} style={styles.monthPlot}>
              <View style={[styles.soil, styles.soilMonth]} />
              <GrassTuft level={day.level} size={32} sway={sway} />
              <Text style={[styles.plotLabel, styles.monthLabel]}>
                {fromDateKey(day.date).getDate()}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export function GardenField({ days, language, period }: GardenFieldProps) {
  const hasWind = period !== 'year';
  const { sway, windOpacity, windTranslate } = useWind(hasWind);
  const messages = translations[language].garden;
  const start = days.at(0)?.date;
  const end = days.at(-1)?.date;

  return (
    <View style={styles.shadow}>
      <LinearGradient
        colors={['#DCEBD3', '#BBD9B9', '#8CB895']}
        end={{ x: 0.85, y: 1 }}
        start={{ x: 0.1, y: 0 }}
        style={styles.card}
      >
        <View style={styles.sunGlow} />
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.eyebrow}>{messages.eyebrow}</Text>
            <Text style={styles.range}>
              {start && end
                ? `${formatShortDate(start, language)} — ${formatShortDate(end, language)}`
                : messages.takingRoot}
            </Text>
          </View>
          {hasWind ? (
            <View style={styles.weatherPill}>
              <View style={styles.windDot} />
              <Text style={styles.weatherText}>{messages.breeze}</Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.field, period === 'year' && styles.fieldYear]}>
          {period === 'year' ? (
            <YearField days={days} />
          ) : (
            <DetailedField days={days} language={language} period={period} sway={sway} />
          )}
        </View>

        {hasWind ? <WindLines opacity={windOpacity} translateX={windTranslate} /> : null}
        <LinearGradient
          colors={['transparent', 'rgba(25, 73, 50, 0.12)']}
          pointerEvents="none"
          style={styles.groundShade}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 30,
    minHeight: 326,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 3,
  },
  eyebrow: {
    color: 'rgba(18, 60, 46, 0.58)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.7,
  },
  field: {
    flex: 1,
    justifyContent: 'flex-end',
    minHeight: 228,
    paddingBottom: 18,
    zIndex: 2,
  },
  fieldYear: {
    justifyContent: 'center',
    paddingBottom: 4,
  },
  groundShade: {
    bottom: 0,
    height: 120,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  monthGrid: {
    height: 210,
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  monthLabel: {
    bottom: 0,
    fontSize: 8,
  },
  monthPlot: {
    alignItems: 'center',
    flex: 1,
    height: 42,
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  monthRow: {
    flexDirection: 'row',
    height: 42,
  },
  plotLabel: {
    bottom: -10,
    color: 'rgba(18, 60, 46, 0.54)',
    fontSize: 10,
    fontWeight: '700',
    position: 'absolute',
  },
  range: {
    color: colors.forest,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.25,
    marginTop: 4,
  },
  shadow: {
    backgroundColor: '#ACCBAA',
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#315F48',
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  soil: {
    backgroundColor: 'rgba(91, 74, 50, 0.19)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    position: 'absolute',
  },
  soilMonth: {
    borderRadius: 12,
    bottom: 2,
    height: 6,
    width: 28,
  },
  soilWeek: {
    borderRadius: 18,
    bottom: 3,
    height: 11,
    width: 48,
  },
  sunGlow: {
    backgroundColor: 'rgba(255, 248, 196, 0.36)',
    borderRadius: 90,
    height: 180,
    position: 'absolute',
    right: -42,
    top: -94,
    width: 180,
  },
  weatherPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  weatherText: {
    color: 'rgba(18, 60, 46, 0.72)',
    fontSize: 10,
    fontWeight: '600',
  },
  weekPlot: {
    alignItems: 'center',
    flex: 1,
    height: 118,
    justifyContent: 'flex-end',
  },
  weekRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingBottom: 10,
  },
  windDot: {
    backgroundColor: '#F9FFF6',
    borderRadius: 3,
    height: 5,
    shadowColor: colors.white,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    width: 5,
  },
  yearFrame: {
    height: 198,
    marginHorizontal: -6,
  },
});
