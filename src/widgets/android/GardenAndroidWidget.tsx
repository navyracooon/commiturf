import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

import { defaultGrassVarietyId, type GrassVarietyId } from '../../design/grass';
import { renderDetailedGrassSvg } from '../../design/renderDetailedGrass';
import type { GrowthLevel, WidgetSnapshot } from '../../types/garden';
import { formatGardenFreshness } from '../../utils/freshness';

interface GardenAndroidWidgetProps {
  height?: number;
  snapshot: WidgetSnapshot;
  width?: number;
}

function createGrassSvg(
  level: number,
  showSeed = true,
  variety: GrassVarietyId = defaultGrassVarietyId,
) {
  const safeLevel = Math.max(0, Math.min(4, level)) as GrowthLevel;
  return renderDetailedGrassSvg(safeLevel, { includeSoil: true, showSeed, variety });
}

export function GardenAndroidWidget({ height = 0, snapshot }: GardenAndroidWidgetProps) {
  const japanese = snapshot.language === 'ja';
  const large = height >= 220;
  const grassVariety = snapshot.grassVariety ?? defaultGrassVarietyId;
  const weekCurrentDayIndex = snapshot.weekCurrentDayIndex ?? 6;
  const freshness =
    snapshot.username === 'your-garden'
      ? japanese
        ? 'デモの庭'
        : 'Demo garden'
      : formatGardenFreshness(snapshot.lastSyncedAt, snapshot.language);

  if (large) {
    const monthRows = Array.from({ length: 5 }, (_, row) =>
      snapshot.monthLevels.slice(row * 7, row * 7 + 7),
    );

    return (
      <FlexWidget
        clickAction="OPEN_APP"
        accessibilityLabel={
          japanese
            ? `Commiturfの${snapshot.monthLabel}の庭。今月は${snapshot.monthTotal} Contribution。`
            : `Commiturf garden for ${snapshot.monthLabel}. ${snapshot.monthTotal} contributions this month.`
        }
        style={{
          backgroundColor: '#103428',
          borderRadius: 28,
          flexDirection: 'column',
          height: 'match_parent',
          justifyContent: 'space-between',
          padding: 14,
          width: 'match_parent',
        }}
      >
        <FlexWidget style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <TextWidget
            text="COMMITURF"
            style={{ color: '#BFD7C1', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }}
          />
          <FlexWidget style={{ alignItems: 'flex-end', flexDirection: 'column' }}>
            <TextWidget text={`@${snapshot.username}`} style={{ color: '#DCE7D9', fontSize: 10 }} />
            <TextWidget text={freshness} style={{ color: '#8FAD98', fontSize: 7 }} />
          </FlexWidget>
        </FlexWidget>

        <FlexWidget
          style={{ flexDirection: 'column', justifyContent: 'space-between', marginTop: 16 }}
        >
          {monthRows.map((row, rowIndex) => (
            <FlexWidget
              key={`month-row-${rowIndex}`}
              style={{ alignItems: 'flex-end', flexDirection: 'row', height: 37, justifyContent: 'space-between' }}
            >
              {row.map((level, columnIndex) => {
                const day = rowIndex * 7 + columnIndex + 1;
                const future = day > snapshot.monthCurrentDay;
                return (
                  <FlexWidget
                    key={`month-${day}`}
                    style={{ alignItems: 'center', flexDirection: 'column', height: 37, width: 29 }}
                  >
                    {level < 0 ? (
                      <FlexWidget style={{ height: 27, width: 22 }} />
                    ) : (
                      <SvgWidget
                        svg={createGrassSvg(future ? 0 : level, !future, grassVariety)}
                        style={{ height: 27, width: 22 }}
                      />
                    )}
                    <TextWidget
                      text={level < 0 ? '' : `${day}`}
                      style={{ color: '#9DB9A2', fontSize: 7 }}
                    />
                  </FlexWidget>
                );
              })}
            </FlexWidget>
          ))}
        </FlexWidget>

        <FlexWidget style={{ alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' }}>
          <FlexWidget style={{ alignItems: 'flex-end', flexDirection: 'row' }}>
            <TextWidget text={`${snapshot.monthTotal}`} style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '700' }} />
            <TextWidget text={japanese ? ' 今月' : ' this month'} style={{ color: '#BFD7C1', fontSize: 9 }} />
          </FlexWidget>
          <FlexWidget style={{ alignItems: 'flex-end', flexDirection: 'column' }}>
            <TextWidget text={snapshot.monthLabel} style={{ color: '#DCE7D9', fontSize: 9 }} />
            <TextWidget
              text={japanese ? `${snapshot.streak}日連続` : `${snapshot.streak} day streak`}
              style={{ color: '#F2DA8B', fontSize: 11, fontWeight: '700' }}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>
    );
  }

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={
        japanese
          ? `Commiturfの庭。今週は${snapshot.total} Contribution、${snapshot.streak}日連続。`
          : `Commiturf garden. ${snapshot.total} contributions this week, ${snapshot.streak} day streak.`
      }
      style={{
        backgroundColor: '#103428',
        borderRadius: 28,
        flexDirection: 'column',
        height: 'match_parent',
        justifyContent: 'space-between',
        padding: 12,
        width: 'match_parent',
      }}
    >
      <FlexWidget style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextWidget
          text="COMMITURF"
          style={{ color: '#BFD7C1', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }}
        />
        <FlexWidget style={{ alignItems: 'flex-end', flexDirection: 'column' }}>
          <TextWidget text={`@${snapshot.username}`} style={{ color: '#DCE7D9', fontSize: 10 }} />
          <TextWidget text={freshness} style={{ color: '#8FAD98', fontSize: 7 }} />
        </FlexWidget>
      </FlexWidget>

      <FlexWidget
        style={{ alignItems: 'flex-end', flexDirection: 'row', height: 42, justifyContent: 'space-between' }}
      >
        {snapshot.levels.slice(-7).map((level, index) => (
          <SvgWidget
            key={`${index}-${level}`}
            svg={createGrassSvg(
              index > weekCurrentDayIndex ? 0 : level,
              index <= weekCurrentDayIndex,
              grassVariety,
            )}
            style={{ height: 42, width: 28 }}
          />
        ))}
      </FlexWidget>

      <FlexWidget style={{ alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' }}>
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget text={`${snapshot.total}`} style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }} />
          <TextWidget text={japanese ? '今週' : 'this week'} style={{ color: '#BFD7C1', fontSize: 9 }} />
        </FlexWidget>
        <TextWidget
          text={japanese ? `${snapshot.streak}日連続` : `${snapshot.streak} day streak`}
          style={{ color: '#F2DA8B', fontSize: 11, fontWeight: '700' }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
