import React, { useState, useMemo } from 'react';
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
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { categories } from '../../data/mockData';
import { formatCurrency } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAppStore } from '../../store/AppStore';
import { toIonicon } from '../../utils/icons';

interface BudgetsListScreenProps {
  navigation: any;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const BudgetsListScreen: React.FC<BudgetsListScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { budgets, transactions } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const totalBudgeted = useMemo(
    () => budgets.reduce((sum: number, b: any) => sum + b.budgeted, 0),
    [budgets]
  );
  const totalSpent = useMemo(
    () => budgets.reduce((sum: number, b: any) => sum + b.spent, 0),
    [budgets]
  );
  const totalRemaining = totalBudgeted - totalSpent;
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const getBarColor = (percentage: number) => {
    if (percentage >= 90) return '#EF4444';
    if (percentage >= 70) return '#F59E0B';
    return '#10B981';
  };

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const getTransactionsForCategory = (category: string) =>
    transactions.filter(
      (t: any) =>
        t.type === 'expense' &&
        (t.category === category || t.subcategory === category)
    );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.text === '#F8FAFC' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerSpacer} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Budgets</Text>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: colors.surface || colors.card }]}
          onPress={() => navigation.navigate('MoreTab', { screen: 'NotificationsScreen' })}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.monthArrow}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: colors.text }]}>
            {MONTHS[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.monthArrow}>
            <Ionicons name="chevron-forward" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Total Budget Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.summaryLabel}>Total Budget</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalBudgeted)}</Text>
          <View style={styles.summaryBarBg}>
            <View
              style={[
                styles.summaryBarFill,
                { width: `${Math.min(overallPercentage, 100)}%` },
              ]}
            />
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryStat}>
              <Ionicons name="wallet-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.summaryStatLabel}> Spent</Text>
              <Text style={styles.summaryStatValue}> {formatCurrency(totalSpent)}</Text>
            </View>
            <View style={styles.summaryStat}>
              <Ionicons name="trending-down-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.summaryStatLabel}> Remaining</Text>
              <Text style={styles.summaryStatValue}> {formatCurrency(totalRemaining)}</Text>
            </View>
          </View>
        </View>

        {/* Category Budgets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Budgets</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GoalsList')}>
              <Text style={[styles.linkText, { color: colors.primary }]}>View Goals</Text>
            </TouchableOpacity>
          </View>

          {budgets.map((budget: any) => {
            const percentage = budget.budgeted > 0 ? (budget.spent / budget.budgeted) * 100 : 0;
            const barColor = getBarColor(percentage);
            const remaining = budget.budgeted - budget.spent;
            const catData = categories[budget.category as keyof typeof categories];
            const catIcon = catData?.icon || 'ellipsis-horizontal';
            const catColor = catData?.color || budget.color || '#6B7280';

            return (
              <Card
                key={budget.id}
                variant="elevated"
                style={styles.budgetCard}
                onPress={() => navigation.navigate('BudgetDetail', { budgetId: budget.id })}
              >
                <View style={styles.budgetCardHeader}>
                  <View style={[styles.budgetIcon, { backgroundColor: catColor + '15' }]}>
                    <Ionicons
                      name={toIonicon(catIcon)}
                      size={20}
                      color={catColor}
                    />
                  </View>
                  <View style={styles.budgetInfo}>
                    <Text style={[styles.budgetCategory, { color: colors.text }]}>
                      {budget.category}
                    </Text>
                    <Text style={[styles.budgetSpent, { color: colors.textSecondary }]}>
                      Spent {formatCurrency(budget.spent)} of {formatCurrency(budget.budgeted)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </View>

                <View style={[styles.budgetBarBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.budgetBarFill,
                      {
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>

                <View style={styles.budgetFooter}>
                  <Text style={[styles.remainingText, { color: colors.textSecondary }]}>
                    {remaining >= 0
                      ? `${formatCurrency(remaining)} remaining`
                      : `${formatCurrency(Math.abs(remaining))} over budget`}
                  </Text>
                  <Badge
                    label={`${Math.round(percentage)}%`}
                    variant={percentage >= 90 ? 'danger' : percentage >= 70 ? 'warning' : 'success'}
                    size="sm"
                  />
                </View>
              </Card>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Budget FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddBudget')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerSpacer: {
    width: 40,
  },
  notifBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xl,
  },
  monthArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(128,128,128,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 160,
    textAlign: 'center',
  },
  summaryCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl || 20,
    padding: spacing.xxl,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.lg,
  },
  summaryBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  summaryBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStatLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  summaryStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  budgetCard: {
    marginBottom: spacing.sm,
    padding: 0,
  },
  budgetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  budgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  budgetSpent: {
    fontSize: 13,
  },
  budgetBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: spacing.md,
  },
  budgetBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default BudgetsListScreen;
