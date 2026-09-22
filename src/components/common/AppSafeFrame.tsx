import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

export default function AppSafeFrame({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.frame,
        {
          backgroundColor: colors.background,
          paddingTop: Math.max(insets.top, 8),
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
  },
});
