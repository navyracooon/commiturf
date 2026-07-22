import { HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  monospacedDigit,
  padding,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { WidgetSnapshot } from '../../types/garden';

const GardenWidgetView = (props: WidgetSnapshot, environment: WidgetEnvironment) => {
  'widget';
  const glyphs = ['·', '▂', '▄', '▆', '█'];
  const garden = props.levels.map((level) => glyphs[level] ?? '·').join('  ');
  const compact = environment.widgetFamily === 'systemSmall';

  return (
    <VStack
      alignment="leading"
      spacing={compact ? 7 : 9}
      modifiers={[
        frame({ maxHeight: 400, maxWidth: 400, alignment: 'leading' }),
        padding({ all: compact ? 14 : 16 }),
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
      <Text modifiers={[font({ design: 'monospaced', size: compact ? 17 : 19, weight: 'bold' }), foregroundStyle('#89C68E')]}>{garden}</Text>
      <Spacer />
      <HStack alignment="bottom" spacing={6}>
        <Text modifiers={[font({ design: 'rounded', size: compact ? 25 : 28, weight: 'bold' }), monospacedDigit(), foregroundStyle('#FFFFFF')]}>{props.total}</Text>
        <Text modifiers={[font({ design: 'rounded', size: 10, weight: 'medium' }), foregroundStyle('#BFD8BD')]}>this week</Text>
        <Spacer />
        {!compact ? (
          <Text modifiers={[font({ design: 'rounded', size: 11, weight: 'semibold' }), foregroundStyle('#F2D88A')]}>{props.streak} day streak</Text>
        ) : null}
      </HStack>
    </VStack>
  );
};

export default createWidget('GardenWidget', GardenWidgetView);
