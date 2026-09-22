import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { formatCurrency, daysUntil, formatShortDate } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import BottomSheet from '../../components/common/BottomSheet';
import { useAppStore } from '../../store/AppStore';
import { toIonicon } from '../../utils/icons';

type Tab = 'upcoming' | 'paid' | 'overdue';

interface BillsScreenProps {
  navigation: any;
}

const BillsScreen: React.FC<BillsScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { bills, addBill } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'paid', label: 'Paid' },
    { key: 'overdue', label: 'Overdue' },
  ];

  const now = new Date();

  const getFilteredBills = useCallback(() => {
    switch (activeTab) {
      case 'paid':
        return bills.filter((b: any) => b.isPaid);
      case 'upcoming':
        return bills.filter((b: any) => {
          if (b.isPaid) return false;
          const days = daysUntil(b.dueDate);
          return days >= 0;
        });
      case 'overdue':
        return bills.filter((b: any) => {
          if (b.isPaid) return false;
          return daysUntil(b.dueDate) < 0;
        });
      default:
        return [];
    }
  }, [activeTab, bills]);

  const filteredBills = getFilteredBills();
  const totalAmount = filteredBills.reduce((sum: number, b: any) => sum + b.amount, 0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getBillStatusBadge = (bill: any) => {
    if (bill.isPaid) {
      return { label: 'Paid', variant: 'success' as const };
    }
    const days = daysUntil(bill.dueDate);
    if (days < 0) {
      return { label: 'Overdue', variant: 'danger' as const };
    }
    if (days <= 3) {
      return { label: `Due in ${days} day${days !== 1 ? 's' : ''}`, variant: 'danger' as const };
    }
    if (days <= 7) {
      return { label: `Due in ${days} days`, variant: 'warning' as const };
    }
    return { label: `Due in ${days} days`, variant: 'info' as const };
  };

  const getCategoryColor = (category: string): string => {
    const map: Record<string, string> = {
      Housing: '#3B82F6',
      Utilities: '#06B6D4',
      Entertainment: '#EF4444',
      Health: '#10B981',
      Transport: '#8B5CF6',
      Food: '#F97316',
    };
    return map[category] || colors.primary;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Bills</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Segmented Tabs */}
        <View style={[styles.tabBar, { backgroundColor: colors.inputBg || colors.borderLight, borderColor: colors.border }]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && { backgroundColor: colors.card },
              ]}
              activeOpacity={0.7}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? colors.text : colors.textTertiary },
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            {activeTab === 'paid' ? 'Total Paid' : activeTab === 'overdue' ? 'Total Overdue' : 'Total Upcoming'}
          </Text>
          <Text style={[styles.summaryAmount, { color: colors.text }]}>{formatCurrency(totalAmount)}</Text>
          <Text style={[styles.summaryCount, { color: colors.textTertiary }]}>
            {filteredBills.length} bill{filteredBills.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Bills List */}
        <View style={styles.listSection}>
          {filteredBills.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="receipt-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No bills found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {activeTab === 'paid'
                  ? 'No bills have been paid yet'
                  : activeTab === 'overdue'
                  ? 'No overdue bills - great job!'
                  : 'No upcoming bills at the moment'}
              </Text>
            </View>
          ) : (
            filteredBills.map((bill: any) => {
              const status = getBillStatusBadge(bill);
              const catColor = getCategoryColor(bill.category);
              return (
                <View key={bill.id} style={[styles.billCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.billTop}>
                    <View style={[styles.billIconContainer, { backgroundColor: catColor + '15' }]}>
                      <Ionicons name={toIonicon(bill.icon)} size={22} color={catColor} />
                    </View>
                    <View style={styles.billInfo}>
                      <View style={styles.billNameRow}>
                        <Text style={[styles.billName, { color: colors.text }]}>{bill.name}</Text>
                        {bill.autopay && (
                          <View style={[styles.autopayBadge, { backgroundColor: colors.positive + '15' }]}>
                            <Ionicons name="sync-outline" size={10} color={colors.positive} />
                            <Text style={[styles.autopayText, { color: colors.positive }]}>Auto</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.billDue, { color: colors.textSecondary }]}>
                        Due {formatShortDate(bill.dueDate)}
                      </Text>
                    </View>
                    <View style={styles.billRight}>
                      <Text style={[styles.billAmount, { color: colors.text }]}>
                        {formatCurrency(bill.amount)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.billBottom}>
                    <Badge label={bill.frequency === 'monthly' ? 'Monthly' : 'Weekly'} variant="neutral" size="sm" />
                    <Badge label={status.label} variant={status.variant} size="sm" />
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Add Bill Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title="Add Bill"
          onPress={() => setSheetVisible(true)}
          icon={<Ionicons name="add" size={20} color="#FFFFFF" />}
          style={styles.addButton}
        />
      </View>

      {/* Add Bill Bottom Sheet */}
      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} title="Add Bill">
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetPlaceholder, { color: colors.textSecondary }]}>
            Bill name
          </Text>
          <TextInput
            style={[styles.sheetInput, styles.sheetInputText, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, borderRadius: borderRadius.md, color: colors.text }]}
            placeholder="e.g. Electricity"
            placeholderTextColor={colors.textTertiary}
            value={billName}
            onChangeText={setBillName}
          />

          <Text style={[styles.sheetPlaceholder, { color: colors.textSecondary, marginTop: spacing.lg }]}>
            Amount
          </Text>
          <TextInput
            style={[styles.sheetInput, styles.sheetInputText, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, borderRadius: borderRadius.md, color: colors.text }]}
            placeholder="$0.00"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            value={billAmount}
            onChangeText={setBillAmount}
          />

          <Button
            title="Add Bill"
            onPress={() => {
              addBill({ name: billName, amount: parseFloat(billAmount) as any });
              setBillName('');
              setBillAmount('');
              setSheetVisible(false);
            }}
            style={styles.sheetButton}
          />
        </View>
      </BottomSheet>
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
    paddingBottom: 100,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: borderRadius.md,
    padding: 3,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm - 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  summaryCount: {
    fontSize: 13,
  },
  listSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxxl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  billCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  billTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  billInfo: {
    flex: 1,
  },
  billNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  billName: {
    fontSize: 15,
    fontWeight: '700',
  },
  autopayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  autopayText: {
    fontSize: 10,
    fontWeight: '600',
  },
  billDue: {
    fontSize: 13,
    marginTop: 2,
  },
  billRight: {
    marginLeft: spacing.md,
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  billBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
  },
  addButton: {
    width: '100%',
  },
  sheetContent: {
    paddingTop: spacing.sm,
  },
  sheetPlaceholder: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  sheetInput: {
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sheetInputText: {
    fontSize: 15,
  },
  autopayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  autopayLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  sheetButton: {
    marginTop: spacing.xxl,
    width: '100%',
  },
});

export default BillsScreen;
