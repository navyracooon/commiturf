import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useMemo } from 'react';
import type { Animated as AnimatedType } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Text as SvgText } from 'react-native-svg';

import { colors } from '../theme/colors';
import {
  defaultGrassVarietyId,
  grassVarieties,
  type GrassVarietyId,
} from '../design/grass';
import { type AppLanguage, localeFor, translations } from '../i18n/translations';
import type { ContributionDay, GardenPeriod } from '../types/garden';
import { formatWeekDateLabel, fromDateKey, toDateKey } from '../utils/dates';
import { GrassTuft } from './GrassTuft';
import { WindLines } from './WindLines';
import { useWind } from '../hooks/useWind';

interface GardenFieldProps {
  days: ContributionDay[];
  grassVariety?: GrassVarietyId;
  language: AppLanguage;
  period: GardenPeriod;
}

interface GardenFieldViewProps extends GardenFieldProps {
  canNavigateNext: boolean;
  isLoading: boolean;
  onNavigate: (amount: -1 | 1) => void;
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <Svg height="14" viewBox="0 0 14 14" width="14">
      <Path
        d={direction === 'left' ? 'M8.8 2.5 4.4 7l4.4 4.5' : 'M5.2 2.5 9.6 7l-4.4 4.5'}
        fill="none"
        stroke="rgba(18,60,46,0.72)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </Svg>
  );
}

