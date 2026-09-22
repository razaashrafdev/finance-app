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

function useOpenFromTop(reset: () => void) {
  useFocusEffect(
    useCallback(() => {
      reset();
      const frame = requestAnimationFrame(reset);
      return () => {
        cancelAnimationFrame(frame);
        reset();
      };
    }, [reset]),
  );
}

export const ScreenScrollView = forwardRef<ScrollView, ScrollViewProps>(
  function ScreenScrollView(props, ref) {
    const innerRef = useRef<ScrollView>(null);
    const reset = useCallback(() => {
      try {
        innerRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      } catch {
        // Scroll view may not be laid out yet.
      }
    }, []);
    useOpenFromTop(reset);

    return (
      <ScrollView
        {...props}
        ref={(node) => {
          innerRef.current = node;
          assignRef(ref, node);
        }}
      />
    );
  },
);

export const ScreenFlatList = forwardRef<FlatList<any>, FlatListProps<any>>(
  function ScreenFlatList(props, ref) {
    const innerRef = useRef<FlatList<any>>(null);
    const reset = useCallback(() => {
      try {
        innerRef.current?.scrollToOffset({ offset: 0, animated: false });
      } catch {
        // List may not be laid out yet.
      }
    }, []);
    useOpenFromTop(reset);

    return (
      <FlatList
        {...props}
        ref={(node) => {
          innerRef.current = node;
          assignRef(ref, node);
        }}
      />
    );
  },
);
