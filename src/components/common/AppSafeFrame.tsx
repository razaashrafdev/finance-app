import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

/**
 * Root safe-area frame.
 *
 * Important: never let bottom inset padding change while the keyboard is open.
 * On Android (adjustResize), inset/layout thrash shifts fields under the finger
 * and cascades focus: Input1 → Input2 → Input3 → …
 */
export default function AppSafeFrame({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const keyboardVisibleRef = useRef(false);
  const [bottomPad, setBottomPad] = useState(() => Math.max(insets.bottom, 8));

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      keyboardVisibleRef.current = true;
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardVisibleRef.current = false;
      setBottomPad(Math.max(insets.bottom, 8));
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.bottom]);

  useEffect(() => {
    if (!keyboardVisibleRef.current) {
      setBottomPad(Math.max(insets.bottom, 8));
    }
  }, [insets.bottom]);

  return (
    <View
      style={[
        styles.frame,
        {
          backgroundColor: colors.background,
          paddingTop: Math.max(insets.top, 8),
          paddingBottom: bottomPad,
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