function formatPeriodLabel(
  start: string,
  end: string,
  period: GardenPeriod,
  language: AppLanguage,
): string {
  const locale = localeFor(language);
  const startDate = fromDateKey(start);
  const endDate = fromDateKey(end);

  if (period === 'year') {
    return new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(startDate);
  }

  if (period === 'month') {
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(startDate);
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const range = `${dateFormatter.format(startDate)} — ${dateFormatter.format(endDate)}`;
  if (startDate.getFullYear() === new Date().getFullYear()) return range;

  const year = new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(startDate);
  return `${year} · ${range}`;
}

const YearField = memo(function YearField({
  days,
  grassVariety,
  language,
}: {
  days: ContributionDay[];
  grassVariety: GrassVarietyId;
  language: AppLanguage;
}) {
  const todayKey = toDateKey(new Date());
  const miniatureGrassSpec = grassVarieties[grassVariety].miniature;
  const monthLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(localeFor(language), { month: 'short' });
    return Array.from({ length: 12 }, (_, month) => formatter.format(new Date(2026, month, 1)));
  }, [language]);

  return (
    <View style={styles.yearFrame}>
      <Svg width="100%" height="100%" viewBox="0 0 360 202">
        {monthLabels.map((label, month) => (
          <SvgText
            fill="rgba(18,60,46,0.46)"
            fontSize="6.5"
            fontWeight="700"
            key={label}
            x="2"
            y={20 + month * 15.1}
          >
            {label}
          </SvgText>
        ))}
        {days.map((day) => {
          const date = fromDateKey(day.date);
          const month = date.getMonth();
          const dayOfMonth = date.getDate();
          const x = 29 + (dayOfMonth - 1) * 10.45;
          const y = 18 + month * 15.1;
          const isFuture = day.date > todayKey;
          const level = isFuture ? 0 : day.level;
          const height = level * miniatureGrassSpec.levelHeight;
          const growth = grassVarieties[grassVariety].detailed.levels[level].color;
          const centerX = x + 3;
          const ground = miniatureGrassSpec.ground;

          return (
            <G key={day.date}>
              <Polygon
                points={`${x},${y} ${centerX},${y - ground.halfHeight} ${x + ground.halfWidth * 2},${y} ${centerX},${y + ground.halfHeight}`}
                fill={
                  isFuture
                    ? ground.future
                    : level === 0
                      ? ground.empty
                      : ground.grown
                }
              />
              {miniatureGrassSpec.blades.map((blade, bladeIndex) =>
                level >= blade.minimumLevel ? (
                  <Line
                    key={bladeIndex}
                    x1={centerX}
                    y1={y}
                    x2={centerX + blade.endX}
                    y2={y - blade.extraHeight - height * blade.heightRatio}
                    stroke={growth}
                    strokeLinecap="round"
                    strokeWidth={blade.strokeWidth}
                  />
                ) : null,
              )}
              {level === 4 ? (
                <Circle
                  cx={
                    centerX +
                    miniatureGrassSpec.blades[miniatureGrassSpec.head.bladeIndex].endX
                  }
                  cy={
                    y -
                    miniatureGrassSpec.blades[miniatureGrassSpec.head.bladeIndex].extraHeight -
                    height *
                      miniatureGrassSpec.blades[miniatureGrassSpec.head.bladeIndex].heightRatio
                  }
                  fill={miniatureGrassSpec.head.color}
                  r={miniatureGrassSpec.head.radius}
                />
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
  grassVariety,
  period,
  sway,
}: GardenFieldProps & {
  sway: AnimatedType.AnimatedInterpolation<string | number>;
}) {
  const isWeek = period === 'week';
  const visibleDays = isWeek ? days.slice(0, 7) : days.slice(0, 31);
  const todayKey = toDateKey(new Date());

  if (isWeek) {
    return (
      <View style={styles.weekRow}>
        {visibleDays.map((day) => {
          const isToday = day.date === todayKey;

          return (
            <View key={day.date} style={styles.weekPlot}>
              <View style={[styles.soil, styles.soilWeek]} />
              {day.date <= todayKey ? (
                <GrassTuft
                  level={day.level}
                  size={54}
                  sway={sway}
                  variety={grassVariety}
                />
              ) : null}
              <View style={styles.weekLabels}>
                <View style={[styles.weekDateBadge, isToday && styles.weekDateBadgeToday]}>
                  <Text style={[styles.weekDate, isToday && styles.weekDateToday]}>
                    {formatWeekDateLabel(day.date, visibleDays)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  const slots = Array.from({ length: 35 }, (_, index) => visibleDays[index]);
  const rows = Array.from({ length: 5 }, (_, row) => slots.slice(row * 7, row * 7 + 7));

  return (
    <View style={styles.monthGrid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.monthRow}>
          {row.map((day, columnIndex) =>
            day ? (
              <View key={day.date} style={styles.monthPlot}>
                <View style={[styles.soil, styles.soilMonth]} />
                {day.date <= todayKey ? (
                  <GrassTuft
                    level={day.level}
                    size={32}
                    sway={sway}
                    variety={grassVariety}
                  />
                ) : null}
                <Text style={[styles.plotLabel, styles.monthLabel]}>
                  {fromDateKey(day.date).getDate()}
                </Text>
              </View>
            ) : (
              <View key={`empty-${rowIndex}-${columnIndex}`} style={styles.monthPlot} />
            ),
          )}
        </View>
      ))}
    </View>
  );
}

export function GardenField({
  canNavigateNext,
  days,
  grassVariety = defaultGrassVarietyId,
  isLoading,
  language,
  onNavigate,
  period,
}: GardenFieldViewProps) {
  const hasWind = period !== 'year';
  const showsWind = hasWind && !isLoading;
  const { sway, windOpacity, windTranslate } = useWind(showsWind);
  const copy = translations[language];
  const messages = copy.garden;
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
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{messages.eyebrow}</Text>
            <View style={styles.rangeRow}>
              <Pressable
                accessibilityLabel={copy.accessibility.previousPeriod}
                hitSlop={8}
                onPress={() => {
                  void Haptics.selectionAsync();
                  onNavigate(-1);
                }}
                style={({ pressed }) => [styles.periodArrow, pressed && styles.periodArrowPressed]}
              >
                <ChevronIcon direction="left" />
              </Pressable>
              <Text style={styles.range}>
                {start && end
                  ? formatPeriodLabel(start, end, period, language)
                  : messages.takingRoot}
              </Text>
              <Pressable
                accessibilityLabel={copy.accessibility.nextPeriod}
                disabled={!canNavigateNext}
                hitSlop={8}
                onPress={() => {
                  void Haptics.selectionAsync();
                  onNavigate(1);
                }}
                style={({ pressed }) => [
                  styles.periodArrow,
                  !canNavigateNext && styles.periodArrowDisabled,
                  pressed && styles.periodArrowPressed,
                ]}
              >
                <ChevronIcon direction="right" />
              </Pressable>
            </View>
          </View>
          {showsWind ? (
            <View style={styles.weatherPill}>
              <View style={styles.windDot} />
              <Text style={styles.weatherText}>{messages.breeze}</Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.field, period === 'year' && styles.fieldYear]}>
          {!isLoading
              ? period === 'year'
              ? <YearField days={days} grassVariety={grassVariety} language={language} />
              : <DetailedField
                  days={days}
                  grassVariety={grassVariety}
                  language={language}
                  period={period}
                  sway={sway}
                />
            : null}
        </View>

        {showsWind ? <WindLines opacity={windOpacity} translateX={windTranslate} /> : null}
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
  headerCopy: {
    flexShrink: 1,
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
  periodArrow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  periodArrowDisabled: {
    opacity: 0.28,
  },
  periodArrowPressed: {
    opacity: 0.58,
    transform: [{ scale: 0.94 }],
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
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  rangeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
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
    bottom: 10,
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
  weekDate: {
    color: 'rgba(18, 60, 46, 0.48)',
    fontSize: 8,
    fontWeight: '600',
    lineHeight: 16,
  },
  weekDateBadge: {
    alignItems: 'center',
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    minWidth: 16,
    paddingHorizontal: 3,
  },
  weekDateBadgeToday: {
    backgroundColor: 'rgba(18, 60, 46, 0.12)',
  },
  weekDateToday: {
    color: colors.forest,
    fontWeight: '800',
  },
  weekLabels: {
    alignItems: 'center',
    bottom: -16,
    position: 'absolute',
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
