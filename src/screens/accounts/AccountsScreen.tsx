import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { availableBanks } from '../../data/mockData';
import { formatCurrency } from '../../utils/format';
import { spacing, borderRadius, shadow } from '../../theme/spacing';
import Button from '../../components/common/Button';
import { useAppStore } from '../../store/AppStore';

function timeAgo(dateStr: string): string {
  const now = new Date('2026-09-30T16:00:00Z');
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface AccountsScreenProps {
  navigation: any;
}

const AccountsScreen: React.FC<AccountsScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { connectedAccounts } = useAppStore();

  const totalBalance = connectedAccounts.reduce(
    (sum: number, acc: any) => sum + acc.balance,
    0
  );

  const getSyncDotColor = (status: string) => {
    switch (status) {
      case 'synced':
        return colors.positive || '#10B981';
      case 'syncing':
        return colors.warning || '#F59E0B';
      case 'error':
        return colors.negative || '#EF4444';
      default:
        return colors.textTertiary || '#94A3B8';
    }
  };

  const getSyncLabel = (status: string) => {
    switch (status) {
      case 'synced':
        return 'Synced';
      case 'syncing':
        return 'Syncing';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getBankColor = (bankId: string) => {
    const bank = availableBanks.find((b) => b.id === bankId);
    return bank?.color || colors.primary;
  };

  const getAccountTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'checking':
        return 'wallet-outline';
      case 'savings':
        return 'save-outline';
      case 'credit':
        return 'card-outline';
      case 'investment':
        return 'trending-up-outline';
      case 'digital_wallet':
        return 'phone-portrait-outline';
      default:
        return 'cash-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Accounts</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
          <View style={styles.balanceMeta}>
            <Text style={styles.balanceSubtext}>
              {connectedAccounts.length} connected account{connectedAccounts.length !== 1 ? 's' : ''}
            </Text>
            <View style={styles.balanceDivider} />
            <Text style={styles.balanceSubtext}>
              Auto-sync enabled
            </Text>
          </View>
        </View>

        {/* Connect Bank Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AddAccount')}
          >
            <View style={[styles.connectIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="add-circle-outline" size={28} color={colors.primary} />
            </View>
            <View style={styles.connectTextContainer}>
              <Text style={[styles.connectTitle, { color: colors.primary }]}>Connect Bank</Text>
              <Text style={[styles.connectSubtitle, { color: colors.textSecondary }]}>
                Link a new bank account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Connected Accounts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Connected Accounts</Text>
          {connectedAccounts.map((account: any) => {
            const bankColor = getBankColor(account.bankId);
            return (
              <TouchableOpacity
                key={account.id}
                style={[styles.accountCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('AccountDetail', { accountId: account.id })}
              >
                <View style={styles.accountTop}>
                  <View style={[styles.bankIcon, { backgroundColor: bankColor + '15' }]}>
                    <Ionicons name="business-outline" size={22} color={bankColor} />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={[styles.accountName, { color: colors.text }]} numberOfLines={1}>
                      {account.accountName}
                    </Text>
                    <Text style={[styles.bankName, { color: colors.textSecondary }]}>
                      {account.bankName}
                    </Text>
                  </View>
                  <View style={styles.accountBalanceContainer}>
                    <Text
                      style={[
                        styles.accountBalance,
                        { color: account.balance >= 0 ? colors.text : colors.negative },
                      ]}
                    >
                      {formatCurrency(account.balance)}
                    </Text>
                  </View>
                </View>

                <View style={[styles.accountDivider, { backgroundColor: colors.border }]} />

                <View style={styles.accountBottom}>
                  <View style={styles.accountMetaLeft}>
                    <Text style={[styles.maskedNumber, { color: colors.textTertiary }]}>
                      {account.maskedNumber}
                    </Text>
                    <View style={styles.syncRow}>
                      <View
                        style={[
                          styles.syncDot,
                          { backgroundColor: getSyncDotColor(account.syncStatus) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.syncLabel,
                          { color: getSyncDotColor(account.syncStatus) },
                        ]}
                      >
                        {getSyncLabel(account.syncStatus)}
                      </Text>
                      <Text style={[styles.syncTime, { color: colors.textTertiary }]}>
                        {timeAgo(account.lastSynced)}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add Account Manually */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.manualCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AddAccount')}
          >
            <View style={[styles.manualIcon, { backgroundColor: colors.primary + '10' }]}>
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.manualInfo}>
              <Text style={[styles.manualTitle, { color: colors.text }]}>
                Add Account Manually
              </Text>
              <Text style={[styles.manualSubtitle, { color: colors.textSecondary }]}>
                Enter account details without bank linking
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    borderRadius: 20,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  balanceCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.lg,
  },
  balanceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  balanceDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing.md,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  connectIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  connectTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  connectSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  accountCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  accountTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '700',
  },
  bankName: {
    fontSize: 13,
    marginTop: 2,
  },
  accountBalanceContainer: {
    alignItems: 'flex-end',
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: '700',
  },
  accountDivider: {
    height: 1,
    marginHorizontal: spacing.lg,
  },
  accountBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  accountMetaLeft: {
    flex: 1,
  },
  maskedNumber: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  syncLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  syncTime: {
    fontSize: 12,
  },
  manualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  manualIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  manualTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  manualSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});

export default AccountsScreen;
