import React, { useEffect, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Animated,
  ViewStyle,
  DimensionValue,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton';
  style?: ViewStyle;
}

interface SkeletonBlockProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const { colors } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const bgColor = colors.border || '#E5E5E5';

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: bgColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            transform: [{ translateX }],
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          },
        ]}
      />
    </View>
  );
};

const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'spinner',
  style,
}) => {
  const { colors } = useTheme();

  if (variant === 'skeleton') {
    return (
      <View style={[styles.skeletonContainer, style]}>
        <View style={styles.skeletonRow}>
          <SkeletonBlock width={48} height={48} borderRadius={24} />
          <View style={styles.skeletonContent}>
            <SkeletonBlock width="70%" height={16} />
            <SkeletonBlock width="40%" height={12} style={{ marginTop: 8 }} />
          </View>
        </View>
        <SkeletonBlock width="100%" height={16} style={{ marginTop: 24 }} />
        <SkeletonBlock width="85%" height={16} style={{ marginTop: 12 }} />
        <SkeletonBlock width="60%" height={16} style={{ marginTop: 12 }} />
      </View>
    );
  }

  return (
    <View style={[styles.spinnerContainer, style]}>
      <ActivityIndicator size="large" color={colors.primary || '#6366F1'} />
    </View>
  );
};

const styles = StyleSheet.create({
  spinnerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 16,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default LoadingState;
