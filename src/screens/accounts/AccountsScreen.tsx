import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { ScreenScrollView } from '../../components/common/ScreenScroll';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { availableBanks } from '../../data/banks';
import { formatCurrency } from '../../utils/format';
import { spacing, borderRadius, shadow } from '../../theme/spacing';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
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

      <ScreenScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Balance Card */}
        <LinearGradient
          colors={isDark ? ['#6366F1', '#4F46E5', '#3730A3'] : ['#4F46E5', '#6366F1', '#818CF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeaderRow}>
            <View>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
            </View>
            <View style={styles.balanceIconBubble}>
              <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.balanceMeta}>
            <View style={styles.metaPill}>
              <Ionicons name="card-outline" size={13} color="rgba(255,255,255,0.9)" />
              <Text style={styles.balanceSubtext}>
                {connectedAccounts.length} connected account{connectedAccounts.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <Text style={styles.balanceSubtext}>
              Manual import only
            </Text>
          </View>
        </LinearGradient>

        {/* Connect Bank Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: colors.card, borderColor: colors.cardBorder || colors.border }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AddAccount')}
          >
            <View style={[styles.connectIconContainer, { backgroundColor: colors.primary + '18' }]}>
              <Ionicons name="add-circle" size={26} color={colors.primary} />
            </View>
            <View style={styles.connectTextContainer}>
              <Text style={[styles.connectTitle, { color: colors.text }]}>Connect Bank</Text>
              <Text style={[styles.connectSubtitle, { color: colors.textSecondary }]}>
                Link a new bank account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Connected Accounts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Connected Accounts</Text>
          {connectedAccounts.map((account: any) => {
            const bankColor = getBankColor(account.bankId);
            const badgeVariant = account.syncStatus === 'synced' ? 'success' : account.syncStatus === 'syncing' ? 'warning' : 'danger';
            return (
              <TouchableOpacity
                key={account.id}
                style={[styles.accountCard, { backgroundColor: colors.card, borderColor: colors.cardBorder || colors.border }]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('AccountDetail', { accountId: account.id })}
              >
                <View style={styles.accountTop}>
                  <View style={[styles.bankIcon, { backgroundColor: bankColor + '18' }]}>
                    <Ionicons name="business" size={22} color={bankColor} />
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

                <View style={[styles.accountDivider, { backgroundColor: colors.borderLight || colors.border }]} />

                <View style={styles.accountBottom}>
                  <View style={styles.accountMetaLeft}>
                    <Text style={[styles.maskedNumber, { color: colors.textTertiary }]}>
                      {account.maskedNumber}
                    </Text>
                    <View style={styles.syncRow}>
                      <Badge
                        variant={badgeVariant}
                        label={getSyncLabel(account.syncStatus)}
                        size="sm"
                        dot
                      />
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
            style={[styles.manualCard, { backgroundColor: colors.card, borderColor: colors.cardBorder || colors.border }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AddAccount')}
          >
            <View style={[styles.manualIcon, { backgroundColor: colors.primary + '14' }]}>
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

        {/* Import Bank Statement */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.importButton, { backgroundColor: colors.card, borderColor: colors.cardBorder || colors.border }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('BankStatement')}
          >
            <View style={[styles.importIconContainer, { backgroundColor: colors.primary + '18' }]}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
            </View>
            <View style={styles.importTextContainer}>
              <Text style={[styles.importTitle, { color: colors.text }]}>Import Bank Statement</Text>
              <Text style={[styles.importSubtitle, { color: colors.textSecondary }]}>
                Upload PDF statement to add transactions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </ScreenScrollView>
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
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  balanceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  balanceIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  balanceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 6,
  },
  balanceSubtext: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
  balanceDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing.sm,
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
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    marginBottom: 6,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncTime: {
    fontSize: 12,
  },
  manualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  importIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  importTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  importTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  importSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
 });

export default AccountsScreen;
