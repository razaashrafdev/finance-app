import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import Button from '../../components/common/Button';

interface InitialSyncScreenProps {
  navigation: any;
  route: {
    params: {
      bankId: string;
      bankName: string;
      bankColor: string;
    };
  };
}

interface SyncStep {
  id: number;
  label: string;
  completeAtMs: number;
  status: 'pending' | 'active' | 'done';
}

const TOTAL_TRANSACTIONS = 156;
const SYNC_DURATION_MS = 10000;

const InitialSyncScreen: React.FC<InitialSyncScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, isDark } = useTheme();
  const { bankId, bankName, bankColor } = route.params;

  const rotationAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const confettiScale = useRef(new Animated.Value(0)).current;
  const confettiOpacity = useRef(new Animated.Value(0)).current;

  const [syncComplete, setSyncComplete] = useState(false);
  const [transactionCount, setTransactionCount] = useState(0);
  const [steps, setSteps] = useState<SyncStep[]>([
    { id: 0, label: 'Connecting to account...', completeAtMs: 1000, status: 'pending' },
    { id: 1, label: 'Fetching account balance...', completeAtMs: 2000, status: 'pending' },
    { id: 2, label: 'Downloading transactions...', completeAtMs: 5000, status: 'pending' },
    { id: 3, label: 'Categorizing transactions...', completeAtMs: 7000, status: 'pending' },
    { id: 4, label: 'Finalizing...', completeAtMs: 9000, status: 'pending' },
  ]);

  useEffect(() => {
    const rotation = Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotation.start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: SYNC_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const startTime = Date.now();

    const stepInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setSteps((prev) =>
        prev.map((step) => {
          if (elapsed >= step.completeAtMs && step.status !== 'done') {
            return { ...step, status: 'done' };
          }
          if (
            elapsed >= step.completeAtMs - 500 &&
            step.status === 'pending'
          ) {
            return { ...step, status: 'active' };
          }
          return step;
        })
      );
    }, 100);

    const countInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / SYNC_DURATION_MS, 1);
      const eased = progress * (2 - progress);
      setTransactionCount(Math.floor(eased * TOTAL_TRANSACTIONS));
    }, 50);

    const completeTimeout = setTimeout(() => {
      setTransactionCount(TOTAL_TRANSACTIONS);
      setSyncComplete(true);
      rotation.stop();

      Animated.parallel([
        Animated.spring(confettiScale, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(confettiOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, SYNC_DURATION_MS + 500);

    return () => {
      rotation.stop();
      clearInterval(stepInterval);
      clearInterval(countInterval);
      clearTimeout(completeTimeout);
    };
  }, []);

  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const percentage = Math.min(
    Math.floor((transactionCount / TOTAL_TRANSACTIONS) * 100),
    100
  );

  const getStepIcon = (status: 'pending' | 'active' | 'done') => {
    if (status === 'done') return 'checkmark-circle';
    if (status === 'active') return 'time';
    return 'ellipse-outline';
  };

  const getStepColor = (status: 'pending' | 'active' | 'done') => {
    if (status === 'done') return colors.positive;
    if (status === 'active') return bankColor;
    return colors.textTertiary;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View
        style={[
          styles.header,
          { backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <View style={[styles.backButton, { opacity: syncComplete ? 1 : 0.3 }]}>
          {!syncComplete && (
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          )}
        </View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {syncComplete ? 'Sync Complete' : 'Syncing Transactions'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {!syncComplete ? (
          <>
            {/* Sync Icon */}
            <View style={styles.syncIconArea}>
              <Animated.View
                style={[
                  styles.syncIconCircle,
                  {
                    backgroundColor: bankColor + '12',
                    borderColor: bankColor + '30',
                    transform: [{ rotate: spin }],
                  },
                ]}
              >
                <Ionicons name="sync" size={40} color={bankColor} />
              </Animated.View>
            </View>

            {/* Progress Section */}
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Syncing your transactions...
            </Text>

            <Text style={[styles.percentageText, { color: bankColor }]}>
              {percentage}%
            </Text>

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

            <Text style={[styles.countText, { color: colors.textSecondary }]}>
              {transactionCount} of {TOTAL_TRANSACTIONS} transactions synced
            </Text>

            {/* Sync Steps */}
            <View style={styles.stepsContainer}>
              {steps.map((step) => (
                <View key={step.id} style={styles.stepRow}>
                  <Ionicons
                    name={getStepIcon(step.status)}
                    size={22}
                    color={getStepColor(step.status)}
                  />
                  <Text
                    style={[
                      styles.stepLabel,
                      {
                        color:
                          step.status === 'done'
                            ? colors.textSecondary
                            : step.status === 'active'
                            ? colors.text
                            : colors.textTertiary,
                        fontWeight: step.status === 'active' ? '600' : '400',
                      },
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Success State */}
            <Animated.View
              style={[
                styles.successArea,
                {
                  opacity: confettiOpacity,
                  transform: [{ scale: confettiScale }],
                },
              ]}
            >
              <View
                style={[
                  styles.successCircle,
                  {
                    backgroundColor: colors.positiveLight,
                    borderColor: colors.positive,
                  },
                ]}
              >
                <Ionicons name="checkmark" size={56} color={colors.positive} />
              </View>

              {/* Confetti dots */}
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 80;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const confettiColors = [colors.positive, colors.info, colors.warning, bankColor];
                return (
                  <View
                    key={i}
                    style={[
                      styles.confettiDot,
                      {
                        backgroundColor: confettiColors[i % confettiColors.length],
                        transform: [
                          { translateX: x },
                          { translateY: y },
                        ],
                      },
                    ]}
                  />
                );
              })}
            </Animated.View>

            <Text style={[styles.successTitle, { color: colors.text }]}>
              All caught up!
            </Text>
            <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
              {TOTAL_TRANSACTIONS} transactions synced
            </Text>

            {/* New Transactions Card */}
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.primaryBg,
                  borderColor: colors.primary + '30',
                },
              ]}
            >
              <Ionicons name="document-text-outline" size={22} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: colors.primary }]}>
                  10 new transactions found
                </Text>
                <Text style={[styles.infoSubtitle, { color: colors.primary }]}>
                  Recently added to your account
                </Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Bottom Actions */}
      {syncComplete && (
        <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Button
            title="View Transactions"
            onPress={() =>
              navigation.navigate('TransactionDetail', {
                transactionId: 'new',
              })
            }
            variant="primary"
            size="lg"
            style={{ backgroundColor: bankColor }}
          />
        </View>
      )}
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
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  syncIconArea: {
    marginBottom: spacing.xxl,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: spacing.xl,
  },
  percentageText: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  progressContainer: {
    width: '100%',
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  countText: {
    fontSize: 14,
    marginBottom: spacing.xxxl,
  },
  stepsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepLabel: {
    fontSize: 15,
    flex: 1,
  },
  successArea: {
    height: 160,
    width: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  confettiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    fontSize: 16,
    marginBottom: spacing.xxl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    width: '100%',
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoSubtitle: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.7,
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
  },
});

export default InitialSyncScreen;
