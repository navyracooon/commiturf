import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

export function useWind(enabled = true) {
  const gust = useMemo(() => new Animated.Value(0), []);
  const windProgress = useMemo(() => new Animated.Value(0), []);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!enabled || reduceMotion) {
      gust.setValue(0);
      windProgress.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(3400),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(windProgress, {
              duration: 1500,
              easing: Easing.inOut(Easing.quad),
              toValue: 1,
              useNativeDriver: true,
            }),
            Animated.timing(windProgress, {
              duration: 0,
              toValue: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(160),
            Animated.timing(gust, {
              duration: 420,
              easing: Easing.out(Easing.cubic),
              toValue: 1,
              useNativeDriver: true,
            }),
            Animated.delay(920),
            Animated.timing(gust, {
              duration: 650,
              easing: Easing.out(Easing.cubic),
              toValue: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.delay(5200),
      ]),
    );

    animation.start();
    return () => {
      animation.stop();
      gust.stopAnimation();
      windProgress.stopAnimation();
    };
  }, [enabled, gust, reduceMotion, windProgress]);

  return {
    gust,
    sway: gust.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '8deg'] }),
    windOpacity: windProgress.interpolate({
      inputRange: [0, 0.12, 0.72, 1],
      outputRange: [0, 0.48, 0.28, 0],
    }),
    windTranslate: windProgress.interpolate({ inputRange: [0, 1], outputRange: [-110, 150] }),
  };
}
