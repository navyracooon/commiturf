import { Image, StyleSheet } from 'react-native';

interface BrandMarkProps {
  size?: number;
}

export function BrandMark({ size = 28 }: BrandMarkProps) {
  return (
    <Image
      accessibilityLabel="Commiturf"
      accessibilityIgnoresInvertColors
      resizeMode="cover"
      source={require('../../assets/icon.png')}
      style={[styles.image, { borderRadius: size * 0.23, height: size, width: size }]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#FBFAF4',
  },
});
