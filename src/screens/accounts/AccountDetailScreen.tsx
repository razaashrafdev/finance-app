import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { ScreenScrollView } from '../../components/common/ScreenScroll';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { availableBanks } from '../../data/banks';
import { resolveCategories } from '../../data/categories';
import { formatCurrency, formatDate } from '../../utils/format';
import { spacing, borderRadius, shadow } from '../../theme/spacing';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import BottomSheet from '../../components/common/BottomSheet';
import { useToast } from '../../components/common/Toast';
import { toIonicon } from '../../utils/icons';
import { useAppStore } from '../../store/AppStore';

// ─── Helpers ──────────────────────────────────────────────────
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

function getBankColor(bankId: string): string {
  const bank = availableBanks.find((b) => b.id === bankId);
  return bank?.color || '#4F46E5';
}

function getCategoryColor(
  category: string,
  categories: Record<string, { icon: string; color: string }>
): string {
  const key = Object.keys(categories).find(
    (k) => k.toLowerCase() === category.toLowerCase()
  );
  return key ? categories[key]?.color || '#607D8B' : '#607D8B';
}

// ─── Types ────────────────────────────────────────────────────
interface AccountDetailScreenProps {
  navigation: any;
  route: {
    params?: {
      accountId?: string;
    };
  };
}

