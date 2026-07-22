import type { Animated as AnimatedType } from 'react-native';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { colors } from '../theme/colors';
import type { GrowthLevel } from '../types/garden';

interface GrassTuftProps {
  level: GrowthLevel;
  size: number;
  sway: AnimatedType.AnimatedInterpolation<string | number>;
}

const paths = [
  'M32 54 C30 43 28 36 27 28',
  'M32 54 C35 42 38 33 43 24',
  'M31 54 C25 46 20 41 15 37',
  'M34 54 C39 47 45 43 51 40',
  'M30 54 C25 39 22 29 23 19',
  'M34 54 C39 38 42 27 48 19',
  'M31 54 C29 34 31 22 34 12',
  'M29 54 C21 42 15 30 14 23',
  'M35 54 C44 43 49 34 52 28',
] as const;

function bladeCount(level: GrowthLevel) {
  return [0, 3, 5, 7, 9][level] ?? 0;
}

export function GrassTuft({ level, size, sway }: GrassTuftProps) {
  const count = bladeCount(level);
  const stroke = colors.growth[level];

  return (
    <View style={[styles.frame, { height: size, width: size }]}>
      <Animated.View
        style={[
          styles.animated,
          {
            transform: [{ rotate: sway }, { scaleY: 0.78 + level * 0.055 }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 64 64">
          <Ellipse cx="32" cy="55" rx="19" ry="5" fill="rgba(68, 57, 39, 0.14)" />
          {level === 0 ? (
            <>
              <Ellipse cx="32" cy="53" rx="5" ry="2.8" fill="#886C4B" />
              <Circle cx="34" cy="51" r="1.4" fill="#B99B70" />
            </>
          ) : null}
          {paths.slice(0, count).map((path, index) => (
            <Path
              key={path}
              d={path}
              fill="none"
              opacity={0.78 + (index % 3) * 0.1}
              stroke={stroke}
              strokeLinecap="round"
              strokeWidth={level >= 3 ? 2.8 : 3.2}
            />
          ))}
          {level === 4 ? (
            <>
              <Circle cx="34" cy="12" r="2.6" fill="#F2D890" />
              <Circle cx="34" cy="12" r="1.1" fill="#A97842" />
            </>
          ) : null}
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  animated: {
    height: '100%',
    transformOrigin: 'bottom',
    width: '100%',
  },
  frame: {
    justifyContent: 'flex-end',
  },
});
