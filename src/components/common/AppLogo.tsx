import React from 'react';
import { Image, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

type AppLogoProps = {
  size?: number;
  rounded?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function AppLogo({ size = 88, rounded = true, style }: AppLogoProps) {
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: rounded ? size * 0.28 : 0,
        },
        style,
      ]}
    >
      <Image
        source={require('../../../assets/icon.png')}
        style={{ width: size, height: size }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
});
