import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar
} from 'react-native';
import { Svg, Rect, Text as SvgText, G, Line } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeContext';
import Avatar from '../../components/common/Avatar';
import ProgressRing from '../../components/common/ProgressRing';
import TransactionRow from '../../components/common/TransactionRow';
import { monthlyIncomeVsExpense, spendingBreakdown } from '../../data/mockData';
import { useAppStore } from '../../store/AppStore';
import { formatCurrency, formatShortDate, getGreeting } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const CHART_HEIGHT = 180;
const BAR_GROUP_WIDTH = CHART_WIDTH / 6;

const SPENDING_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Housing: 'home-outline',
  Food: 'cart-outline',
  Transport: 'car-outline',
  Entertainment: 'tv-outline',
  Shopping: 'bag-outline',
  Utilities: 'flash-outline',
  Health: 'heart-outline',
  Education: 'book-outline',
  Dining: 'restaurant-outline',
  Other: 'ellipsis-horizontal-outline',
};

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const theme = { colors, dark: isDark };
  const { user: userProfile, accounts, transactions, budgets, savingsGoals, bills, notifications } = useAppStore();
  const notificationCount = notifications.filter((item) => !item.isRead).length;

  const totalBalance = accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
  const totalIncome = monthlyIncomeVsExpense[monthlyIncomeVsExpense.length - 1]?.income || 0;
  const totalExpenses = monthlyIncomeVsExpense[monthlyIncomeVsExpense.length - 1]?.expense || 0;

  const recentTransactions = transactions.slice(0, 5);
  const upcomingBills = bills
    .filter((bill) => !bill.isPaid)
    .slice(0, 3);
  const topSpending = spendingBreakdown.slice(0, 5);

  const quickActions: {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
    screen: string;
  }[] = [
    { id: '1', icon: 'add-circle-outline', label: 'Income', color: '#22C55E', screen: 'AddIncome' },
    { id: '2', icon: 'remove-circle-outline', label: 'Expense', color: '#EF4444', screen: 'AddExpense' },
    { id: '3', icon: 'swap-horizontal-outline', label: 'Transfer', color: '#3B82F6', screen: 'AddTransfer' },
    { id: '4', icon: 'flag-outline', label: 'Goal', color: '#8B5CF6', screen: 'AddGoal' },
  ];

  const getBillUrgencyColor = (dueDate: string) => {
    const daysUntilDue = Math.ceil(
      (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDue <= 2) return '#EF4444';
    if (daysUntilDue <= 5) return '#F59E0B';
    return '#22C55E';
  };

  const getBudgetColor = (percentage: number) => {
    if (percentage >= 90) return '#EF4444';
    if (percentage >= 70) return '#F59E0B';
    return '#22C55E';
  };

  const maxBarValue = Math.max(
    ...monthlyIncomeVsExpense.map((m) => Math.max(m.income, m.expense))
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.md,
    },
    greetingContainer: {
      flex: 1,
    },
    greetingText: {
      fontSize: 14,
      color: theme.colors.textSecondary || '#6B7280',
      marginBottom: 2,
    },
    userName: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    notificationButton: {
      position: 'relative',
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface || '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#EF4444',
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    balanceCard: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      padding: spacing.xl,
      borderRadius: borderRadius.xl || 20,
      backgroundColor: theme.colors.primary || '#6366F1',
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    balanceLabel: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.7)',
      marginBottom: 4,
    },
    balanceAmount: {
      fontSize: 36,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: spacing.lg,
    },
    balanceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    balanceStat: {
      flex: 1,
    },
    balanceStatLabel: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.7)',
      marginBottom: 4,
      flexDirection: 'row',
      alignItems: 'center',
    },
    balanceStatValue: {
      fontSize: 18,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    balanceDivider: {
      width: 1,
      backgroundColor: 'rgba(255,255,255,0.2)',
      marginHorizontal: spacing.md,
    },
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
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    seeAllText: {
      fontSize: 14,
      color: theme.colors.primary || '#6366F1',
      fontWeight: '600',
    },
    quickActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    quickAction: {
      alignItems: 'center',
      width: 72,
    },
    quickActionCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    quickActionLabel: {
      fontSize: 11,
      color: theme.colors.text,
      fontWeight: '500',
    },
    chartContainer: {
      backgroundColor: theme.colors.card || '#FFFFFF',
      borderRadius: borderRadius.lg || 16,
      padding: spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    chartLegend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.lg,
      marginTop: spacing.md,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendText: {
      fontSize: 12,
      color: theme.colors.textSecondary || '#6B7280',
    },
    spendingScroll: {
      marginLeft: -spacing.lg,
      paddingLeft: spacing.lg,
    },
    spendingCard: {
      width: 140,
      backgroundColor: theme.colors.card || '#FFFFFF',
      borderRadius: borderRadius.lg || 16,
      padding: spacing.md,
      marginRight: spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    spendingIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    spendingCategory: {
      fontSize: 12,
      color: theme.colors.textSecondary || '#6B7280',
      marginBottom: 2,
    },
    spendingAmount: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: spacing.sm,
    },
    spendingBarBg: {
      height: 4,
      backgroundColor: theme.colors.border || '#E5E7EB',
      borderRadius: 2,
      overflow: 'hidden',
    },
    spendingBarFill: {
      height: '100%',
      borderRadius: 2,
    },
    transactionItem: {
      backgroundColor: theme.colors.card || '#FFFFFF',
      borderRadius: borderRadius.lg || 16,
      marginBottom: spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    billCard: {
      backgroundColor: theme.colors.card || '#FFFFFF',
      borderRadius: borderRadius.lg || 16,
      padding: spacing.md,
      marginBottom: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    billLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    billIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    billName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    billDue: {
      fontSize: 12,
      color: theme.colors.textSecondary || '#6B7280',
      marginTop: 2,
    },
    billRight: {
      alignItems: 'flex-end',
    },
    billAmount: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
    },
    billUrgencyDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 4,
    },
    goalScroll: {
      marginLeft: -spacing.lg,
      paddingLeft: spacing.lg,
    },
    goalCard: {
      width: 160,
      backgroundColor: theme.colors.card || '#FFFFFF',
      borderRadius: borderRadius.lg || 16,
      padding: spacing.lg,
      marginRight: spacing.md,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    goalName: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    goalTarget: {
      fontSize: 12,
      color: theme.colors.textSecondary || '#6B7280',
      marginTop: 4,
    },
    goalPercentage: {
      fontSize: 16,
      fontWeight: '800',
      marginTop: spacing.sm,
    },
    budgetCard: {
      backgroundColor: theme.colors.card || '#FFFFFF',
      borderRadius: borderRadius.lg || 16,
      padding: spacing.md,
      marginBottom: spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    budgetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    budgetCategory: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    budgetAmounts: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    budgetSpent: {
      fontSize: 14,
      fontWeight: '700',
    },
    budgetTotal: {
      fontSize: 12,
      color: theme.colors.textSecondary || '#6B7280',
    },
    budgetBarBg: {
      height: 6,
      backgroundColor: theme.colors.border || '#E5E7EB',
      borderRadius: 3,
      overflow: 'hidden',
    },
    budgetBarFill: {
      height: '100%',
      borderRadius: 3,
    },
    budgetStatusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
    },
    budgetStatusText: {
      fontSize: 11,
      fontWeight: '500',
    },
  });

  const renderChart = () => {
    const data = monthlyIncomeVsExpense.slice(-6);
    const barWidth = (BAR_GROUP_WIDTH - 16) / 2;
    const chartInnerHeight = CHART_HEIGHT - 30;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Income vs Expense</Text>
        <Svg width={CHART_WIDTH - spacing.lg * 2} height={CHART_HEIGHT}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <G key={index}>
              <Line
                x1={0}
                y1={chartInnerHeight * ratio}
                x2={CHART_WIDTH - spacing.lg * 2}
                y2={chartInnerHeight * ratio}
                stroke={theme.colors.border || '#E5E7EB'}
                strokeWidth={1}
                strokeDasharray={ratio > 0 ? '4,4' : '0'}
              />
              <SvgText
                x={-8}
                y={chartInnerHeight * ratio + 4}
                fontSize={10}
                fill={theme.colors.textSecondary || '#9CA3AF'}
                textAnchor="end"
              >
                {formatCurrency(maxBarValue * (1 - ratio)).replace('$', '')}
              </SvgText>
            </G>
          ))}
          {data.map((item, index) => {
            const groupX = index * BAR_GROUP_WIDTH + 16;
            const incomeHeight = (item.income / maxBarValue) * chartInnerHeight;
            const expenseHeight = (item.expense / maxBarValue) * chartInnerHeight;

            return (
              <G key={index}>
                <Rect
                  x={groupX}
                  y={chartInnerHeight - incomeHeight}
                  width={barWidth}
                  height={incomeHeight}
                  rx={4}
                  fill="#22C55E"
                  opacity={0.9}
                />
                <Rect
                  x={groupX + barWidth + 4}
                  y={chartInnerHeight - expenseHeight}
                  width={barWidth}
                  height={expenseHeight}
                  rx={4}
                  fill="#EF4444"
                  opacity={0.9}
                />
                <SvgText
                  x={groupX + BAR_GROUP_WIDTH / 2 - 8}
                  y={chartInnerHeight + 18}
                  fontSize={10}
                  fill={theme.colors.textSecondary || '#9CA3AF'}
                  textAnchor="middle"
                >
                  {item.month}
                </SvgText>
              </G>
            );
          })}
        </Svg>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.legendText}>Income</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Expenses</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userProfile.firstName}!</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('MoreTab', { screen: 'NotificationsScreen' })}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={theme.colors.text}
              />
              {notificationCount > 0 && <View style={styles.notificationBadge} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('MoreTab', { screen: 'ProfileScreen' })}>
              <Avatar
                uri={userProfile.avatar}
                name={`${userProfile.firstName} ${userProfile.lastName}`}
                size={44}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceStat}>
              <View style={styles.balanceStatLabel}>
                <Ionicons name="arrow-down-outline" size={12} color="#22C55E" />
                <Text style={[styles.balanceStatLabel, { marginLeft: 4 }]}>Income</Text>
              </View>
              <Text style={styles.balanceStatValue}>{formatCurrency(totalIncome)}</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceStat}>
              <View style={styles.balanceStatLabel}>
                <Ionicons name="arrow-up-outline" size={12} color="#EF4444" />
                <Text style={[styles.balanceStatLabel, { marginLeft: 4 }]}>Expenses</Text>
              </View>
              <Text style={styles.balanceStatValue}>{formatCurrency(totalExpenses)}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickAction}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.quickActionCircle,
                  { backgroundColor: `${action.color}15` },
                ]}
              >
                <Ionicons
                  name={action.icon}
                  size={26}
                  color={action.color}
                />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Income vs Expense Chart */}
        <View style={styles.section}>
          {renderChart()}
        </View>

        {/* Spending Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spending Breakdown</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.spendingScroll}
          >
            {topSpending.map((item) => {
              const percentage = (item.amount / topSpending[0].amount) * 100;
              return (
                <View key={item.category} style={styles.spendingCard}>
                  <View
                    style={[
                      styles.spendingIconContainer,
                      { backgroundColor: `${item.color}15` },
                    ]}
                  >
                    <Ionicons
                      name={SPENDING_ICONS[item.category] || 'ellipsis-horizontal-outline'}
                      size={18}
                      color={item.color}
                    />
                  </View>
                  <Text style={styles.spendingCategory}>{item.category}</Text>
                  <Text style={styles.spendingAmount}>{formatCurrency(item.amount)}</Text>
                  <View style={styles.spendingBarBg}>
                    <View
                      style={[
                        styles.spendingBarFill,
                        {
                          width: `${percentage}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TransactionsTab')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <TransactionRow
                transaction={transaction}
                onPress={() =>
                  navigation.navigate('TransactionDetail', { transactionId: transaction.id })
                }
              />
            </View>
          ))}
        </View>

        {/* Upcoming Bills */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Bills</Text>
          </View>
          {upcomingBills.map((bill) => (
            <View key={bill.id} style={styles.billCard}>
              <View style={styles.billLeft}>
                <View
                  style={[
                    styles.billIconContainer,
                    { backgroundColor: `${getBillUrgencyColor(bill.dueDate)}15` },
                  ]}
                >
                  <Ionicons
                    name="receipt-outline"
                    size={20}
                    color={getBillUrgencyColor(bill.dueDate)}
                  />
                </View>
                <View>
                  <Text style={styles.billName}>{bill.name}</Text>
                  <Text style={styles.billDue}>Due {formatShortDate(bill.dueDate)}</Text>
                </View>
              </View>
              <View style={styles.billRight}>
                <Text style={styles.billAmount}>{formatCurrency(bill.amount)}</Text>
                <View
                  style={[
                    styles.billUrgencyDot,
                    { backgroundColor: getBillUrgencyColor(bill.dueDate) },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Savings Goals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Savings Goals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BudgetsTab', { screen: 'GoalsList' })}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.goalScroll}
          >
            {savingsGoals.map((goal) => {
              const percentage = Math.round((goal.currentAmount / goal.targetAmount) * 100);
              return (
                <TouchableOpacity
                  key={goal.id}
                  style={styles.goalCard}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('BudgetsTab', {
                      screen: 'GoalDetail',
                      params: { goalId: goal.id },
                    })
                  }
                >
                  <ProgressRing
                    progress={percentage / 100}
                    size={72}
                    strokeWidth={6}
                    color={theme.colors.primary || '#6366F1'}
                  />
                  <Text style={styles.goalName}>{goal.name}</Text>
                  <Text style={styles.goalTarget}>
                    of {formatCurrency(goal.targetAmount)}
                  </Text>
                  <Text
                    style={[
                      styles.goalPercentage,
                      { color: theme.colors.primary || '#6366F1' },
                    ]}
                  >
                    {percentage}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Budget Status */}
        <View style={[styles.section, { marginBottom: spacing.xl }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Budget Status</Text>
          </View>
          {budgets.slice(0, 3).map((budget) => {
            const percentage = Math.round((budget.spent / budget.budgeted) * 100);
            const statusColor = getBudgetColor(percentage);
            return (
              <View key={budget.id} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetCategory}>{budget.category}</Text>
                  <View style={styles.budgetAmounts}>
                    <Text style={[styles.budgetSpent, { color: statusColor }]}>
                      {formatCurrency(budget.spent)}
                    </Text>
                    <Text style={styles.budgetTotal}>
                      / {formatCurrency(budget.budgeted)}
                    </Text>
                  </View>
                </View>
                <View style={styles.budgetBarBg}>
                  <View
                    style={[
                      styles.budgetBarFill,
                      {
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: statusColor,
                      },
                    ]}
                  />
                </View>
                <View style={styles.budgetStatusRow}>
                  <Text style={[styles.budgetStatusText, { color: statusColor }]}>
                    {percentage >= 90
                      ? 'Over budget!'
                      : percentage >= 70
                      ? 'Approaching limit'
                      : 'On track'}
                  </Text>
                  <Text style={[styles.budgetStatusText, { color: statusColor }]}>
                    {percentage}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
