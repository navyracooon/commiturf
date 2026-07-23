import {
  Ellipse,
  HStack,
  Image,
  Rectangle,
  Spacer,
  Text,
  VStack,
  ZStack,
} from '@expo/ui/swift-ui';
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  monospacedDigit,
  offset,
  padding,
  resizable,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { GrowthLevel, WidgetSnapshot } from '../../types/garden';

const GardenWidgetView = (props: WidgetSnapshot, environment: WidgetEnvironment) => {
  'widget';
  const compact = environment.widgetFamily === 'systemSmall';
  const large = environment.widgetFamily === 'systemLarge';
  const japanese = props.language === 'ja';
  const syncedAt = props.lastSyncedAt ? new Date(props.lastSyncedAt) : null;
  const syncTimestamp = syncedAt?.getTime() ?? Number.NaN;
  const syncAge = Date.now() - syncTimestamp;
  const syncTime =
    syncedAt && Number.isFinite(syncTimestamp)
      ? `${String(syncedAt.getHours()).padStart(2, '0')}:${String(syncedAt.getMinutes()).padStart(2, '0')}`
      : null;
  const freshness =
    props.username === 'your-garden'
      ? japanese
        ? 'デモの庭'
        : 'Demo garden'
      : !syncTime || syncAge >= 24 * 60 * 60 * 1000
        ? japanese
          ? 'タップして更新'
          : 'Tap to refresh'
        : japanese
          ? `${syncTime}に更新`
          : `Updated ${syncTime}`;
  const levels = props.levels.slice(-7);
  const monthLabel = props.monthLabel ?? (japanese ? '今月' : 'This month');
  const monthLevels = props.monthLevels ?? Array.from({ length: 35 }, () => -1);
  const monthTotal = props.monthTotal ?? 0;
  const monthRows = Array.from({ length: 5 }, (_, row) =>
    monthLevels.slice(row * 7, row * 7 + 7),
  );
  const weekCurrentDayIndex = props.weekCurrentDayIndex ?? 6;

  if (large) {
    return (
      <ZStack
        modifiers={[
          containerBackground('#103428', 'widget'),
          frame({ maxHeight: 400, maxWidth: 400, alignment: 'leading' }),
          widgetURL('commiturf://garden'),
        ]}
      >
        <Rectangle
          modifiers={[
            frame({ maxHeight: 400, maxWidth: 400 }),
            foregroundStyle('#103428'),
          ]}
        />
        <VStack
          alignment="leading"
          spacing={7}
          modifiers={[
            frame({ maxHeight: 400, maxWidth: 400, alignment: 'leading' }),
            padding({ all: 16 }),
          ]}
        >
          <HStack spacing={4}>
            <Text modifiers={[font({ design: 'rounded', size: 11, weight: 'bold' }), foregroundStyle('#BFD8BD')]}>COMMITURF</Text>
            <Spacer />
            <VStack alignment="trailing" spacing={1}>
              <Text modifiers={[font({ design: 'rounded', size: 10, weight: 'medium' }), foregroundStyle('#D7E5D3')]}>@{props.username}</Text>
              <Text modifiers={[font({ design: 'rounded', size: 7, weight: 'medium' }), foregroundStyle('#8FAD98')]}>{freshness}</Text>
            </VStack>
          </HStack>

          <VStack
            spacing={3}
            modifiers={[
              padding({ top: 16 }),
              frame({ maxWidth: 400, alignment: 'center' }),
            ]}
          >
            {monthRows.map((row, rowIndex) => (
              <HStack key={`month-row-${rowIndex}`} spacing={5}>
                {row.map((level, columnIndex) => {
                  const day = rowIndex * 7 + columnIndex + 1;
                  const future = day > (props.monthCurrentDay ?? 31);
                  const safeLevel =
                    level < 0
                      ? null
                      : (Math.max(0, Math.min(4, level)) as GrowthLevel);

                  return (
                    <VStack
                      key={`month-${day}`}
                      spacing={1}
                      modifiers={[frame({ height: 36, width: 38, alignment: 'center' })]}
                    >
                      <ZStack
                        alignment="bottom"
                        modifiers={[frame({ height: 27, width: 38, alignment: 'bottom' })]}
                      >
                        {safeLevel !== null ? (
                          <Ellipse
                            modifiers={[
                              frame({ height: 3.2, width: 17 }),
                              foregroundStyle(future ? '#5B4A3214' : '#5B4A3230'),
                            ]}
                          />
                        ) : null}
                        {!future && safeLevel !== null ? (
                          <Image
                            uiImage={props.grassImageUris?.[safeLevel] ?? ''}
                            modifiers={[
                              resizable(),
                              frame({ height: 27, width: 27 }),
                              offset({ y: 1 }),
                            ]}
                          />
                        ) : null}
                      </ZStack>
                      <Text modifiers={[font({ design: 'rounded', size: 7, weight: 'medium' }), foregroundStyle('#9DB9A2')]}>
                        {safeLevel === null ? '' : `${day}`}
                      </Text>
                    </VStack>
                  );
                })}
              </HStack>
            ))}
          </VStack>

          <Spacer />
          <HStack alignment="bottom" spacing={6}>
            <Text modifiers={[font({ design: 'rounded', size: 28, weight: 'bold' }), monospacedDigit(), foregroundStyle('#FFFFFF')]}>{monthTotal}</Text>
            <Text modifiers={[font({ design: 'rounded', size: 10, weight: 'medium' }), foregroundStyle('#BFD8BD')]}>{japanese ? '今月' : 'this month'}</Text>
            <Spacer />
            <VStack alignment="trailing" spacing={2}>
              <Text modifiers={[font({ design: 'rounded', size: 9, weight: 'medium' }), foregroundStyle('#D7E5D3')]}>{monthLabel}</Text>
              <Text modifiers={[font({ design: 'rounded', size: 11, weight: 'semibold' }), foregroundStyle('#F2D88A')]}>{japanese ? `${props.streak}日連続` : `${props.streak} day streak`}</Text>
            </VStack>
          </HStack>
        </VStack>
      </ZStack>
    );
  }

  return (
    <ZStack
      modifiers={[
        containerBackground('#103428', 'widget'),
        frame({ maxHeight: 400, maxWidth: 400, alignment: 'leading' }),
        widgetURL('commiturf://garden'),
      ]}
    >
      <Rectangle
        modifiers={[
          frame({ maxHeight: 400, maxWidth: 400 }),
          foregroundStyle('#103428'),
        ]}
      />
      <VStack
        alignment="leading"
        spacing={compact ? 5 : 7}
        modifiers={[
          frame({ maxHeight: 400, maxWidth: 400, alignment: 'leading' }),
          padding({ all: compact ? 13 : 16 }),
        ]}
      >
        <HStack spacing={4}>
          <Text modifiers={[font({ design: 'rounded', size: 11, weight: 'bold' }), foregroundStyle('#BFD8BD')]}>COMMITURF</Text>
          <Spacer />
          <VStack alignment="trailing" spacing={1}>
            {!compact ? (
              <Text modifiers={[font({ design: 'rounded', size: 10, weight: 'medium' }), foregroundStyle('#D7E5D3')]}>@{props.username}</Text>
            ) : null}
            <Text modifiers={[font({ design: 'rounded', size: 7, weight: 'medium' }), foregroundStyle('#8FAD98')]}>{freshness}</Text>
          </VStack>
        </HStack>
        <HStack
          alignment="bottom"
          spacing={compact ? 1 : 10}
          modifiers={[frame({ maxWidth: 400, alignment: 'center' })]}
        >
          {levels.map((level, index) => {
            const safeLevel = Math.max(0, Math.min(4, level)) as GrowthLevel;
            const tuftWidth = compact ? 18 : 30;
            const future = index > weekCurrentDayIndex;

            return (
              <ZStack
                key={`${index}-${safeLevel}`}
                alignment="bottom"
                modifiers={[frame({ height: compact ? 45 : 52, width: tuftWidth, alignment: 'bottom' })]}
              >
                <Ellipse
                  modifiers={[
                    frame({ height: compact ? 3.2 : 4, width: compact ? 13 : 18 }),
                    foregroundStyle('#5B4A3230'),
                  ]}
                />
                {!future ? (
                  <Image
                    uiImage={props.grassImageUris?.[safeLevel] ?? ''}
                    modifiers={[
                      resizable(),
                      frame({
                        height: compact ? 28 : 52,
                        width: compact ? 28 : 52,
                      }),
                      offset({ y: compact ? 2 : 2.5 }),
                    ]}
                  />
                ) : null}
              </ZStack>
            );
          })}
        </HStack>
        <Spacer />
        <HStack alignment="bottom" spacing={6}>
          <Text modifiers={[font({ design: 'rounded', size: compact ? 25 : 28, weight: 'bold' }), monospacedDigit(), foregroundStyle('#FFFFFF')]}>{props.total}</Text>
          <Text modifiers={[font({ design: 'rounded', size: 10, weight: 'medium' }), foregroundStyle('#BFD8BD')]}>{japanese ? '今週' : 'this week'}</Text>
          <Spacer />
          {!compact ? (
            <Text modifiers={[font({ design: 'rounded', size: 11, weight: 'semibold' }), foregroundStyle('#F2D88A')]}>{japanese ? `${props.streak}日連続` : `${props.streak} day streak`}</Text>
          ) : null}
        </HStack>
      </VStack>
    </ZStack>
  );
};

export default createWidget('GardenWidget', GardenWidgetView);
