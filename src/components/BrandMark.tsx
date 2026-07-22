import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

interface BrandMarkProps {
  size?: number;
}

export function BrandMark({ size = 28 }: BrandMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" accessibilityLabel="Commiturf">
      <Circle cx="16" cy="16" r="15" fill="#FBFAF4" stroke="rgba(20,55,45,0.14)" />
      <Ellipse cx="16" cy="23" rx="9" ry="3.3" fill="#174735" />
      <Ellipse cx="16" cy="22.2" rx="7.1" ry="1.8" fill="#2E6E4D" />
      <Path
        d="M16 22c0-6.2.2-11.1 1-15.2M15.5 22c-1.5-5.8-3.3-10-5.9-13.3M16.6 22c1.7-5.6 3.7-9.4 6.5-12.3M14.4 22c-3.1-4.1-5.4-6.3-7.9-7.3M17.9 22c3.1-3.8 5.4-5.8 7.9-6.7M14.9 22c-.5-5.1-.4-8.3.5-11.1M17.1 22c.9-4.3 2.2-7.2 3.8-9.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#4B975F"
        strokeWidth="1.55"
      />
      <Circle cx="17" cy="6.8" r="1.5" fill="#F1CA62" />
      <Circle cx="17" cy="6.8" r="0.55" fill="#A36C32" />
    </Svg>
  );
}
