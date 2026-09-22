import React, { useMemo, useState } from 'react';
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
import ProgressRing from '../../components/common/ProgressRing';
import { categories } from '../../data/mockData';
import { formatCurrency, formatDate } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAppStore } from '../../store/AppStore';
import { toIonicon } from '../../utils/icons';

interface BudgetDetailScreenProps {
  navigation: any;
  route: any;
}

const BudgetDetailScreen: React.FC<BudgetDetailScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { budgets, transactions, deleteBudget } = useAppStore();
  const { budgetId } = route.params || {};

  const budget = useMemo(
    () => budgets.find((b: any) => b.id === budgetId),
    [budgetId, budgets]
  );

  const categoryTransactions = useMemo(() => {
    if (!budget) return [];
    return transactions.filter(
      (t: any) =>
        t.type === 'expense' &&
        (t.category === budget.category || t.subcategory === budget.category)
    );
  }, [budget, transactions]);

  if (!budget) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Budget not found.</Text>
      </View>
    );
  }

  const percentage = budget.budgeted > 0 ? (budget.spent / budget.budgeted) * 100 : 0;
  const remaining = budget.budgeted - budget.spent;
  const isOverBudget = remaining < 0;
  const catData = categories[budget.category as keyof typeof categories];
  const catColor = catData?.color || budget.color || '#4F46E5';

  const getProgressColor = () => {
    if (percentage >= 90) return '#EF4444';
    if (percentage >= 70) return '#F59E0B';
    return '#10B981';
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete the ${budget.category} budget?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteBudget(budget.id);
            navigation.goBack();
          },
        },
      ]
    );
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>{budget.category}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Ring */}
        <View style={styles.ringSection}>
          <ProgressRing
            progress={Math.min(percentage / 100, 1)}
            size={200}
            strokeWidth={14}
            color={getProgressColor()}
            backgroundColor={colors.border || '#E5E7EB'}
          >
            <View style={styles.ringContent}>
              <Text style={[styles.ringPercentage, { color: colors.text }]}>
                {Math.round(percentage)}%
              </Text>
              <Text style={[styles.ringLabel, { color: colors.textSecondary }]}>spent</Text>
            </View>
          </ProgressRing>
        </View>

        {/* Amount Details */}
        <View style={styles.amountSection}>
          <Text style={[styles.spentAmount, { color: colors.text }]}>
            {formatCurrency(budget.spent)}
            <Text style={[styles.budgetedAmount, { color: colors.textSecondary }]}>
              {' '}of {formatCurrency(budget.budgeted)}
            </Text>
          </Text>
          <Text style={[styles.remainingText, { color: isOverBudget ? '#EF4444' : '#10B981' }]}>
            {isOverBudget
              ? `Over budget by ${formatCurrency(Math.abs(remaining))}`
              : `${formatCurrency(remaining)} remaining`}
          </Text>
        </View>

        {/* Period Info */}
        <View style={styles.periodRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.periodText, { color: colors.textSecondary }]}>
            Monthly • Sep 2026
          </Text>
        </View>

        {/* Edit Button */}
        <View style={styles.actionSection}>
          <Button
            title="Edit Budget"
            onPress={() => navigation.navigate('AddBudget', { budgetId: budget.id, editMode: true })}
            variant="secondary"
            size="md"
            icon={<Ionicons name="create-outline" size={18} color={colors.primary} />}
          />
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Transactions in this category
          </Text>
          {categoryTransactions.length === 0 ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No transactions found for this category.
              </Text>
            </Card>
          ) : (
            categoryTransactions.map((tx: any) => (
              <Card key={tx.id} variant="elevated" style={styles.transactionCard}>
                <View style={styles.txRow}>
                  <View style={[styles.txIcon, { backgroundColor: catColor + '15' }]}>
                    <Ionicons
                      name={toIonicon(tx.icon || 'receipt-outline')}
                      size={18}
                      color={catColor}
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={[styles.txTitle, { color: colors.text }]} numberOfLines={1}>
                      {tx.title}
                    </Text>
                    <Text style={[styles.txMeta, { color: colors.textSecondary }]}>
                      {tx.subcategory} • {formatDate(tx.date)}
                    </Text>
                  </View>
                  <Text style={[styles.txAmount, { color: '#EF4444' }]}>
                    {formatCurrency(Math.abs(tx.amount))}
                  </Text>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Delete Button */}
        <View style={styles.deleteSection}>
          <Button
            title="Delete Budget"
            onPress={handleDelete}
            variant="danger"
            size="md"
            icon={<Ionicons name="trash-outline" size={18} color="#FFFFFF" />}
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
  ringSection: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  ringContent: {
    alignItems: 'center',
  },
  ringPercentage: {
    fontSize: 40,
    fontWeight: '800',
  },
  ringLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  amountSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  spentAmount: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  budgetedAmount: {
    fontSize: 18,
    fontWeight: '500',
  },
  remainingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.xl,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
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
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  transactionCard: {
    marginBottom: spacing.sm,
    padding: 0,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  txMeta: {
    fontSize: 12,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteSection: {
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
});

export default BudgetDetailScreen;
