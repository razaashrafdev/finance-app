import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import Button from '../../components/common/Button';

interface BankConnectedScreenProps {
  navigation: any;
  route: {
    params: {
      bankId: string;
      bankName: string;
      bankColor: string;
    };
  };
}

const BankConnectedScreen: React.FC<BankConnectedScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, isDark } = useTheme();
  const { bankId, bankName, bankColor } = route.params;

  const checkScale = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const mockAccount = {
    bankName,
    accountName: 'Chase Total Checking',
    maskedNumber: '****4521',
    balance: 12450.83,
  };

  useEffect(() => {
    Animated.sequence([
      Animated.spring(circleScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const nextSteps = [
    { icon: 'sync-outline' as const, text: 'Transactions will sync automatically', color: colors.info },
    { icon: 'notifications-outline' as const, text: "We'll notify you of new activity", color: colors.warning },
    { icon: 'settings-outline' as const, text: 'You can disconnect anytime in settings', color: colors.textSecondary },
  ];

  const formatBalance = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        <View style={styles.backButton} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Account Connected!
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Indicator */}
        <View style={styles.stepContainer}>
          <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
            Step 5 of 5
          </Text>
          <View style={[styles.stepBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.stepProgress,
                { backgroundColor: bankColor, width: '100%' },
              ]}
            />
          </View>
        </View>

        {/* Success Animation */}
        <View style={styles.successArea}>
          <Animated.View
            style={[
              styles.successCircle,
              {
                backgroundColor: colors.positiveLight,
                borderColor: colors.positive,
                transform: [{ scale: circleScale }],
              },
            ]}
          >
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <Ionicons name="checkmark" size={56} color={colors.positive} />
            </Animated.View>
          </Animated.View>
        </View>

        {/* Title */}
        <Text style={[styles.successTitle, { color: colors.text }]}>
          Successfully Connected!
        </Text>

        {/* Bank Info Card */}
        <Animated.View
          style={[
            styles.accountCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: contentOpacity,
            },
          ]}
        >
          <View style={styles.accountHeader}>
            <View style={[styles.bankIcon, { backgroundColor: bankColor + '18' }]}>
              <Ionicons name="business" size={24} color={bankColor} />
            </View>
            <View style={styles.accountInfo}>
              <Text style={[styles.bankName, { color: colors.text }]}>
                {mockAccount.bankName}
              </Text>
              <Text style={[styles.accountName, { color: colors.textSecondary }]}>
                {mockAccount.accountName}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.accountDetails}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Account Number
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {mockAccount.maskedNumber}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Current Balance
              </Text>
              <Text style={[styles.balanceValue, { color: colors.positive }]}>
                {formatBalance(mockAccount.balance)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* What Happens Next */}
        <Animated.View style={{ opacity: contentOpacity }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            What happens next
          </Text>

          <View style={styles.stepsList}>
            {nextSteps.map((step, index) => (
              <View
                key={index}
                style={[
                  styles.stepItem,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={[styles.stepIcon, { backgroundColor: step.color + '15' }]}>
                  <Ionicons name={step.icon} size={20} color={step.color} />
                </View>
                <Text style={[styles.stepText, { color: colors.text }]}>
                  {step.text}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title="Start Initial Sync"
          onPress={() =>
            navigation.navigate('InitialSync', {
              bankId,
              bankName,
              bankColor,
            })
          }
          variant="primary"
          size="lg"
          style={{ backgroundColor: bankColor }}
        />
        <Button
          title="View Account Details"
          onPress={() =>
            navigation.navigate('AccountDetail', {
              accountId: bankId,
            })
          }
          variant="outline"
          size="lg"
          style={{ marginTop: spacing.sm }}
        />
        <TouchableOpacity
          style={styles.doneLink}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Text style={[styles.doneText, { color: colors.textSecondary }]}>
            Done
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 40,
  },
  stepContainer: {
    marginBottom: spacing.xxxl,
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
  successArea: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  accountCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  accountInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 17,
    fontWeight: '700',
  },
  accountName: {
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginBottom: spacing.lg,
  },
  accountDetails: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  stepsList: {
    gap: spacing.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
  },
  doneLink: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  doneText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default BankConnectedScreen;
