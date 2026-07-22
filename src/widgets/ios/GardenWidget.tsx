import { Capsule, Circle, Ellipse, HStack, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  monospacedDigit,
  offset,
  padding,
  rotationEffect,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { WidgetSnapshot } from '../../types/garden';

const GardenWidgetView = (props: WidgetSnapshot, environment: WidgetEnvironment) => {
  'widget';
  const compact = environment.widgetFamily === 'systemSmall';
  const japanese = props.language === 'ja';
  const growthColors = ['#A4A89A', '#A7CD9C', '#78B978', '#46A064', '#B5D88F'];
  const levels = props.levels.slice(-7);

  return (
    <VStack
      alignment="leading"
      spacing={compact ? 5 : 7}
      modifiers={[
        frame({ maxHeight: 400, maxWidth: 400, alignment: 'leading' }),
        padding({ all: compact ? 13 : 16 }),
        containerBackground('#153D2F', 'widget'),
        widgetURL('commiturf://garden'),
      ]}
    >
      <HStack spacing={4}>
        <Text modifiers={[font({ design: 'rounded', size: 11, weight: 'bold' }), foregroundStyle('#BFD8BD')]}>COMMITURF</Text>
        <Spacer />
        {!compact ? (
          <Text modifiers={[font({ design: 'rounded', size: 10, weight: 'medium' }), foregroundStyle('#D7E5D3')]}>@{props.username}</Text>
        ) : null}
      </HStack>
      <HStack alignment="bottom" spacing={compact ? 1 : 4}>
        {levels.map((level, index) => {
          const safeLevel = Math.max(0, Math.min(4, level));
          const tuftHeight = (compact ? 16 : 19) + safeLevel * (compact ? 5.5 : 6.5);
          const tuftWidth = compact ? 15 : 22;
          const bladeWidth = compact ? 2.1 : 2.6;

          return (
            <ZStack
              key={`${index}-${safeLevel}`}
              alignment="bottom"
              modifiers={[frame({ height: compact ? 45 : 52, width: tuftWidth, alignment: 'bottom' })]}
            >
              <Ellipse
                modifiers={[
                  frame({ height: compact ? 3.2 : 4, width: compact ? 13 : 18 }),
                  foregroundStyle('#0C2D23'),
                ]}
              />
              {safeLevel === 0 ? (
                <Circle
                  modifiers={[
                    frame({ height: compact ? 3.5 : 4.5, width: compact ? 3.5 : 4.5 }),
                    foregroundStyle('#D4BF74'),
                    offset({ y: compact ? -2 : -3 }),
                  ]}
                />
              ) : null}
              {safeLevel >= 1 ? (
                <Capsule
                  modifiers={[
                    frame({ height: tuftHeight, width: bladeWidth }),
                    foregroundStyle(growthColors[safeLevel] ?? '#A4A89A'),
                  ]}
                />
              ) : null}
              {safeLevel >= 1 ? (
                <Capsule
                  modifiers={[
                    frame({ height: tuftHeight * 0.78, width: bladeWidth }),
                    foregroundStyle(growthColors[safeLevel] ?? '#A4A89A'),
                    rotationEffect(-17),
                    offset({ x: -3.2 * (compact ? 0.78 : 1) }),
                  ]}
                />
              ) : null}
              {safeLevel >= 1 ? (
                <Capsule
                  modifiers={[
                    frame({ height: tuftHeight * 0.82, width: bladeWidth }),
                    foregroundStyle(growthColors[safeLevel] ?? '#A4A89A'),
                    rotationEffect(18),
                    offset({ x: 3.2 * (compact ? 0.78 : 1) }),
                  ]}
                />
              ) : null}
              {safeLevel >= 2 ? (
                <Capsule
                  modifiers={[
                    frame({ height: tuftHeight * 0.62, width: bladeWidth }),
                    foregroundStyle(growthColors[safeLevel] ?? '#A4A89A'),
                    rotationEffect(-31),
                    offset({ x: -5.3 * (compact ? 0.78 : 1) }),
                  ]}
                />
              ) : null}
              {safeLevel >= 3 ? (
                <Capsule
                  modifiers={[
                    frame({ height: tuftHeight * 0.66, width: bladeWidth }),
                    foregroundStyle(growthColors[safeLevel] ?? '#A4A89A'),
                    rotationEffect(31),
                    offset({ x: 5.3 * (compact ? 0.78 : 1) }),
                  ]}
                />
              ) : null}
              {safeLevel >= 3 ? (
                <Capsule
                  modifiers={[
                    frame({ height: tuftHeight * 0.9, width: bladeWidth }),
                    foregroundStyle(growthColors[safeLevel] ?? '#A4A89A'),
                    rotationEffect(-8),
                    offset({ x: -1.7 * (compact ? 0.78 : 1) }),
                  ]}
                />
              ) : null}
              {safeLevel >= 4 ? (
                <Capsule
                  modifiers={[
                    frame({ height: tuftHeight * 0.72, width: bladeWidth }),
                    foregroundStyle(growthColors[safeLevel] ?? '#A4A89A'),
                    rotationEffect(10),
                    offset({ x: 1.8 * (compact ? 0.78 : 1) }),
                  ]}
                />
              ) : null}
              {safeLevel >= 4 ? (
                <Capsule
                  modifiers={[
                    frame({ height: tuftHeight * 0.52, width: bladeWidth }),
                    foregroundStyle(growthColors[safeLevel] ?? '#A4A89A'),
                    rotationEffect(39),
                    offset({ x: 6.2 * (compact ? 0.78 : 1) }),
                  ]}
                />
              ) : null}
              {safeLevel === 4 ? (
                <Circle
                  modifiers={[
                    frame({ height: compact ? 4.2 : 5, width: compact ? 4.2 : 5 }),
                    foregroundStyle('#F1D77A'),
                    offset({ x: 0, y: -tuftHeight + (compact ? 2.1 : 2.5) }),
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
  );
};

export default createWidget('GardenWidget', GardenWidgetView);
