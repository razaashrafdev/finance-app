import React, { useMemo, useState } from 'react';
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
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { formatCurrency } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAppStore } from '../../store/AppStore';
import { resolveCategories } from '../../data/categories';

interface ReportsScreenProps {
  navigation: any;
}

const DATE_RANGES = ['This Month', 'Last 3 Months', 'This Year'] as const;
type DateRange = typeof DATE_RANGES[number];

const ReportsScreen: React.FC<ReportsScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const toast = useToast();
  const { transactions, categories: storeCategories } = useAppStore();
  const categories = resolveCategories(storeCategories);
  const [selectedRange, setSelectedRange] = useState<DateRange>('This Month');

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
  const totalExpenses = Math.abs(
    transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0)
  );
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0.0';

  const reportData = useMemo(() => {
    const monthMap = new Map<string, { month: string; income: number; expense: number; sortKey: string }>();
    const expenseByCat: Record<string, number> = {};
    const incomeBySource: Record<string, number> = {};

    for (const t of transactions) {
      const d = new Date(t.date);
      if (Number.isNaN(d.getTime())) continue;
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const entry = monthMap.get(sortKey) || { month, income: 0, expense: 0, sortKey };
      const amount = Math.abs(Number(t.amount) || 0);
      if (t.type === 'income') {
        entry.income += amount;
        const source = t.subcategory || t.category || 'Other';
        incomeBySource[source] = (incomeBySource[source] || 0) + amount;
      } else if (t.type === 'expense') {
        entry.expense += amount;
        const cat = t.category || 'Other';
        expenseByCat[cat] = (expenseByCat[cat] || 0) + amount;
      }
      monthMap.set(sortKey, entry);
    }

    const monthlyTrend = Array.from(monthMap.values())
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6)
      .map(({ month, income, expense }) => ({
        month,
        income,
        expense,
        savings: income - expense,
      }));

    const expenseTotal = Object.values(expenseByCat).reduce((s, v) => s + v, 0);
    const incomeTotal = Object.values(incomeBySource).reduce((s, v) => s + v, 0);

    const expenseBreakdown = Object.entries(expenseByCat)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: expenseTotal > 0 ? Number(((amount / expenseTotal) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const incomeBreakdown = Object.entries(incomeBySource)
      .map(([source, amount]) => ({
        source,
        amount,
        percentage: incomeTotal > 0 ? Number(((amount / incomeTotal) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const categoryAnalysis = Object.entries(expenseByCat).map(([category, amount]) => ({
      category,
      monthlyAvg: amount,
      trend: 'stable' as const,
      yearOverYear: 0,
      color: categories[category]?.color,
    }));

    return { monthlyTrend, categoryAnalysis, incomeBreakdown, expenseBreakdown };
  }, [transactions, categories]);

  const maxBarValue = Math.max(
    1,
    ...reportData.monthlyTrend.map((m) => Math.max(m.income, m.expense)),
    0
  );

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return { name: 'trending-up' as const, color: colors.negative };
    if (trend === 'decreasing') return { name: 'trending-down' as const, color: colors.positive };
    return { name: 'remove' as const, color: colors.textTertiary };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.text === '#F8FAFC' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.surface || colors.card }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Reports & Analytics</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.dateRangeContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {DATE_RANGES.map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setSelectedRange(range)}
              style={[
                styles.dateRangeOption,
                selectedRange === range && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.dateRangeText,
                  { color: selectedRange === range ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card variant="default" style={styles.summaryCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Monthly Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.positive + '15' }]}>
                <Ionicons name="arrow-down" size={18} color={colors.positive} />
              </View>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Income</Text>
              <Text style={[styles.summaryValue, { color: colors.positive }]}>{formatCurrency(totalIncome)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.negative + '15' }]}>
                <Ionicons name="arrow-up" size={18} color={colors.negative} />
              </View>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Expenses</Text>
              <Text style={[styles.summaryValue, { color: colors.negative }]}>{formatCurrency(totalExpenses)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="wallet" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Net Savings</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>{formatCurrency(netSavings)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.warning + '15' }]}>
                <Ionicons name="pie-chart" size={18} color={colors.warning} />
              </View>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Savings Rate</Text>
              <Text style={[styles.summaryValue, { color: colors.warning }]}>{savingsRate}%</Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Income vs Expense Trend</Text>
          <Card variant="default" style={styles.chartCard}>
            <View style={styles.barChart}>
              {reportData.monthlyTrend.map((item, index) => {
                const incomeHeight = (item.income / maxBarValue) * 140;
                const expenseHeight = (item.expense / maxBarValue) * 140;
                return (
                  <View key={index} style={styles.barGroup}>
                    <View style={styles.barPair}>
                      <View
                        style={[
                          styles.bar,
                          { height: incomeHeight, backgroundColor: colors.positive },
                        ]}
                      />
                      <View
                        style={[
                          styles.bar,
                          { height: expenseHeight, backgroundColor: colors.negative },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barLabel, { color: colors.textTertiary }]}>{item.month}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.positive }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Income</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.negative }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Expenses</Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Analysis</Text>
          <Card variant="default">
            {reportData.categoryAnalysis.map((item, index) => {
              const trendInfo = getTrendIcon(item.trend);
              return (
                <View key={index}>
                  <View style={styles.categoryRow}>
                    <View style={styles.categoryLeft}>
                      <Text style={[styles.categoryName, { color: colors.text }]}>{item.category}</Text>
                      <Text style={[styles.categoryAvg, { color: colors.textSecondary }]}>
                        {formatCurrency(item.monthlyAvg)}/mo avg
                      </Text>
                    </View>
                    <View style={styles.categoryRight}>
                      <View style={styles.trendContainer}>
                        <Ionicons name={trendInfo.name} size={16} color={trendInfo.color} />
                      </View>
                      <Badge
                        label={`${item.yearOverYear > 0 ? '+' : ''}${item.yearOverYear}%`}
                        variant={item.yearOverYear > 0 ? 'danger' : item.yearOverYear < 0 ? 'success' : 'neutral'}
                        size="sm"
                      />
                    </View>
                  </View>
                  {index < reportData.categoryAnalysis.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              );
            })}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Income Breakdown</Text>
          <Card variant="default">
            {reportData.incomeBreakdown.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <Text style={[styles.breakdownName, { color: colors.text }]}>{item.source}</Text>
                  <Text style={[styles.breakdownAmount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${item.percentage}%`, backgroundColor: colors.positive },
                    ]}
                  />
                </View>
                <Text style={[styles.breakdownPercent, { color: colors.textTertiary }]}>{item.percentage}%</Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Expense Breakdown</Text>
          <Card variant="default">
            {reportData.expenseBreakdown.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <Text style={[styles.breakdownName, { color: colors.text }]}>{item.category}</Text>
                  <Text style={[styles.breakdownAmount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${item.percentage}%`, backgroundColor: colors.negative },
                    ]}
                  />
                </View>
                <Text style={[styles.breakdownPercent, { color: colors.textTertiary }]}>{item.percentage}%</Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.exportSection}>
          <Button
            title="Export Report"
            variant="primary"
            size="lg"
            icon={<Ionicons name="download-outline" size={20} color="#FFFFFF" />}
            onPress={() => toast.show('Report exported', 'success')}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScreenScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  dateRangeContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    padding: spacing.xxs,
    borderWidth: 1,
  },
  dateRangeOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  dateRangeText: { fontSize: 13, fontWeight: '600' },
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: spacing.lg },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: { fontSize: 12, fontWeight: '500', marginBottom: spacing.xs },
  summaryValue: { fontSize: 18, fontWeight: '800' },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: spacing.md },
  chartCard: {},
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    marginBottom: spacing.md,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 140,
  },
  bar: {
    width: 14,
    borderRadius: borderRadius.xs,
  },
  barLabel: { fontSize: 11, fontWeight: '500', marginTop: spacing.xs },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontWeight: '500' },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  categoryLeft: { flex: 1 },
  categoryName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  categoryAvg: { fontSize: 12, fontWeight: '500' },
  categoryRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  trendContainer: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  divider: { height: 1 },
  breakdownItem: { marginBottom: spacing.lg },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  breakdownName: { fontSize: 14, fontWeight: '600' },
  breakdownAmount: { fontSize: 14, fontWeight: '700' },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.xxs,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  breakdownPercent: { fontSize: 12, fontWeight: '500' },
  exportSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxxl,
  },
});

export default ReportsScreen;