const AccountDetailScreen: React.FC<AccountDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, isDark } = useTheme();
  const toast = useToast();
  const { connectedAccounts, transactions, categories: storeCategories } = useAppStore();
  const categories = resolveCategories(storeCategories);

  const accountId = route.params?.accountId;
  const account =
    connectedAccounts.find((a) => a.id === accountId) ||
    connectedAccounts[0];

  const bankColor = getBankColor(account.bankId);

  // ─── State ────────────────────────────────────────────────
  const [syncStatus, setSyncStatus] = useState<
    'synced' | 'syncing' | 'error'
  >(account.syncStatus as any);
  const [autoSync, setAutoSync] = useState(account.autoSync);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showReconnectSheet, setShowReconnectSheet] = useState(false);
  const [showDisconnectSheet, setShowDisconnectSheet] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const recentTransactions = transactions
    .filter((t) => t.accountId === account?.id || t.accountName === account?.accountName)
    .slice(0, 5);

  // ─── Sync Handler ─────────────────────────────────────────
  const handleSyncNow = useCallback(() => {
    setSyncStatus('syncing');
    toast.show('Syncing...', 'info');
    setTimeout(() => {
      setSyncStatus('synced');
      toast.show('Synced successfully', 'success');
    }, 2000);
  }, [toast]);

  // ─── Reconnect Handler ────────────────────────────────────
  const handleReconnect = useCallback(() => {
    setIsReconnecting(true);
    setShowReconnectSheet(false);
    toast.show('Reconnecting account...', 'info');
    setTimeout(() => {
      setIsReconnecting(false);
      setSyncStatus('synced');
      toast.show('Account reconnected successfully', 'success');
    }, 2500);
  }, [toast]);

  // ─── Disconnect Handler ───────────────────────────────────
  const handleDisconnect = useCallback(() => {
    setShowDisconnectSheet(false);
    toast.show('Account disconnected', 'success');
    setTimeout(() => {
      navigation.goBack();
    }, 800);
  }, [navigation, toast]);

  // ─── Sync Badge ───────────────────────────────────────────
  const getSyncBadge = () => {
    switch (syncStatus) {
      case 'synced':
        return <Badge label="Synced" variant="success" size="sm" />;
      case 'syncing':
        return <Badge label="Syncing" variant="warning" size="sm" />;
      case 'error':
        return <Badge label="Error" variant="danger" size="sm" />;
      default:
        return <Badge label="Unknown" variant="neutral" size="sm" />;
    }
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ─── Header ──────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Account Details
        </Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowOptionsSheet(true)}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={22}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScreenScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Account Hero Card ───────────────────────────────── */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: bankColor,
              shadowColor: bankColor,
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.bankIconCircle}>
              <Ionicons name="business" size={28} color="#FFFFFF" />
            </View>
            {getSyncBadge()}
          </View>

          <Text style={styles.heroAccountName}>{account.accountName}</Text>
          <Text style={styles.heroBankName}>{account.bankName}</Text>
          <Text style={styles.heroMaskedNumber}>{account.maskedNumber}</Text>

          <View style={styles.heroDivider} />

          <Text style={styles.heroBalanceLabel}>Current Balance</Text>
          <Text
            style={[
              styles.heroBalance,
              { color: account.balance < 0 ? '#FFCDD2' : '#FFFFFF' },
            ]}
          >
            {formatCurrency(account.balance)}
          </Text>
        </View>

        {/* ─── Quick Actions ───────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[
                styles.quickAction,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.7}
              onPress={handleSyncNow}
              disabled={syncStatus === 'syncing'}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.primary + '15' },
                ]}
              >
                {syncStatus === 'syncing' ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="refresh" size={22} color={colors.primary} />
                )}
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>
                Sync Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickAction,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.7}
              onPress={() =>
                toast.show('Transfer feature coming soon', 'info')
              }
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.info + '15' },
                ]}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={22}
                  color={colors.info}
                />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>
                Transfer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickAction,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('TransactionsList', {
                  accountId: account.id,
                })
              }
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: colors.positive + '15' },
                ]}
              >
                <Ionicons
                  name="list-outline"
                  size={22}
                  color={colors.positive}
                />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>
                Transactions
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Sync Status Card ────────────────────────────────── */}
        <View style={styles.section}>
          <Card variant="elevated">
            <View style={styles.syncCardHeader}>
              <View style={styles.syncCardTitleRow}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.syncCardTitle, { color: colors.text }]}
                >
                  Sync Status
                </Text>
              </View>
              {syncStatus === 'syncing' && (
                <ActivityIndicator size="small" color={colors.primary} />
              )}
            </View>

            <View style={styles.syncInfoRow}>
              <Text
                style={[
                  styles.syncInfoLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Last synced
              </Text>
              <Text style={[styles.syncInfoValue, { color: colors.text }]}>
                {timeAgo(account.lastSynced)}
              </Text>
            </View>

            <View style={[styles.syncDivider, { backgroundColor: colors.border }]} />

            <View style={styles.syncInfoRow}>
              <Text
                style={[
                  styles.syncInfoLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Sync frequency
              </Text>
              <Text style={[styles.syncInfoValue, { color: colors.text }]}>
                Every 4 hours
              </Text>
            </View>

            <View style={[styles.syncDivider, { backgroundColor: colors.border }]} />

            <View style={styles.autoSyncRow}>
              <View style={styles.autoSyncLeft}>
                <Ionicons
                  name="sync-outline"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.autoSyncLabel, { color: colors.text }]}
                >
                  Auto-sync
                </Text>
              </View>
              <Switch
                value={autoSync}
                onValueChange={(val) => {
                  setAutoSync(val);
                  toast.show(
                    val ? 'Auto-sync enabled' : 'Auto-sync disabled',
                    'success'
                  );
                }}
                trackColor={{
                  false: colors.border,
                  true: colors.primary + '50',
                }}
                thumbColor={autoSync ? colors.primary : colors.textTertiary}
              />
            </View>

            {!autoSync && (
              <>
                <View
                  style={[
                    styles.syncDivider,
                    { backgroundColor: colors.border },
                  ]}
                />
                <TouchableOpacity
                  style={styles.manualSyncButton}
                  activeOpacity={0.7}
                  onPress={handleSyncNow}
                  disabled={syncStatus === 'syncing'}
                >
                  <Ionicons
                    name="refresh"
                    size={18}
                    color={colors.primary}
                  />
                  <Text
                    style={[
                      styles.manualSyncText,
                      { color: colors.primary },
                    ]}
                  >
                    {syncStatus === 'syncing'
                      ? 'Syncing...'
                      : 'Sync Now'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Card>
        </View>

        {/* ─── Account Information ─────────────────────────────── */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: colors.textSecondary }]}
          >
            Account Information
          </Text>
          <Card variant="elevated">
            <InfoRow
              icon="wallet-outline"
              label="Account Type"
              value={
                account.accountType.charAt(0).toUpperCase() +
                account.accountType.slice(1)
              }
              colors={colors}
            />
            <InfoRow
              icon="card-outline"
              label="Account Number"
              value={account.maskedNumber}
              colors={colors}
            />
            <InfoRow
              icon="calendar-outline"
              label="Connected on"
              value={formatDate(account.connectedAt)}
              colors={colors}
            />
            <InfoRow
              icon="business-outline"
              label="Institution"
              value={account.bankName}
              colors={colors}
            />
            <InfoRow
              icon="receipt-outline"
              label="Total transactions synced"
              value={account.transactionCount.toString()}
              colors={colors}
              last
            />
          </Card>
        </View>

        {/* ─── Recent Transactions ─────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.textSecondary },
              ]}
            >
              Recent Transactions
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('TransactionsList', {
                  accountId: account.id,
                })
              }
            >
              <Text style={[styles.seeAllLink, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length > 0 ? (
            <Card variant="elevated" style={styles.transactionCard}>
              {recentTransactions.map((txn, index) => {
                const catColor = getCategoryColor(txn.category, categories);
                return (
                  <View key={txn.id}>
                    <View style={styles.transactionRow}>
                      <View
                        style={[
                          styles.transactionIcon,
                          { backgroundColor: catColor + '15' },
                        ]}
                      >
                        <Ionicons
                          name={toIonicon(
                            (categories as any)[txn.category]?.icon ||
                            'pricetag-outline'
                          )}
                          size={18}
                          color={catColor}
                        />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text
                          style={[
                            styles.transactionTitle,
                            { color: colors.text },
                          ]}
                          numberOfLines={1}
                        >
                          {txn.title}
                        </Text>
                        <Text
                          style={[
                            styles.transactionDate,
                            { color: colors.textTertiary },
                          ]}
                        >
                          {formatDate(txn.date)}
                        </Text>
                      </View>
                      <View style={styles.transactionRight}>
                        <Text
                          style={[
                            styles.transactionAmount,
                            {
                              color:
                                txn.amount >= 0
                                  ? colors.positive
                                  : colors.negative,
                            },
                          ]}
                        >
                          {txn.amount >= 0 ? '+' : ''}
                          {formatCurrency(txn.amount)}
                        </Text>
                        <Badge
                          label={txn.category}
                          variant="neutral"
                          size="sm"
                          style={styles.transactionBadge}
                        />
                      </View>
                    </View>
                    {index < recentTransactions.length - 1 && (
                      <View
                        style={[
                          styles.transactionDivider,
                          { backgroundColor: colors.border },
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </Card>
          ) : (
            <Card variant="outlined">
              <View style={styles.emptyTransactions}>
                <Ionicons
                  name="receipt-outline"
                  size={32}
                  color={colors.textTertiary}
                />
                <Text
                  style={[
                    styles.emptyText,
                    { color: colors.textSecondary },
                  ]}
                >
                  No recent transactions
                </Text>
              </View>
            </Card>
          )}

          {recentTransactions.length > 0 && (
            <TouchableOpacity
              style={[
                styles.viewAllButton,
                {
                  backgroundColor: colors.primary + '10',
                  borderColor: colors.primary + '30',
                },
              ]}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('TransactionsList', {
                  accountId: account.id,
                })
              }
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All Transactions
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* ─── Danger Zone ─────────────────────────────────────── */}
        <View style={styles.section}>
          <View
            style={[
              styles.dangerSeparator,
              { backgroundColor: colors.border },
            ]}
          />
          <Text
            style={[
              styles.dangerSectionTitle,
              { color: colors.textSecondary },
            ]}
          >
            Danger Zone
          </Text>

          <Card variant="outlined" style={styles.dangerCard}>
            <TouchableOpacity
              style={styles.dangerOption}
              activeOpacity={0.7}
              onPress={() => setShowReconnectSheet(true)}
            >
              <View
                style={[
                  styles.dangerIcon,
                  { backgroundColor: colors.warning + '15' },
                ]}
              >
                <Ionicons
                  name="refresh-circle-outline"
                  size={22}
                  color={colors.warning}
                />
              </View>
              <View style={styles.dangerInfo}>
                <Text
                  style={[styles.dangerLabel, { color: colors.text }]}
                >
                  Reconnect Account
                </Text>
                <Text
                  style={[
                    styles.dangerDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Refresh connection and sync latest data
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textTertiary}
              />
            </TouchableOpacity>

            <View
              style={[
                styles.dangerDivider,
                { backgroundColor: colors.border },
              ]}
            />

            <TouchableOpacity
              style={styles.dangerOption}
              activeOpacity={0.7}
              onPress={() => setShowDisconnectSheet(true)}
            >
              <View
                style={[
                  styles.dangerIcon,
                  { backgroundColor: '#FEE2E2' },
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color={colors.negative}
                />
              </View>
              <View style={styles.dangerInfo}>
                <Text
                  style={[
                    styles.dangerLabel,
                    { color: colors.negative },
                  ]}
                >
                  Disconnect Account
                </Text>
                <Text
                  style={[
                    styles.dangerDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Stop syncing transactions from this account
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.negative}
              />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.bottomSpacer} />
      </ScreenScrollView>

      {/* ─── Options Bottom Sheet ──────────────────────────────── */}
      <BottomSheet
        visible={showOptionsSheet}
        onClose={() => setShowOptionsSheet(false)}
        title="Account Options"
      >
        <View style={sheetStyles.optionsContainer}>
          <SheetOption
            icon="refresh"
            label="Sync Now"
            color={colors.primary}
            onPress={() => {
              setShowOptionsSheet(false);
              handleSyncNow();
            }}
            colors={colors}
          />
          <SheetOption
            icon="create-outline"
            label="Edit Account Name"
            color={colors.info}
            onPress={() => {
              setShowOptionsSheet(false);
              toast.show('Edit feature coming soon', 'info');
            }}
            colors={colors}
          />
          <SheetOption
            icon="notifications-outline"
            label="Notification Settings"
            color={colors.warning}
            onPress={() => {
              setShowOptionsSheet(false);
              toast.show('Notification settings coming soon', 'info');
            }}
            colors={colors}
          />
          <View style={[sheetStyles.divider, { backgroundColor: colors.border }]} />
          <SheetOption
            icon="trash-outline"
            label="Disconnect"
            color={colors.negative}
            onPress={() => {
              setShowOptionsSheet(false);
              setShowDisconnectSheet(true);
            }}
            colors={colors}
          />
        </View>
      </BottomSheet>

      {/* ─── Reconnect Bottom Sheet ────────────────────────────── */}
      <BottomSheet
        visible={showReconnectSheet}
        onClose={() => setShowReconnectSheet(false)}
        title="Reconnect Account"
      >
        <View style={sheetStyles.reconnectContent}>
          <View
            style={[
              sheetStyles.reconnectIcon,
              { backgroundColor: colors.warning + '15' },
            ]}
          >
            <Ionicons
              name="refresh-circle"
              size={48}
              color={colors.warning}
            />
          </View>
          <Text style={[sheetStyles.reconnectTitle, { color: colors.text }]}>
            Reconnect to {account.bankName}?
          </Text>
          <Text
            style={[
              sheetStyles.reconnectDescription,
              { color: colors.textSecondary },
            ]}
          >
            This will refresh your connection and sync the latest data from
            your account. Your existing data will not be affected.
          </Text>
          <Button
            title="Reconnect"
            onPress={handleReconnect}
            loading={isReconnecting}
            icon={
              <Ionicons
                name="refresh"
                size={18}
                color="#FFFFFF"
              />
            }
            style={sheetStyles.reconnectButton}
          />
        </View>
      </BottomSheet>

      {/* ─── Disconnect Bottom Sheet ───────────────────────────── */}
      <BottomSheet
        visible={showDisconnectSheet}
        onClose={() => setShowDisconnectSheet(false)}
        title="Disconnect Account"
      >
        <View style={sheetStyles.disconnectContent}>
          <View
            style={[
              sheetStyles.disconnectIcon,
              { backgroundColor: '#FEE2E2' },
            ]}
          >
            <Ionicons
              name="warning"
              size={40}
              color={colors.negative}
            />
          </View>
          <Text
            style={[sheetStyles.disconnectTitle, { color: colors.text }]}
          >
            Disconnect {account.bankName}?
          </Text>
          <Text
            style={[
              sheetStyles.disconnectDescription,
              { color: colors.textSecondary },
            ]}
          >
            This will stop syncing transactions from this account. Your
            existing data will be preserved.
          </Text>
          <View style={sheetStyles.disconnectActions}>
            <Button
              title="Cancel"
              onPress={() => setShowDisconnectSheet(false)}
              variant="outline"
              style={sheetStyles.disconnectCancelButton}
            />
            <Button
              title="Disconnect"
              onPress={handleDisconnect}
              variant="danger"
              style={sheetStyles.disconnectButton}
            />
          </View>
        </View>
      </BottomSheet>
    </View>
  );
};

// ─── Sub-Components ─────────────────────────────────────────
interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: any;
  last?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  label,
  value,
  colors,
  last,
}) => (
  <View>
    <View style={infoStyles.row}>
      <View style={infoStyles.labelRow}>
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
        <Text style={[infoStyles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      </View>
      <Text style={[infoStyles.value, { color: colors.text }]}>{value}</Text>
    </View>
    {!last && (
      <View
        style={[infoStyles.divider, { backgroundColor: colors.border }]}
      />
    )}
  </View>
);

interface SheetOptionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
  colors: any;
}

const SheetOption: React.FC<SheetOptionProps> = ({
  icon,
  label,
  color,
  onPress,
  colors,
}) => (
  <TouchableOpacity
    style={[sheetStyles.option, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <View style={[sheetStyles.optionIcon, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={[sheetStyles.optionLabel, { color: colors.text }]}>
      {label}
    </Text>
    <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
  </TouchableOpacity>
);

// ─── Styles ──────────────────────────────────────────────────
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
  headerButton: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Hero Card ─────────────────────────────────────────────
  heroCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  bankIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroAccountName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  heroBankName: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: spacing.xxs,
  },
  heroMaskedNumber: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    letterSpacing: 1,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: spacing.lg,
  },
  heroBalanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs,
  },
  heroBalance: {
    fontSize: 32,
    fontWeight: '800',
  },

  // ── Quick Actions ─────────────────────────────────────────
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Sync Status Card ──────────────────────────────────────
  syncCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  syncCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  syncCardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  syncInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  syncInfoLabel: {
    fontSize: 14,
  },
  syncInfoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  syncDivider: {
    height: 1,
  },
  autoSyncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
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
  manualSyncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  manualSyncText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // ── Transactions ──────────────────────────────────────────
  transactionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionBadge: {
    alignSelf: 'flex-end',
  },
  transactionDivider: {
    height: 1,
    marginLeft: 68,
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // ── Danger Zone ───────────────────────────────────────────
  dangerSeparator: {
    height: 1,
    marginBottom: spacing.xxl,
  },
  dangerSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  dangerCard: {
    padding: 0,
    overflow: 'hidden',
  },
  dangerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dangerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  dangerLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  dangerDescription: {
    fontSize: 13,
  },
  dangerDivider: {
    height: 1,
    marginLeft: 68,
  },
  bottomSpacer: {
    height: 20,
  },
});

// ─── Info Row Styles ────────────────────────────────────────
const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
});

// ─── Sheet Styles ───────────────────────────────────────────
const sheetStyles = StyleSheet.create({
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 14,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },

  // ── Reconnect Sheet ───────────────────────────────────────
  reconnectContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  reconnectIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  reconnectTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  reconnectDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  reconnectButton: {
    width: '100%',
  },

  // ── Disconnect Sheet ──────────────────────────────────────
  disconnectContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  disconnectIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  disconnectTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  disconnectDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  disconnectActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  disconnectCancelButton: {
    flex: 1,
  },
  disconnectButton: {
    flex: 1,
  },
});

export default AccountDetailScreen;
