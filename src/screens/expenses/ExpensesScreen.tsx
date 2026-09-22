import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { ScreenScrollView } from '../../components/common/ScreenScroll';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { categories } from '../../data/mockData';
import { useAppStore } from '../../store/AppStore';
import { toIonicon } from '../../utils/icons';
import { formatCurrency, formatDate } from '../../utils/format';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import TransactionRow from '../../components/common/TransactionRow';
import EmptyState from '../../components/common/EmptyState';

interface ExpensesScreenProps {
  navigation: any;
}

const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { transactions } = useAppStore();

  const expenseTransactions = useMemo(
    () => transactions.filter((t: any) => t.type === 'expense'),
    []
  );

  const totalExpenses = useMemo(
    () => expenseTransactions.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0),
    [expenseTransactions]
  );

  const monthlyAvg = useMemo(() => {
    const months = new Set(
      expenseTransactions.map((t: any) => {
        const d = new Date(t.date);
        return `${d.getFullYear()}-${d.getMonth()}`;
      })
    );
    return totalExpenses / Math.max(months.size, 1);
  }, [expenseTransactions, totalExpenses]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenseTransactions.forEach((t: any) => {
      const cat = t.category;
      map[cat] = (map[cat] || 0) + Math.abs(t.amount);
    });
    return Object.entries(map)
      .map(([name, amount]) => {
        const catData = categories[name as keyof typeof categories];
        return {
          name,
          amount,
          color: catData?.color || '#6B7280',
          icon: catData?.icon || 'ellipsis-horizontal',
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [expenseTransactions]);

  const topExpenses = useMemo(
    () =>
      [...expenseTransactions]
        .sort((a: any, b: any) => Math.abs(b.amount) - Math.abs(a.amount))
        .slice(0, 5),
    [expenseTransactions]
  );

  const maxCategoryAmount = categoryBreakdown.length > 0 ? categoryBreakdown[0].amount : 1;

  const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    Housing: 'home',
    Food: 'cart-outline',
    Transport: 'car-outline',
    Entertainment: 'tv-outline',
    Shopping: 'shirt-outline',
    Utilities: 'flash-outline',
    Health: 'heart-outline',
    Education: 'book-outline',
    Dining: 'restaurant-outline',
  };

  const handleNavigate = (item: any) => {
    navigation.navigate('ExpenseDetail', { expenseId: item.id });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.surface || colors.card }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Expense Overview</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Expenses Card */}
        <View style={[styles.totalCard, { backgroundColor: '#EF4444' }]}>
          <Text style={styles.totalLabel}>Total Expenses</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalExpenses)}</Text>
          <View style={styles.totalRow}>
            <View style={styles.totalStat}>
              <Ionicons name="receipt-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.totalStatLabel}>Transactions</Text>
              <Text style={styles.totalStatValue}>{expenseTransactions.length}</Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalStat}>
              <Ionicons name="calendar" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.totalStatLabel}>Monthly Avg</Text>
              <Text style={styles.totalStatValue}>{formatCurrency(monthlyAvg)}</Text>
            </View>
          </View>
        </View>

        {/* Spending Categories Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending by Category</Text>
          <Card variant="elevated" style={styles.breakdownCard}>
            {categoryBreakdown.map((cat) => {
              const percentage = (cat.amount / maxCategoryAmount) * 100;
              const ofTotal = totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0;
              const iconName = toIonicon(CATEGORY_ICONS[cat.name] || cat.icon);
              return (
                <View key={cat.name} style={styles.categoryRow}>
                  <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                    <Ionicons name={iconName} size={20} color={cat.color} />
                  </View>
                  <View style={styles.categoryInfo}>
                    <View style={styles.categoryHeader}>
                      <Text style={[styles.categoryName, { color: colors.text }]}>{cat.name}</Text>
                      <Text style={[styles.categoryAmount, { color: colors.text }]}>
                        {formatCurrency(cat.amount)}
                      </Text>
                    </View>
                    <View style={styles.categoryBarRow}>
                      <View
                        style={[
                          styles.categoryBarBg,
                          { backgroundColor: colors.border || '#E5E7EB' },
                        ]}
                      >
                        <View
                          style={[
                            styles.categoryBarFill,
                            {
                              width: `${percentage}%`,
                              backgroundColor: cat.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.categoryPercentage, { color: colors.textTertiary }]}>
                        {ofTotal.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </Card>
        </View>

        {/* Top Expenses */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Expenses</Text>
          {topExpenses.map((item: any, index: number) => {
            const catData = categories[item.category as keyof typeof categories];
            const catColor = catData?.color || '#6B7280';
            return (
              <Card key={item.id} variant="elevated" style={styles.topExpenseCard}>
                <View style={styles.topExpenseRow}>
                  <View style={[styles.topExpenseRank, { backgroundColor: catColor + '15' }]}>
                    <Text style={[styles.rankText, { color: catColor }]}>#{index + 1}</Text>
                  </View>
                  <View style={styles.topExpenseInfo}>
                    <Text style={[styles.topExpenseTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.topExpenseMeta, { color: colors.textSecondary }]}>
                      {item.subcategory || item.category} · {formatDate(item.date)}
                    </Text>
                  </View>
                  <Text style={[styles.topExpenseAmount, { color: '#EF4444' }]}>
                    {formatCurrency(Math.abs(item.amount))}
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Monthly Average Card */}
        <View style={styles.section}>
          <Card variant="outlined" style={styles.avgCard}>
            <View style={styles.avgRow}>
              <View style={styles.avgLeft}>
                <View style={[styles.avgIcon, { backgroundColor: '#EF444415' }]}>
                  <Ionicons name="bar-chart" size={20} color="#EF4444" />
                </View>
                <View>
                  <Text style={[styles.avgLabel, { color: colors.textSecondary }]}>
                    Monthly Average
                  </Text>
                  <Text style={[styles.avgValue, { color: colors.text }]}>
                    {formatCurrency(monthlyAvg)}
                  </Text>
                </View>
              </View>
              <Badge label="6 months" variant="danger" />
            </View>
          </Card>
        </View>

        {/* Expense History */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Expense History</Text>
          {expenseTransactions.length === 0 ? (
            <EmptyState
              icon="trending-down-outline"
              title="No expenses found"
              description="Start tracking your expenses to see them here."
              actionLabel="Add Expense"
              onAction={() => navigation.navigate('AddExpense')}
            />
          ) : (
            expenseTransactions.map((item: any) => (
              <Card key={item.id} variant="elevated" style={styles.transactionCard}>
                <TransactionRow
                  transaction={{
                    title: item.title,
                    amount: item.amount,
                    category: item.subcategory || item.category,
                    date: formatDate(item.date),
                    icon: item.icon,
                    type: 'expense',
                    accountName: item.accountName,
                  }}
                  onPress={() => handleNavigate(item)}
                />
              </Card>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScreenScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: '#EF4444' }]}
        onPress={() => navigation.navigate('AddExpense')}
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
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
  totalCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  totalStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  totalDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  breakdownCard: {
    padding: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  categoryBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryPercentage: {
    fontSize: 12,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  topExpenseCard: {
    marginBottom: 8,
    padding: 0,
  },
  topExpenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  topExpenseRank: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '800',
  },
  topExpenseInfo: {
    flex: 1,
    marginRight: 12,
  },
  topExpenseTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  topExpenseMeta: {
    fontSize: 12,
  },
  topExpenseAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  avgCard: {
    padding: 16,
  },
  avgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avgLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avgIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avgLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  avgValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  transactionCard: {
    marginBottom: 8,
    padding: 0,
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
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default ExpensesScreen;
