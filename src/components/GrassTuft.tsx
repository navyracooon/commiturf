import type { Animated as AnimatedType } from 'react-native';
import { Animated, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import type { GrassVarietyId } from '../design/grass';
import { renderDetailedGrassSvg } from '../design/renderDetailedGrass';
import type { GrowthLevel } from '../types/garden';

interface GrassTuftProps {
  level: GrowthLevel;
  size: number;
  sway: AnimatedType.AnimatedInterpolation<string | number>;
  variety?: GrassVarietyId;
}

export function GrassTuft({ level, size, sway, variety }: GrassTuftProps) {
  return (
    <View style={[styles.frame, { height: size, width: size }]}>
      <Animated.View
        style={[
          styles.animated,
          {
            transform: [
              { rotate: level === 0 ? '0deg' : sway },
            ],
          },
        ]}
      >
        <SvgXml
          height={size}
          width={size}
          xml={renderDetailedGrassSvg(level, { variety })}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  animated: {
    height: '100%',
    transformOrigin: '50% 84%',
    width: '100%',
  },
  frame: {
    justifyContent: 'flex-end',
  },
});
