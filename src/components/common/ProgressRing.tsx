import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 100,
  strokeWidth = 10,
  color = '#6366F1',
  backgroundColor = '#E5E5E5',
  children,
  style,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: Math.min(Math.max(progress, 0), 1),
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedProgress]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      {children && (
        <View style={[styles.childrenContainer, { width: size, height: size }]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  childrenContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProgressRing;
