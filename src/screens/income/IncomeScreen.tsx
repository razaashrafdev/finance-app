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
import { useAppStore } from '../../store/AppStore';
import { formatCurrency, formatDate } from '../../utils/format';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import TransactionRow from '../../components/common/TransactionRow';
import EmptyState from '../../components/common/EmptyState';

interface IncomeScreenProps {
  navigation: any;
}

const DATE_RANGES = ['This Month', 'Last 30 Days', 'Last 90 Days', 'All Time'] as const;

const IncomeScreen: React.FC<IncomeScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { transactions } = useAppStore();
  const [selectedRange, setSelectedRange] = useState<string>('This Month');

  const incomeTransactions = useMemo(
    () => transactions.filter((t: any) => t.type === 'income'),
    []
  );

  const filteredIncome = useMemo(() => {
    const now = new Date();
    if (selectedRange === 'All Time') return incomeTransactions;
    return incomeTransactions.filter((t: any) => {
      const d = new Date(t.date);
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (selectedRange === 'This Month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (selectedRange === 'Last 30 Days') return diffDays <= 30;
      if (selectedRange === 'Last 90 Days') return diffDays <= 90;
      return true;
    });
  }, [incomeTransactions, selectedRange]);

  const totalIncome = filteredIncome.reduce((sum: number, t: any) => sum + t.amount, 0);

  const monthlyAvg = useMemo(() => {
    if (filteredIncome.length === 0) return 0;
    const months = new Set(
      filteredIncome.map((t: any) => {
        const d = new Date(t.date);
        return `${d.getFullYear()}-${d.getMonth()}`;
      })
    );
    return totalIncome / Math.max(months.size, 1);
  }, [filteredIncome, totalIncome]);

  const sourceBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredIncome.forEach((t: any) => {
      const source = t.subcategory || 'Other';
      map[source] = (map[source] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredIncome]);

  const maxSourceAmount = sourceBreakdown.length > 0 ? sourceBreakdown[0].amount : 1;

  const SOURCE_COLORS: Record<string, string> = {
    Salary: '#4F46E5',
    Freelance: '#10B981',
    Investments: '#F59E0B',
    Business: '#8B5CF6',
    Gifts: '#EC4899',
    Other: '#6B7280',
  };

  const handleNavigate = (item: any) => {
    navigation.navigate('IncomeDetail', { incomeId: item.id });
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Income Overview</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Range Filter */}
        <ScreenScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {DATE_RANGES.map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setSelectedRange(range)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedRange === range ? colors.primary : colors.surface || colors.card,
                  borderColor: selectedRange === range ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: selectedRange === range ? '#FFFFFF' : colors.textSecondary,
                  },
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </ScreenScrollView>

        {/* Total Income Card */}
        <View style={[styles.totalCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.totalLabel}>Total Income</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalIncome)}</Text>
          <View style={styles.totalRow}>
            <View style={styles.totalStat}>
              <Ionicons name="trending-up" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.totalStatLabel}>Transactions</Text>
              <Text style={styles.totalStatValue}>{filteredIncome.length}</Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalStat}>
              <Ionicons name="calendar" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.totalStatLabel}>Monthly Avg</Text>
              <Text style={styles.totalStatValue}>{formatCurrency(monthlyAvg)}</Text>
            </View>
          </View>
        </View>

        {/* Income Breakdown by Source */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Income by Source</Text>
          <Card variant="elevated" style={styles.breakdownCard}>
            {sourceBreakdown.map((source, index) => {
              const percentage = (source.amount / maxSourceAmount) * 100;
              const barColor = SOURCE_COLORS[source.name] || colors.primary;
              return (
                <View key={source.name} style={styles.sourceRow}>
                  <View style={styles.sourceInfo}>
                    <View style={[styles.sourceDot, { backgroundColor: barColor }]} />
                    <Text style={[styles.sourceName, { color: colors.text }]}>{source.name}</Text>
                  </View>
                  <Text style={[styles.sourceAmount, { color: colors.text }]}>
                    {formatCurrency(source.amount)}
                  </Text>
                  <View style={styles.sourceBarContainer}>
                    <View
                      style={[
                        styles.sourceBarBg,
                        { backgroundColor: colors.border || '#E5E7EB' },
                      ]}
                    >
                      <View
                        style={[
                          styles.sourceBarFill,
                          {
                            width: `${percentage}%`,
                            backgroundColor: barColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.sourcePercentage, { color: colors.textTertiary }]}>
                      {totalIncome > 0 ? Math.round((source.amount / totalIncome) * 100) : 0}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
        </View>

        {/* Monthly Average Card */}
        <View style={styles.section}>
          <Card variant="outlined" style={styles.avgCard}>
            <View style={styles.avgRow}>
              <View style={styles.avgLeft}>
                <View style={[styles.avgIcon, { backgroundColor: (colors.positive || '#10B981') + '15' }]}>
                  <Ionicons name="bar-chart" size={20} color={colors.positive || '#10B981'} />
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
              <Badge label="6 months" variant="info" />
            </View>
          </Card>
        </View>

        {/* Income History */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Income History</Text>
          {filteredIncome.length === 0 ? (
            <EmptyState
              icon="trending-up-outline"
              title="No income found"
              description="No income transactions found for the selected period."
              actionLabel="Add Income"
              onAction={() => navigation.navigate('AddIncome')}
            />
          ) : (
            filteredIncome.map((item: any) => (
              <Card key={item.id} variant="elevated" style={styles.transactionCard}>
                <TransactionRow
                  transaction={{
                    title: item.title,
                    amount: item.amount,
                    category: item.subcategory || item.category,
                    date: formatDate(item.date),
                    icon: item.icon,
                    type: 'income',
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
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddIncome')}
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
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#4F46E5',
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
  sourceRow: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  sourceName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  sourceAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  sourceBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  sourceBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sourceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sourcePercentage: {
    fontSize: 12,
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
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
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default IncomeScreen;
