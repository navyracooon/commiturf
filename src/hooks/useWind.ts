import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

export function useWind() {
  const gust = useMemo(() => new Animated.Value(0), []);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      gust.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(3400),
        Animated.timing(gust, {
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(gust, {
          duration: 1500,
          easing: Easing.out(Easing.elastic(0.8)),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.delay(5200),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [gust, reduceMotion]);

  return {
    gust,
    sway: gust.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '8deg'] }),
    windOpacity: gust.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 0.45, 0] }),
    windTranslate: gust.interpolate({ inputRange: [0, 1], outputRange: [-80, 120] }),
  };
}
