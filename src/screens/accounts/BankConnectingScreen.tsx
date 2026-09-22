import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import Button from '../../components/common/Button';

interface BankConnectingScreenProps {
  navigation: any;
  route: {
    params: {
      bankId: string;
      bankName: string;
      bankColor: string;
    };
  };
}

const statusMessages = [
  'Establishing secure connection...',
  'Verifying credentials...',
  'Setting up account access...',
  'Almost there...',
];

const BankConnectingScreen: React.FC<BankConnectingScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, isDark } = useTheme();
  const { bankId, bankName, bankColor } = route.params;

  const [statusIndex, setStatusIndex] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Progress bar animation: 0% to 100% over 8 seconds
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 8000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // Pulse animation for the center circle
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Dot animation looping left to right
    const dotLoop = Animated.loop(
      Animated.timing(dotAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    dotLoop.start();

    // Cycle status messages
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => {
        if (prev < statusMessages.length - 1) return prev + 1;
        return prev;
      });
    }, 2000);

    // Navigate after 8 seconds
    const navigateTimeout = setTimeout(() => {
      navigation.replace('BankConnected', {
        bankId,
        bankName,
        bankColor,
      });
    }, 8000);

    return () => {
      pulseLoop.stop();
      dotLoop.stop();
      clearInterval(statusInterval);
      clearTimeout(navigateTimeout);
    };
  }, []);

  const handleCancel = () => {
    navigation.goBack();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const dotTranslateX = dotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 160],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View
        style={[
          styles.header,
          { backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.backButton} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Connecting to Bank
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Step Indicator */}
        <View style={styles.stepContainer}>
          <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
            Step 4 of 5
          </Text>
          <View style={[styles.stepBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.stepProgress,
                {
                  backgroundColor: bankColor,
                  width: '80%',
                },
              ]}
            />
          </View>
        </View>

        {/* Bank Info */}
        <View style={styles.bankInfoRow}>
          <View style={[styles.bankIcon, { backgroundColor: bankColor + '18' }]}>
            <Ionicons name="business" size={24} color={bankColor} />
          </View>
          <View style={styles.bankNameContainer}>
            <Text style={[styles.bankName, { color: colors.text }]}>
              {bankName}
            </Text>
          </View>
        </View>

        {/* Animation Area */}
        <View style={styles.animationArea}>
          {/* Bank Icon */}
          <View style={[styles.iconCircle, { backgroundColor: bankColor + '18', borderColor: bankColor + '30' }]}>
            <Ionicons name="business" size={36} color={bankColor} />
          </View>

          {/* Animated Dots */}
          <View style={styles.dotsContainer}>
            <View style={[styles.dotTrack, { backgroundColor: colors.border }]}>
              <Animated.View
                style={[
                  styles.dot,
                  { backgroundColor: bankColor },
                  { transform: [{ translateX: dotTranslateX }] },
                ]}
              />
            </View>
          </View>

          {/* Pulsing Center Circle */}
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                backgroundColor: bankColor + '12',
                borderColor: bankColor + '30',
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Ionicons name="shield-checkmark" size={32} color={bankColor} />
          </Animated.View>

          {/* Wallet Icon */}
          <View style={[styles.iconCircle, { backgroundColor: colors.primaryBg, borderColor: colors.primary + '30' }]}>
            <Ionicons name="wallet" size={36} color={colors.primary} />
          </View>
        </View>

        {/* Status Message */}
        <Text style={[styles.statusText, { color: colors.text }]}>
          {statusMessages[statusIndex]}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: bankColor,
                  width: progressWidth,
                },
              ]}
            />
          </View>
        </View>

        {/* Helper Text */}
        <Text style={[styles.helperText, { color: colors.textSecondary }]}>
          This may take a moment
        </Text>
      </View>

      {/* Cancel Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.7}
          onPress={handleCancel}
        >
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  stepContainer: {
    marginBottom: spacing.xxl,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  stepBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  stepProgress: {
    height: '100%',
    borderRadius: 2,
  },
  bankInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankNameContainer: {
    alignItems: 'center',
  },
  bankName: {
    fontSize: 17,
    fontWeight: '700',
  },
  animationArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxxl,
    height: 120,
    position: 'relative',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 2,
  },
  dotsContainer: {
    position: 'absolute',
    left: 90,
    right: 90,
    top: '50%',
    marginTop: -1,
    zIndex: 1,
  },
  dotTrack: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: -4.5,
    left: 0,
  },
  pulseCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    position: 'absolute',
    zIndex: 0,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  helperText: {
    fontSize: 13,
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: spacing.md,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default BankConnectingScreen;
