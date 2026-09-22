import React, { useMemo } from 'react';
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
import { netWorthHistory } from '../../data/mockData';
import { formatCurrency, getMonthName } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAppStore } from '../../store/AppStore';

interface NetWorthScreenProps {
  navigation: any;
}

const NetWorthScreen: React.FC<NetWorthScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user: userProfile, accounts, loans, investments } = useAppStore();

  const data = useMemo(() => {
    const bankAccounts = accounts.filter((a: any) => a.type === 'checking' || a.type === 'savings');
    const investmentAcct = accounts.find((a: any) => a.type === 'investment');
    const cashAcct = accounts.find((a: any) => a.type === 'cash');

    const bankTotal = bankAccounts.reduce((sum: number, a: any) => sum + a.balance, 0);
    const investmentTotal = investmentAcct ? investmentAcct.balance : 0;
    const cashTotal = cashAcct ? cashAcct.balance : 0;
    const otherTotal = 1200;

    const totalAssets = bankTotal + investmentTotal + cashTotal + otherTotal;

    const assets = [
      { label: 'Bank Accounts', amount: bankTotal, icon: 'business-outline', color: '#3B82F6' },
      { label: 'Investments', amount: investmentTotal, icon: 'trending-up-outline', color: '#10B981' },
      { label: 'Cash', amount: cashTotal, icon: 'cash-outline', color: '#F59E0B' },
      { label: 'Other', amount: otherTotal, icon: 'wallet-outline', color: '#8B5CF6' },
    ].map((a) => ({
      ...a,
      percentage: totalAssets > 0 ? (a.amount / totalAssets) * 100 : 0,
    }));

    const mortgage = loans.find((l: any) => l.type === 'mortgage');
    const autoLoan = loans.find((l: any) => l.type === 'auto');
    const studentLoan = loans.find((l: any) => l.type === 'student');
    const creditCard = accounts.find((a: any) => a.type === 'credit');

    const mortgageAmt = mortgage ? Math.abs(mortgage.remainingAmount) : 0;
    const autoAmt = autoLoan ? Math.abs(autoLoan.remainingAmount) : 0;
    const creditAmt = creditCard ? Math.abs(creditCard.balance) : 0;
    const studentAmt = studentLoan ? Math.abs(studentLoan.remainingAmount) : 0;

    const totalLiabilities = mortgageAmt + autoAmt + creditAmt + studentAmt;

    const liabilities = [
      { label: 'Mortgage', amount: mortgageAmt, icon: 'home-outline', color: '#EF4444' },
      { label: 'Auto Loan', amount: autoAmt, icon: 'car-outline', color: '#F97316' },
      { label: 'Credit Card', amount: creditAmt, icon: 'card-outline', color: '#EC4899' },
      { label: 'Student Loan', amount: studentAmt, icon: 'school-outline', color: '#8B5CF6' },
    ].map((l) => ({
      ...l,
      percentage: totalLiabilities > 0 ? (l.amount / totalLiabilities) * 100 : 0,
    }));

    const netWorth = totalAssets - totalLiabilities;
    const previousNetWorth = netWorthHistory.length >= 2
      ? netWorthHistory[netWorthHistory.length - 2].netWorth
      : netWorth;
    const monthlyChange = netWorth - previousNetWorth;
    const trend = monthlyChange >= 0 ? 'Increasing' : 'Decreasing';

    return { assets, liabilities, totalAssets, totalLiabilities, netWorth, monthlyChange, trend };
  }, []);

  const chartW = 320;
  const chartH = 140;
  const history = netWorthHistory;
  const maxVal = Math.max(...history.map((h: any) => h.netWorth));
  const minVal = Math.min(...history.map((h: any) => h.netWorth));
  const range = maxVal - minVal || 1;

  const isPositive = data.monthlyChange >= 0;

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Net Worth</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.heroLabel}>Net Worth</Text>
          <Text style={styles.heroAmount}>{formatCurrency(data.netWorth)}</Text>
          <View style={styles.heroChangeRow}>
            <Ionicons
              name={isPositive ? 'arrow-up' : 'arrow-down'}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.heroChange}>
              {formatCurrency(data.monthlyChange, true)} this month
            </Text>
          </View>
          <Text style={styles.heroTrend}>{data.trend}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Assets</Text>
          <Card variant="default" style={styles.breakdownCard}>
            <View style={styles.breakdownTotalRow}>
              <Text style={[styles.breakdownTotalLabel, { color: colors.textSecondary }]}>Total Assets</Text>
              <Text style={[styles.breakdownTotalValue, { color: colors.positive }]}>{formatCurrency(data.totalAssets)}</Text>
            </View>
            {data.assets.map((item, i) => (
              <View key={i}>
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownItemLeft}>
                    <View style={[styles.breakdownIcon, { backgroundColor: item.color + '15' }]}>
                      <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={18} color={item.color} />
                    </View>
                    <Text style={[styles.breakdownLabel, { color: colors.text }]}>{item.label}</Text>
                  </View>
                  <View style={styles.breakdownItemRight}>
                    <Text style={[styles.breakdownAmount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
                    <Text style={[styles.breakdownPercent, { color: colors.textTertiary }]}>{item.percentage.toFixed(1)}%</Text>
                  </View>
                </View>
                {i < data.assets.length - 1 && <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Liabilities</Text>
          <Card variant="default" style={styles.breakdownCard}>
            <View style={styles.breakdownTotalRow}>
              <Text style={[styles.breakdownTotalLabel, { color: colors.textSecondary }]}>Total Liabilities</Text>
              <Text style={[styles.breakdownTotalValue, { color: colors.negative }]}>{formatCurrency(data.totalLiabilities)}</Text>
            </View>
            {data.liabilities.map((item, i) => (
              <View key={i}>
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownItemLeft}>
                    <View style={[styles.breakdownIcon, { backgroundColor: item.color + '15' }]}>
                      <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={18} color={item.color} />
                    </View>
                    <Text style={[styles.breakdownLabel, { color: colors.text }]}>{item.label}</Text>
                  </View>
                  <View style={styles.breakdownItemRight}>
                    <Text style={[styles.breakdownAmount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
                    <Text style={[styles.breakdownPercent, { color: colors.textTertiary }]}>{item.percentage.toFixed(1)}%</Text>
                  </View>
                </View>
                {i < data.liabilities.length - 1 && <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Net Worth History</Text>
          <Card variant="default" style={styles.historyCard}>
            <View style={styles.historyChart}>
              <View style={[styles.chartArea, { height: chartH }]}>
                {history.map((point: any, i: number) => {
                  if (i === 0) return null;
                  const prevPoint = history[i - 1];
                  const x1 = ((i - 1) / (history.length - 1)) * chartW;
                  const y1 = chartH - ((prevPoint.netWorth - minVal) / range) * (chartH - 20) - 10;
                  const x2 = (i / (history.length - 1)) * chartW;
                  const y2 = chartH - ((point.netWorth - minVal) / range) * (chartH - 20) - 10;
                  const dx = x2 - x1;
                  const dy = y2 - y1;
                  const len = Math.sqrt(dx * dx + dy * dy);
                  const angle = Math.atan2(dy, dx);

                  return (
                    <View
                      key={i}
                      style={{
                        position: 'absolute',
                        left: x1,
                        top: y1,
                        width: len,
                        height: 3,
                        backgroundColor: colors.primary,
                        transformOrigin: '0 50%',
                        transform: [{ rotate: `${angle}rad` }],
                      }}
                    />
                  );
                })}
                {history.map((point: any, i: number) => {
                  const x = (i / (history.length - 1)) * chartW;
                  const y = chartH - ((point.netWorth - minVal) / range) * (chartH - 20) - 10;
                  return (
                    <View
                      key={`dot-${i}`}
                      style={[
                        styles.chartDot,
                        {
                          left: x - 4,
                          top: y - 4,
                          backgroundColor: i === history.length - 1 ? colors.primary : colors.border,
                          borderColor: colors.background,
                        },
                      ]}
                    />
                  );
                })}
              </View>
              <View style={styles.historyLabels}>
                <Text style={[styles.historyLabel, { color: colors.textTertiary }]}>
                  {getMonthName(history[0].date)}: {formatCurrency(history[0].netWorth)}
                </Text>
                <Text style={[styles.historyLabel, { color: colors.textTertiary }]}>
                  {getMonthName(history[history.length - 1].date)}: {formatCurrency(history[history.length - 1].netWorth)}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        <Card variant="outlined" style={styles.formulaCard}>
          <View style={styles.formulaRow}>
            <Text style={[styles.formulaText, { color: colors.text }]}>Assets</Text>
            <Text style={[styles.formulaOperator, { color: colors.textSecondary }]}> - </Text>
            <Text style={[styles.formulaText, { color: colors.text }]}>Liabilities</Text>
            <Text style={[styles.formulaOperator, { color: colors.textSecondary }]}> = </Text>
            <Text style={[styles.formulaText, { color: colors.primary }]}>Net Worth</Text>
          </View>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  heroCard: {
    marginHorizontal: spacing.lg, marginTop: spacing.lg,
    borderRadius: borderRadius.lg, padding: spacing.xxl,
    alignItems: 'center',
  },
  heroLabel: { fontSize: 14, fontWeight: '500', color: '#FFFFFFCC', marginBottom: spacing.sm },
  heroAmount: { fontSize: 40, fontWeight: '800', color: '#FFFFFF', marginBottom: spacing.md },
  heroChangeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  heroChange: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  heroTrend: { fontSize: 14, fontWeight: '500', color: '#FFFFFFAA' },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xxl },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: spacing.md },
  breakdownCard: {},
  breakdownTotalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.lg,
    paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  breakdownTotalLabel: { fontSize: 14, fontWeight: '600' },
  breakdownTotalValue: { fontSize: 17, fontWeight: '800' },
  breakdownItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md,
  },
  breakdownItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  breakdownIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  breakdownLabel: { fontSize: 14, fontWeight: '600' },
  breakdownItemRight: { alignItems: 'flex-end' },
  breakdownAmount: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  breakdownPercent: { fontSize: 12, fontWeight: '500' },
  breakdownDivider: { height: 1 },
  historyCard: {},
  historyChart: {},
  chartArea: { position: 'relative', overflow: 'hidden', marginBottom: spacing.md },
  chartDot: {
    position: 'absolute', width: 9, height: 9,
    borderRadius: 5, borderWidth: 2,
  },
  historyLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  historyLabel: { fontSize: 12, fontWeight: '500' },
  formulaCard: {
    marginHorizontal: spacing.lg, marginTop: spacing.xxl,
    alignItems: 'center', paddingVertical: spacing.lg,
  },
  formulaRow: { flexDirection: 'row', alignItems: 'center' },
  formulaText: { fontSize: 16, fontWeight: '700' },
  formulaOperator: { fontSize: 16, fontWeight: '500' },
});

export default NetWorthScreen;
