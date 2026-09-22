import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { syncTransactions } from '../../data/mockData';
import Button from '../../components/common/Button';

interface SyncCompleteScreenProps {
  navigation: any;
  route: {
    params: {
      bankId: string;
      bankName: string;
      bankColor: string;
    };
  };
}

const SyncCompleteScreen: React.FC<SyncCompleteScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, isDark } = useTheme();
  const { bankId, bankName, bankColor } = route.params;

  const checkScale = useRef(new Animated.Value(0)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const [autoSync, setAutoSync] = React.useState(true);

  const newTransactions = syncTransactions.filter((t) => t.status === 'new').slice(0, 5);
  const totalNewCount = syncTransactions.filter((t) => t.status === 'new').length;

  const mockAccount = {
    accountName: 'Chase Total Checking',
    maskedNumber: '****4521',
    balance: 12450.83,
  };

  useEffect(() => {
    Animated.sequence([
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(bannerOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
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

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return amount < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'Food & Dining': '#F59E0B',
      Transportation: '#3B82F6',
      Shopping: '#8B5CF6',
      Entertainment: '#EC4899',
      Income: '#10B981',
    };
    return colorMap[category] || colors.textSecondary;
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
        <View style={styles.headerLeft}>
          <Ionicons name="checkmark-circle" size={22} color={colors.positive} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Sync Complete
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation */}
        <View style={styles.successArea}>
          <Animated.View
            style={[
              styles.successCircle,
              {
                backgroundColor: colors.positiveLight,
                borderColor: colors.positive,
                transform: [{ scale: checkScale }],
              },
            ]}
          >
            <Ionicons name="checkmark" size={56} color={colors.positive} />
          </Animated.View>
        </View>

        {/* Success Banner */}
        <Animated.View
          style={[
            styles.successBanner,
            { backgroundColor: colors.positive, opacity: bannerOpacity },
          ]}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.bannerText}>
            All transactions synced successfully
          </Text>
        </Animated.View>

        {/* Sync Summary Card */}
        <Animated.View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: contentOpacity,
            },
          ]}
        >
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Sync Summary
          </Text>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryDot, { backgroundColor: colors.info }]} />
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Total transactions synced
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>156</Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={[styles.summaryDot, { backgroundColor: colors.positive }]} />
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                New transactions
              </Text>
              <Text style={[styles.summaryValue, { color: colors.positive }]}>
                {totalNewCount}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={[styles.summaryDot, { backgroundColor: colors.warning }]} />
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Categories updated
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>8</Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={[styles.summaryDot, { backgroundColor: colors.textTertiary }]} />
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Last synced
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                Just now
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* New Transactions */}
        <Animated.View style={{ opacity: contentOpacity }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            New Transactions
          </Text>

          <View style={styles.transactionsList}>
            {newTransactions.map((transaction) => (
              <View
                key={transaction.id}
                style={[
                  styles.transactionItem,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.transactionLeft}>
                  <Text
                    style={[styles.transactionTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {transaction.title}
                  </Text>
                  <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                    {formatDate(transaction.date)}
                  </Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      { color: transaction.amount < 0 ? colors.negative : colors.positive },
                    ]}
                  >
                    {formatAmount(transaction.amount)}
                  </Text>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: getCategoryColor(transaction.category) + '18' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: getCategoryColor(transaction.category) },
                      ]}
                    >
                      {transaction.category}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.viewAllLink}
            activeOpacity={0.7}
            onPress={() => {}}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>
              View All {totalNewCount} Transactions
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Connected Account Info */}
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
              <Text style={[styles.accountName, { color: colors.text }]}>
                {mockAccount.accountName}
              </Text>
              <Text style={[styles.maskedNumber, { color: colors.textSecondary }]}>
                {mockAccount.maskedNumber}
              </Text>
            </View>
            <Text style={[styles.balanceText, { color: colors.text }]}>
              ${mockAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={[styles.accountDivider, { backgroundColor: colors.border }]} />

          <View style={styles.autoSyncRow}>
            <View style={styles.autoSyncLeft}>
              <Ionicons name="sync-outline" size={20} color={colors.text} />
              <Text style={[styles.autoSyncLabel, { color: colors.text }]}>
                Auto-sync
              </Text>
            </View>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: colors.border, true: colors.positive + '50' }}
              thumbColor={autoSync ? colors.positive : colors.textTertiary}
            />
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <Button
          title="View Account Details"
          onPress={() =>
            navigation.navigate('AccountDetail', {
              accountId: bankId,
            })
          }
          variant="primary"
          size="lg"
          style={{ backgroundColor: bankColor }}
        />
        <Button
          title="Done"
          onPress={() => navigation.navigate('AccountsScreen')}
          variant="outline"
          size="lg"
          style={{ marginTop: spacing.sm }}
        />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  successArea: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  summaryCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.xxxl,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  summaryGrid: {
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  transactionsList: {
    gap: spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  transactionLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 13,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  viewAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
  },
  accountCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginTop: spacing.xxxl,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  accountName: {
    fontSize: 16,
    fontWeight: '700',
  },
  maskedNumber: {
    fontSize: 13,
    marginTop: 2,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: '700',
  },
  accountDivider: {
    height: 1,
    marginVertical: spacing.lg,
  },
  autoSyncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  autoSyncLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  autoSyncLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
  },
});

export default SyncCompleteScreen;
