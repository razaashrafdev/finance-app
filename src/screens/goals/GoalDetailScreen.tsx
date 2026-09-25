import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert
} from 'react-native';
import { ScreenScrollView } from '../../components/common/ScreenScroll';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ProgressRing from '../../components/common/ProgressRing';
import { formatCurrency, formatDate, daysUntil } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAppStore } from '../../store/AppStore';
import { toIonicon } from '../../utils/icons';

interface GoalDetailScreenProps {
  navigation: any;
  route: any;
}

const GoalDetailScreen: React.FC<GoalDetailScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { savingsGoals, updateGoal, deleteGoal } = useAppStore();
  const { goalId } = route.params || {};

  const goal = useMemo(
    () => savingsGoals.find((g: any) => g.id === goalId),
    [goalId, savingsGoals]
  );

  const [addMoneyVisible, setAddMoneyVisible] = useState(false);
  const [addAmount, setAddAmount] = useState('');

  if (!goal) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Goal not found.</Text>
      </View>
    );
  }

  const percentage = (goal.targetAmount || 0) > 0
    ? Math.round(((goal.currentAmount || 0) / (goal.targetAmount || 0)) * 100)
    : 0;
  const remaining = (goal.targetAmount || 0) - (goal.currentAmount || 0);
  const days = daysUntil(goal.deadline);
  const catColor = goal.color || '#4F46E5';
  const goalName = goal.name || 'Goal';
  const goalIcon = goal.icon || 'flag';

  const handleAddMoney = () => {
    const parsed = parseFloat(addAmount) || 50;
    updateGoal(goal.id, { currentAmount: (goal.currentAmount || 0) + parsed });
    setAddMoneyVisible(false);
    setAddAmount('');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goalName}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteGoal(goal.id);
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
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {goalName}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ringSection}>
          <ProgressRing
            progress={Math.min(percentage / 100, 1)}
            size={200}
            strokeWidth={14}
            color={catColor}
            backgroundColor={colors.border || '#E5E7EB'}
          >
            <View style={styles.ringContent}>
              <Ionicons
                name={toIonicon(goalIcon)}
                size={32}
                color={catColor}
              />
              <Text style={[styles.ringPercent, { color: colors.text }]}>{percentage}%</Text>
            </View>
          </ProgressRing>
        </View>

        <View style={styles.amountSection}>
          <Text style={[styles.savedAmount, { color: colors.text }]}>
            {formatCurrency(goal.currentAmount || 0)}
            <Text style={[styles.targetAmount, { color: colors.textSecondary }]}>
              {' of '}
              {formatCurrency(goal.targetAmount || 0)}
            </Text>
          </Text>
          <Text style={[styles.remainingText, { color: catColor }]}>
            {formatCurrency(remaining)} to go
          </Text>
        </View>

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {days > 0 ? `${days} days remaining` : 'Deadline passed'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Milestones</Text>
          <Card variant="elevated" style={styles.milestonesCard}>
            {(goal.milestones || []).map((milestone: any, index: number) => (
              <View key={index} style={styles.milestoneRow}>
                <View style={styles.milestoneTimeline}>
                  <View
                    style={[
                      styles.milestoneDot,
                      {
                        backgroundColor: milestone.reached ? catColor : colors.border || '#E5E7EB',
                        borderColor: milestone.reached ? catColor : colors.border || '#E5E7EB',
                      },
                    ]}
                  >
                    {milestone.reached && (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    )}
                  </View>
                  {index < (goal.milestones || []).length - 1 && (
                    <View
                      style={[
                        styles.milestoneLine,
                        {
                          backgroundColor:
                            milestone.reached && goal.milestones[index + 1]?.reached
                              ? catColor
                              : colors.border || '#E5E7EB',
                        },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.milestoneInfo}>
                  <Text style={[styles.milestoneAmount, { color: colors.text }]}>
                    {formatCurrency(milestone.amount || 0)}
                  </Text>
                  <Text style={[styles.milestoneDate, { color: colors.textSecondary }]}>
                    {milestone.reached
                      ? `Reached ${formatDate(milestone.date)}`
                      : 'Not yet reached'}
                  </Text>
                </View>
                {milestone.reached ? (
                  <Ionicons name="checkmark-circle" size={20} color={catColor} />
                ) : (
                  <Ionicons name="ellipse-outline" size={20} color={colors.textTertiary} />
                )}
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.actionsSection}>
          <Button
            title="Add Money"
            onPress={() => setAddMoneyVisible(true)}
            variant="primary"
            size="lg"
            icon={<Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />}
          />
          <View style={styles.secondaryActions}>
            <Button
              title="Edit Goal"
              onPress={() => navigation.navigate('AddGoal', { goalId: goal.id, editMode: true })}
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
        </View>

        <View style={{ height: 40 }} />
      </ScreenScrollView>

      <Modal visible={addMoneyVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Money</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              How much would you like to add?
            </Text>
            <View style={styles.modalInputRow}>
              <Text style={[styles.modalDollar, { color: colors.textSecondary }]}>'$'</Text>
              <Input
                value={addAmount}
                onChangeText={setAddAmount}
                placeholder="0.00"
                keyboardType="numeric"
                style={styles.modalInput}
              />
            </View>
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => { setAddMoneyVisible(false); setAddAmount(''); }}
                variant="ghost"
                size="md"
                style={{ flex: 1 }}
              />
              <Button
                title="Add"
                onPress={handleAddMoney}
                variant="primary"
                size="md"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  ringPercent: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  amountSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  savedAmount: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  targetAmount: {
    fontSize: 18,
    fontWeight: '500',
  },
  remainingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.xl,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
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
  milestonesCard: {
    padding: spacing.md,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  milestoneTimeline: {
    alignItems: 'center',
    width: 28,
    marginRight: spacing.md,
  },
  milestoneDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneLine: {
    width: 2,
    height: 24,
    marginTop: 4,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneAmount: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  milestoneDate: {
    fontSize: 12,
  },
  actionsSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalContent: {
    width: '100%',
    borderRadius: borderRadius.xl || 20,
    padding: spacing.xxl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: spacing.xl,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalDollar: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  modalInput: {
    flex: 1,
    marginBottom: 0,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});

export default GoalDetailScreen;
