import Svg, { Circle, Ellipse, Line } from 'react-native-svg';

interface GlobeIconProps {
  color?: string;
  size?: number;
}

export function GlobeIcon({ color = '#174735', size = 21 }: GlobeIconProps) {
  return (
    <Svg accessibilityLabel="Language" height={size} viewBox="0 0 24 24" width={size}>
      <Circle cx="12" cy="12" fill="none" r="9" stroke={color} strokeWidth="1.8" />
      <Ellipse cx="12" cy="12" fill="none" rx="4.2" ry="9" stroke={color} strokeWidth="1.55" />
      <Line stroke={color} strokeLinecap="round" strokeWidth="1.55" x1="3.4" x2="20.6" y1="9" y2="9" />
      <Line stroke={color} strokeLinecap="round" strokeWidth="1.55" x1="3.4" x2="20.6" y1="15" y2="15" />
    </Svg>
  );
}
