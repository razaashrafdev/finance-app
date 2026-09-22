import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import AppLogo from './AppLogo';

export default function AppSplash() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.86)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <LinearGradient colors={['#6366F1', '#4F46E5', '#3730A3']} style={styles.container}>
      <StatusBar style="light" />
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <AppLogo size={116} />
        <Text style={styles.appName}>FinanceFlow</Text>
        <Text style={styles.tagline}>Your Complete Financial Companion</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
  },
  appName: {
    marginTop: 20,
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  tagline: {
    marginTop: 8,
    fontSize: 15,
    color: 'rgba(255,255,255,0.82)',
  },
});
