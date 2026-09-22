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
import ProgressRing from '../../components/common/ProgressRing';
import { formatCurrency, daysUntil } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAppStore } from '../../store/AppStore';
import { toIonicon } from '../../utils/icons';

interface GoalsListScreenProps {
  navigation: any;
}

const GoalsListScreen: React.FC<GoalsListScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { savingsGoals } = useAppStore();

  const totalSaved = useMemo(
    () => savingsGoals.reduce((sum: number, g: any) => sum + g.currentAmount, 0),
    [savingsGoals]
  );
  const totalTarget = useMemo(
    () => savingsGoals.reduce((sum: number, g: any) => sum + g.targetAmount, 0),
    [savingsGoals]
  );
  const overallPercentage = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const formatDeadline = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Savings Goals</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Saved Summary */}
        <View style={[styles.summaryCard, { backgroundColor: '#10B981' }]}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>Total Saved</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(totalSaved)}</Text>
            </View>
            <ProgressRing
              progress={Math.min(overallPercentage / 100, 1)}
              size={72}
              strokeWidth={6}
              color="#FFFFFF"
              backgroundColor="rgba(255,255,255,0.2)"
            >
              <Text style={styles.summaryPercent}>{Math.round(overallPercentage)}%</Text>
            </ProgressRing>
          </View>
          <Text style={styles.summaryTarget}>
            of {formatCurrency(totalTarget)} total target
          </Text>
        </View>

        {/* Goals List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Goals</Text>

          {savingsGoals.map((goal: any) => {
            const percentage = goal.targetAmount > 0
              ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
              : 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            const days = daysUntil(goal.deadline);
            const catColor = goal.color || '#4F46E5';

            return (
              <Card
                key={goal.id}
                variant="elevated"
                style={styles.goalCard}
                onPress={() => navigation.navigate('GoalDetail', { goalId: goal.id })}
              >
                <View style={styles.goalRow}>
                  <View style={[styles.goalIcon, { backgroundColor: catColor + '15' }]}>
                    <Ionicons
                      name={toIonicon(goal.icon || 'flag')}
                      size={22}
                      color={catColor}
                    />
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalName, { color: colors.text }]}>{goal.name}</Text>
                    <Text style={[styles.goalAmounts, { color: colors.textSecondary }]}>
                      {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </View>

                <View style={[styles.goalBarBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.goalBarFill,
                      { width: `${Math.min(percentage, 100)}%`, backgroundColor: catColor },
                    ]}
                  />
                </View>

                <View style={styles.goalFooter}>
                  <View style={styles.goalFooterLeft}>
                    <Text style={[styles.goalPercent, { color: catColor }]}>{percentage}%</Text>
                    <Text style={[styles.goalRemaining, { color: colors.textSecondary }]}>
                      · {formatCurrency(remaining)} to go
                    </Text>
                  </View>
                  <View style={styles.deadlineBadge}>
                    <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                    <Text style={[styles.deadlineText, { color: colors.textSecondary }]}>
                      Due {formatDeadline(goal.deadline)}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Goal Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: '#10B981' }]}
        onPress={() => navigation.navigate('AddGoal')}
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
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  summaryPercent: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  summaryTarget: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
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
  goalCard: {
    marginBottom: spacing.sm,
    padding: 0,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  goalAmounts: {
    fontSize: 13,
  },
  goalBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: spacing.md,
  },
  goalBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  goalFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalPercent: {
    fontSize: 13,
    fontWeight: '700',
  },
  goalRemaining: {
    fontSize: 12,
    marginLeft: 4,
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 11,
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
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default GoalsListScreen;
