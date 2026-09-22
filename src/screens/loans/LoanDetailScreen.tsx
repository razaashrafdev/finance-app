import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate, formatShortDate } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAppStore } from '../../store/AppStore';

interface LoanDetailScreenProps {
  navigation: any;
  route: any;
}

const LOAN_TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  mortgage: { icon: 'home', color: '#4F46E5' },
  auto: { icon: 'car', color: '#10B981' },
  student: { icon: 'school', color: '#F59E0B' },
  personal: { icon: 'person', color: '#8B5CF6' },
  other: { icon: 'cash', color: '#EC4899' },
};

const LoanDetailScreen: React.FC<LoanDetailScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { loans, payLoan, deleteLoan } = useAppStore();
  const { loanId } = route.params || {};

  const loan = useMemo(
    () => loans.find((l: any) => l.id === loanId),
    [loanId, loans]
  );

  if (!loan) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Loan not found.</Text>
      </View>
    );
  }

  const typeInfo = LOAN_TYPE_ICONS[loan.type] || LOAN_TYPE_ICONS.other;
  const paid = loan.totalAmount - loan.remainingAmount;
  const percentage = loan.totalAmount > 0 ? (paid / loan.totalAmount) * 100 : 0;
  const totalInterest = loan.totalAmount * (loan.interestRate / 100) * 3;

  const paymentHistory = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      id: `pay_${i}`,
      date: date.toISOString(),
      amount: loan.monthlyPayment,
      status: 'paid' as const,
      balance: loan.remainingAmount + loan.monthlyPayment * i,
    };
  });

  const handlePayNow = () => {
    Alert.alert('Make Payment', `Pay ${formatCurrency(loan.monthlyPayment)} towards ${loan.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Pay Now', onPress: () => payLoan(loan.id, loan.monthlyPayment) },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Loan', `Are you sure you want to delete "${loan.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteLoan(loan.id); navigation.goBack(); } },
    ]);
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
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {loan.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Remaining Amount */}
        <View style={styles.amountSection}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Remaining Balance</Text>
          <Text style={[styles.amountValue, { color: colors.text }]}>{formatCurrency(loan.remainingAmount)}</Text>
          <Badge label={loan.type.charAt(0).toUpperCase() + loan.type.slice(1)} variant="info" size="md" />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Paid Off</Text>
            <Text style={[styles.progressPercent, { color: typeInfo.color }]}>{Math.round(percentage)}%</Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(percentage, 100)}%`, backgroundColor: typeInfo.color },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressAmount, { color: typeInfo.color }]}>
              {formatCurrency(paid)} paid
            </Text>
            <Text style={[styles.progressAmount, { color: colors.textSecondary }]}>
              {formatCurrency(loan.remainingAmount)} remaining
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card variant="outlined" style={styles.statCard}>
            <Ionicons name="wallet-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(loan.totalAmount)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Amount</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Ionicons name="pie-chart-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{loan.interestRate}%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Interest Rate</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Ionicons name="cash-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(loan.monthlyPayment)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Monthly</Text>
          </Card>
        </View>

        {/* Next Payment Card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Next Payment</Text>
          <Card variant="elevated" style={styles.nextPaymentCard}>
            <View style={styles.nextPaymentRow}>
              <View style={styles.nextPaymentInfo}>
                <View style={[styles.nextPaymentIcon, { backgroundColor: typeInfo.color + '15' }]}>
                  <Ionicons name="calendar" size={22} color={typeInfo.color} />
                </View>
                <View>
                  <Text style={[styles.nextPaymentDate, { color: colors.text }]}>
                    {formatDate(loan.nextPaymentDate)}
                  </Text>
                  <Text style={[styles.nextPaymentLabel, { color: colors.textSecondary }]}>
                    Due in {Math.max(0, Math.ceil((new Date(loan.nextPaymentDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days
                  </Text>
                </View>
              </View>
              <Text style={[styles.nextPaymentAmount, { color: typeInfo.color }]}>
                {formatCurrency(loan.monthlyPayment)}
              </Text>
            </View>
            <Button
              title="Pay Now"
              onPress={handlePayNow}
              variant="primary"
              size="md"
              icon={<Ionicons name="card-outline" size={18} color="#FFFFFF" />}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        </View>

        {/* Payment History */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment History</Text>
          <Card variant="elevated" style={styles.historyCard}>
            {paymentHistory.map((payment, index) => (
              <View key={payment.id}>
                <View style={styles.historyRow}>
                  <View style={styles.historyLeft}>
                    <View style={[styles.historyDot, { backgroundColor: '#10B981' }]}>
                      <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                    </View>
                    <View>
                      <Text style={[styles.historyDate, { color: colors.text }]}>
                        {formatDate(payment.date)}
                      </Text>
                      <Text style={[styles.historyStatus, { color: '#10B981' }]}>Paid</Text>
                    </View>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={[styles.historyAmount, { color: colors.text }]}>
                      -{formatCurrency(payment.amount)}
                    </Text>
                    <Text style={[styles.historyBalance, { color: colors.textSecondary }]}>
                      Balance: {formatCurrency(payment.balance)}
                    </Text>
                  </View>
                </View>
                {index < paymentHistory.length - 1 && (
                  <View style={[styles.historyDivider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </Card>
        </View>

        {/* Amortization Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Amortization Summary</Text>
          <Card variant="elevated" style={styles.amortCard}>
            <View style={styles.amortRow}>
              <Text style={[styles.amortLabel, { color: colors.textSecondary }]}>Total Principal</Text>
              <Text style={[styles.amortValue, { color: colors.text }]}>{formatCurrency(loan.totalAmount)}</Text>
            </View>
            <View style={[styles.amortDivider, { backgroundColor: colors.border }]} />
            <View style={styles.amortRow}>
              <Text style={[styles.amortLabel, { color: colors.textSecondary }]}>Total Interest Paid</Text>
              <Text style={[styles.amortValue, { color: '#EF4444' }]}>{formatCurrency(totalInterest)}</Text>
            </View>
            <View style={[styles.amortDivider, { backgroundColor: colors.border }]} />
            <View style={styles.amortRow}>
              <Text style={[styles.amortLabel, { color: colors.textSecondary }]}>Total Cost</Text>
              <Text style={[styles.amortValueBold, { color: colors.text }]}>
                {formatCurrency(loan.totalAmount + totalInterest)}
              </Text>
            </View>
            <View style={[styles.amortDivider, { backgroundColor: colors.border }]} />
            <View style={styles.amortRow}>
              <Text style={[styles.amortLabel, { color: colors.textSecondary }]}>Loan Term</Text>
              <Text style={[styles.amortValue, { color: colors.text }]}>
                {formatDate(loan.startDate)} — {formatDate(loan.endDate)}
              </Text>
            </View>
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Edit Loan"
            onPress={() => Alert.alert('Edit', 'Edit functionality coming soon.')}
            variant="secondary"
            size="md"
            icon={<Ionicons name="create-outline" size={18} color={colors.primary} />}
            style={{ flex: 1 }}
          />
          <Button
            title="Delete"
            onPress={handleDelete}
            variant="danger"
            size="md"
            icon={<Ionicons name="trash-outline" size={18} color="#FFFFFF" />}
            style={{ flex: 1 }}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingBottom: 60,
  },
  amountSection: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  progressSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressAmount: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.xs,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  nextPaymentCard: {
    padding: spacing.lg,
  },
  nextPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPaymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  nextPaymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextPaymentDate: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  nextPaymentLabel: {
    fontSize: 12,
  },
  nextPaymentAmount: {
    fontSize: 20,
    fontWeight: '800',
  },
  historyCard: {
    padding: spacing.lg,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  historyDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  historyBalance: {
    fontSize: 11,
  },
  historyDivider: {
    height: 1,
    marginVertical: spacing.md,
  },
  amortCard: {
    padding: spacing.lg,
  },
  amortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  amortLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  amortValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  amortValueBold: {
    fontSize: 16,
    fontWeight: '700',
  },
  amortDivider: {
    height: 1,
  },
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
});

export default LoanDetailScreen;
