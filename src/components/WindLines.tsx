import type { Animated as AnimatedType } from 'react-native';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface WindLinesProps {
  opacity: AnimatedType.AnimatedInterpolation<number>;
  translateX: AnimatedType.AnimatedInterpolation<number>;
}

export function WindLines({ opacity, translateX }: WindLinesProps) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wind, { opacity, transform: [{ translateX }] }]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 360 180">
        <Path d="M20 44 C88 19 138 70 229 36 C270 21 308 25 346 39" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="2.2" />
        <Path d="M-16 92 C64 64 126 112 216 78 C265 59 308 66 376 82" fill="none" opacity="0.7" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="1.4" />
        <Path d="M52 132 C107 112 170 144 256 115" fill="none" opacity="0.48" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="1" />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wind: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '115%',
  },
});
