import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppLogo from '../../components/common/AppLogo';
import { useTheme } from '../../theme/ThemeContext';

interface WelcomeScreenProps {
  navigation: any;
}

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoArea}>
            <AppLogo size={120} />
            <Text style={styles.appName}>FinanceFlow</Text>
            <Text style={styles.tagline}>Your Complete Financial Companion</Text>
          </View>

          <View style={styles.buttonArea}>
            <TouchableOpacity
              style={[styles.getStartedButton, { backgroundColor: '#fff' }]}
              onPress={() => navigation.navigate('Onboarding')}
              activeOpacity={0.8}
            >
              <Text style={[styles.getStartedText, { color: colors.primary }]}>
                Get Started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signInButton, { borderColor: 'rgba(255,255,255,0.6)' }]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.signInText}>I already have an account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  logoArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  buttonArea: {
    width: '100%',
    gap: 12,
  },
  getStartedButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 17,
    fontWeight: '600',
  },
  signInButton: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
});
