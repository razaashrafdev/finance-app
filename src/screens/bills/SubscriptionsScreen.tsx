import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput
} from 'react-native';
import { ScreenScrollView } from '../../components/common/ScreenScroll';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { formatCurrency, formatShortDate } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import BottomSheet from '../../components/common/BottomSheet';
import { useAppStore } from '../../store/AppStore';
import { toIonicon } from '../../utils/icons';

type FilterTab = 'all' | 'active' | 'paused' | 'cancelled';

interface SubscriptionsScreenProps {
  navigation: any;
}

const SubscriptionsScreen: React.FC<SubscriptionsScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { subscriptions, addSubscription } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [subName, setSubName] = useState('');
  const [subAmount, setSubAmount] = useState('');

  const filters: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'paused', label: 'Paused' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const filteredSubscriptions = subscriptions.filter((sub: any) => {
    if (activeFilter === 'all') return true;
    return sub.status === activeFilter;
  });

  const activeSubscriptions = subscriptions.filter((sub: any) => sub.status === 'active');
  const totalMonthlyCost = activeSubscriptions.reduce((sum: number, sub: any) => sum + sub.amount, 0);
  const annualProjection = totalMonthlyCost * 12;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', variant: 'success' as const };
      case 'paused':
        return { label: 'Paused', variant: 'warning' as const };
      case 'cancelled':
        return { label: 'Cancelled', variant: 'neutral' as const };
      default:
        return { label: status, variant: 'neutral' as const };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Subscriptions</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Monthly Cost Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.summaryLabel}>Total Monthly Cost</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalMonthlyCost)}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{activeSubscriptions.length}</Text>
              <Text style={styles.summaryStatLabel}>Active</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{subscriptions.length}</Text>
              <Text style={styles.summaryStatLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Annual Projection */}
        <View style={[styles.projectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.projectionLeft}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[styles.projectionTitle, { color: colors.text }]}>Annual Projection</Text>
          </View>
          <Text style={[styles.projectionAmount, { color: colors.primary }]}>{formatCurrency(annualProjection)}</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                {
                  backgroundColor: activeFilter === filter.key ? colors.primary : 'transparent',
                  borderColor: activeFilter === filter.key ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: activeFilter === filter.key ? '#FFFFFF' : colors.textSecondary,
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subscriptions List */}
        <View style={styles.listSection}>
          {filteredSubscriptions.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="reload-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No subscriptions</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                No subscriptions match this filter
              </Text>
            </View>
          ) : (
            filteredSubscriptions.map((sub: any) => {
              const status = getStatusBadge(sub.status);
              const isCancelled = sub.status === 'cancelled';
              return (
                <View
                  key={sub.id}
                  style={[
                    styles.subCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    isCancelled && styles.subCardCancelled,
                  ]}
                >
                  <View style={styles.subTop}>
                    <View style={[styles.subIconContainer, { backgroundColor: sub.color + '15' }]}>
                      <Ionicons name={toIonicon(sub.icon)} size={22} color={sub.color} />
                    </View>
                    <View style={styles.subInfo}>
                      <Text
                        style={[
                          styles.subName,
                          { color: isCancelled ? colors.textTertiary : colors.text },
                          isCancelled && styles.subNameCancelled,
                        ]}
                      >
                        {sub.name}
                      </Text>
                      <Text style={[styles.subBilling, { color: colors.textSecondary }]}>
                        Billing {formatShortDate(sub.billingDate)}
                      </Text>
                    </View>
                    <View style={styles.subRight}>
                      <Text
                        style={[
                          styles.subAmount,
                          {
                            color: isCancelled ? colors.textTertiary : colors.text,
                            textDecorationLine: isCancelled ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {formatCurrency(sub.amount)}/mo
                      </Text>
                      <Badge label={status.label} variant={status.variant} size="sm" />
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScreenScrollView>

      {/* Add Subscription Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title="Add Subscription"
          onPress={() => setSheetVisible(true)}
          icon={<Ionicons name="add" size={20} color="#FFFFFF" />}
          style={styles.addButton}
        />
      </View>

      {/* Add Subscription Bottom Sheet */}
      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} title="Add Subscription">
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetPlaceholder, { color: colors.textSecondary }]}>
            Subscription name
          </Text>
          <TextInput
            style={[styles.sheetInput, styles.sheetInputText, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, borderRadius: borderRadius.md, color: colors.text }]}
            placeholder="e.g. Netflix"
            placeholderTextColor={colors.textTertiary}
            value={subName}
            onChangeText={setSubName}
          />

          <Text style={[styles.sheetPlaceholder, { color: colors.textSecondary, marginTop: spacing.lg }]}>
            Monthly amount
          </Text>
          <TextInput
            style={[styles.sheetInput, styles.sheetInputText, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, borderRadius: borderRadius.md, color: colors.text }]}
            placeholder="$0.00"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            value={subAmount}
            onChangeText={setSubAmount}
          />

          <Button
            title="Add Subscription"
            onPress={() => {
              addSubscription({ name: subName, amount: parseFloat(subAmount) as any });
              setSubName('');
              setSubAmount('');
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
  summaryCard: {
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
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  projectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  projectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  projectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  projectionAmount: {
    fontSize: 17,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
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
  subCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  subCardCancelled: {
    opacity: 0.7,
  },
  subTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  subInfo: {
    flex: 1,
  },
  subName: {
    fontSize: 15,
    fontWeight: '700',
  },
  subNameCancelled: {
    textDecorationLine: 'line-through',
  },
  subBilling: {
    fontSize: 13,
    marginTop: 2,
  },
  subRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  subAmount: {
    fontSize: 16,
    fontWeight: '700',
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
  sheetButton: {
    marginTop: spacing.xxl,
    width: '100%',
  },
});

export default SubscriptionsScreen;
