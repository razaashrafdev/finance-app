import React, { useMemo, useState } from 'react';
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
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import BottomSheet from '../../components/common/BottomSheet';
import { formatCurrency, formatDate, formatShortDate } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAppStore } from '../../store/AppStore';
import { useToast } from '../../components/common/Toast';

interface LoansScreenProps {
  navigation: any;
}

const LOAN_TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  mortgage: { icon: 'home', color: '#4F46E5' },
  auto: { icon: 'car', color: '#10B981' },
  student: { icon: 'school', color: '#F59E0B' },
  personal: { icon: 'person', color: '#8B5CF6' },
  other: { icon: 'cash', color: '#EC4899' },
};

const LoansScreen: React.FC<LoansScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { loans, addLoan } = useAppStore();
  const toast = useToast();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    lender: '',
    total: '',
    remaining: '',
    rate: '',
    monthly: '',
    type: 'personal' as string,
  });

  const totalDebt = useMemo(
    () => loans.reduce((sum: number, l: any) => sum + l.remainingAmount, 0),
    [loans]
  );
  const totalMonthly = useMemo(
    () => loans.reduce((sum: number, l: any) => sum + l.monthlyPayment, 0),
    [loans]
  );

  const handleAddLoan = () => {
    addLoan({
      name: formData.name || 'New Loan',
      lender: formData.lender || 'Lender',
      totalAmount: parseFloat(formData.total) || 10000,
      remainingAmount: parseFloat(formData.remaining) || parseFloat(formData.total) || 10000,
      interestRate: parseFloat(formData.rate) || 5,
      monthlyPayment: parseFloat(formData.monthly) || 100,
      type: formData.type || 'personal',
    } as any);
    setShowAddSheet(false);
    setFormData({ name: '', lender: '', total: '', remaining: '', rate: '', monthly: '', type: 'personal' });
    toast.show('Loan added', 'success');
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Loans</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Debt Summary */}
        <View style={[styles.summaryCard, { backgroundColor: '#EF4444' }]}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>Total Remaining Debt</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(totalDebt)}</Text>
            </View>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeText}>{loans.length} Active</Text>
            </View>
          </View>
          <View style={styles.summaryBottom}>
            <View style={styles.summaryStat}>
              <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.summaryStatText}>
                {formatCurrency(totalMonthly)}/mo payments
              </Text>
            </View>
          </View>
        </View>

        {/* Loans List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Loans</Text>

          {loans.map((loan: any) => {
            const typeInfo = LOAN_TYPE_ICONS[loan.type] || LOAN_TYPE_ICONS.other;
            const paid = loan.totalAmount - loan.remainingAmount;
            const percentage = loan.totalAmount > 0 ? (paid / loan.totalAmount) * 100 : 0;

            return (
              <Card
                key={loan.id}
                variant="elevated"
                style={styles.loanCard}
                onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
              >
                <View style={styles.loanHeader}>
                  <View style={[styles.loanIcon, { backgroundColor: typeInfo.color + '15' }]}>
                    <Ionicons
                      name={typeInfo.icon as keyof typeof Ionicons.glyphMap}
                      size={22}
                      color={typeInfo.color}
                    />
                  </View>
                  <View style={styles.loanInfo}>
                    <Text style={[styles.loanName, { color: colors.text }]}>{loan.name}</Text>
                    <Text style={[styles.loanLender, { color: colors.textSecondary }]}>{loan.lender}</Text>
                  </View>
                  <Badge label={`${loan.interestRate}% APR`} variant="info" size="sm" />
                </View>

                <View style={styles.loanAmounts}>
                  <Text style={[styles.loanRemaining, { color: colors.text }]}>
                    {formatCurrency(loan.remainingAmount)}
                  </Text>
                  <Text style={[styles.loanTotal, { color: colors.textSecondary }]}>
                    of {formatCurrency(loan.totalAmount)}
                  </Text>
                </View>

                <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.min(percentage, 100)}%`, backgroundColor: typeInfo.color },
                    ]}
                  />
                </View>

                <View style={styles.loanFooter}>
                  <View style={styles.loanFooterItem}>
                    <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.loanFooterText, { color: colors.textSecondary }]}>
                      {formatCurrency(loan.monthlyPayment)}/mo
                    </Text>
                  </View>
                  <View style={styles.loanFooterItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.loanFooterText, { color: colors.textSecondary }]}>
                      Next: {formatShortDate(loan.nextPaymentDate)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                </View>
              </Card>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScreenScrollView>

      {/* Add Loan FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddSheet(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Loan Bottom Sheet */}
      <BottomSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        title="Add New Loan"
      >
        <View style={styles.sheetContent}>
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Loan Name *</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.inputBg || colors.background, borderColor: colors.border, color: colors.text }]}
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
              placeholder="e.g., Car Loan"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Lender</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.inputBg || colors.background, borderColor: colors.border, color: colors.text }]}
              value={formData.lender}
              onChangeText={(t) => setFormData({ ...formData, lender: t })}
              placeholder="e.g., Chase Bank"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Total Amount *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.inputBg || colors.background, borderColor: colors.border, color: colors.text }]}
                value={formData.total}
                onChangeText={(t) => setFormData({ ...formData, total: t.replace(/[^0-9.]/g, '') })}
                placeholder="$0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: spacing.md }]}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Remaining *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.inputBg || colors.background, borderColor: colors.border, color: colors.text }]}
                value={formData.remaining}
                onChangeText={(t) => setFormData({ ...formData, remaining: t.replace(/[^0-9.]/g, '') })}
                placeholder="$0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Interest Rate (%)</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.inputBg || colors.background, borderColor: colors.border, color: colors.text }]}
                value={formData.rate}
                onChangeText={(t) => setFormData({ ...formData, rate: t.replace(/[^0-9.]/g, '') })}
                placeholder="0.0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: spacing.md }]}>
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Monthly Payment</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.inputBg || colors.background, borderColor: colors.border, color: colors.text }]}
                value={formData.monthly}
                onChangeText={(t) => setFormData({ ...formData, monthly: t.replace(/[^0-9.]/g, '') })}
                placeholder="$0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Loan Type</Text>
            <View style={styles.typeRow}>
              {['mortgage', 'auto', 'student', 'personal'].map((type) => {
                const info = LOAN_TYPE_ICONS[type];
                const selected = formData.type === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: selected ? info.color + '20' : colors.card,
                        borderColor: selected ? info.color : colors.border,
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, type })}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={info.icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color={selected ? info.color : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.typeChipText,
                        { color: selected ? info.color : colors.textSecondary },
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.sheetActions}>
            <Button
              title="Add Loan"
              onPress={handleAddLoan}
              variant="primary"
              style={{ flex: 1 }}
            />
          </View>
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
    paddingBottom: 100,
  },
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: borderRadius.xl || 20,
    padding: spacing.xxl,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  summaryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  summaryBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  summaryBottom: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  summaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryStatText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  loanCard: {
    marginBottom: spacing.sm,
    padding: 0,
  },
  loanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  loanIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  loanInfo: {
    flex: 1,
  },
  loanName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  loanLender: {
    fontSize: 13,
  },
  loanAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  loanRemaining: {
    fontSize: 22,
    fontWeight: '800',
    marginRight: spacing.xs,
  },
  loanTotal: {
    fontSize: 13,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  loanFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  loanFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: spacing.lg,
  },
  loanFooterText: {
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
  sheetContent: {
    gap: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.sm,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formInput: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    fontSize: 15,
  },
  formRow: {
    flexDirection: 'row',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sheetActions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
});

export default LoansScreen;
