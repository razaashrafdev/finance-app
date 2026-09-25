import React, { forwardRef, useCallback, useRef } from 'react';
import {
  FlatList,
  FlatListProps,
  ScrollView,
  ScrollViewProps,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

/**
 * Scroll-to-top on screen focus. Default is OFF.
 * Enabling this on form screens fights the keyboard and steals TextInput focus.
 */
function useOpenFromTop(reset: () => void, enabled: boolean) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return undefined;
      }
      reset();
      const frame = requestAnimationFrame(reset);
      return () => {
        cancelAnimationFrame(frame);
      };
    }, [reset, enabled])
  );
}

type ScreenScrollProps = ScrollViewProps & {
  /** Jump to top when the screen gains navigation focus. Default false. */
  resetOnFocus?: boolean;
};

type ScreenListProps = FlatListProps<any> & {
  resetOnFocus?: boolean;
};

export const ScreenScrollView = forwardRef<ScrollView, ScreenScrollProps>(
  function ScreenScrollView(
    { resetOnFocus = false, keyboardShouldPersistTaps = 'handled', keyboardDismissMode = 'on-drag', ...props },
    ref
  ) {
    const innerRef = useRef<ScrollView>(null);
    const reset = useCallback(() => {
      try {
        innerRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      } catch {
        // Scroll view may not be laid out yet.
      }
    }, []);
    useOpenFromTop(reset, resetOnFocus);

    return (
      <ScrollView
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        keyboardDismissMode={keyboardDismissMode}
        {...props}
        ref={(node) => {
          innerRef.current = node;
          assignRef(ref, node);
        }}
      />
    );
  }
);

export const ScreenFlatList = forwardRef<FlatList<any>, ScreenListProps>(
  function ScreenFlatList(
    { resetOnFocus = false, keyboardShouldPersistTaps = 'handled', keyboardDismissMode = 'on-drag', ...props },
    ref
  ) {
    const innerRef = useRef<FlatList<any>>(null);
    const reset = useCallback(() => {
      try {
        innerRef.current?.scrollToOffset({ offset: 0, animated: false });
      } catch {
        // List may not be laid out yet.
      }
    }, []);
    useOpenFromTop(reset, resetOnFocus);

    return (
      <FlatList
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        keyboardDismissMode={keyboardDismissMode}
        {...props}
        ref={(node) => {
          innerRef.current = node;
          assignRef(ref, node);
        }}
      />
    );
  }
);
