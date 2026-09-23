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
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { formatCurrency } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';
import { toIonicon } from '../../utils/icons';
import { useAppStore } from '../../store/AppStore';
import { useToast } from '../../components/common/Toast';

interface AddGoalScreenProps {
  navigation: any;
  route: any;
}

const GOAL_ICONS = [
  { name: 'car', label: 'Car' },
  { name: 'home', label: 'Home' },
  { name: 'laptop', label: 'Laptop' },
  { name: 'shield-checkmark', label: 'Shield' },
  { name: 'sunny', label: 'Sun' },
  { name: 'airplane', label: 'Travel' },
  { name: 'heart', label: 'Health' },
  { name: 'gift', label: 'Gift' },
] as const;

const GOAL_COLORS = [
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#6366F1',
  '#000000',
];

const AddGoalScreen: React.FC<AddGoalScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { savingsGoals, addGoal, updateGoal } = useAppStore();
  const toast = useToast();
  const { goalId, editMode } = route.params || {};

  const existingGoal = useMemo(
    () => (editMode ? savingsGoals.find((g: any) => g.id === goalId) : null),
    [goalId, editMode, savingsGoals]
  );

  const [name, setName] = useState(existingGoal?.name || '');
  const [targetAmount, setTargetAmount] = useState(
    existingGoal ? String(existingGoal.targetAmount) : ''
  );
  const [currentAmount, setCurrentAmount] = useState(
    existingGoal ? String(existingGoal.currentAmount) : ''
  );
  const [selectedIcon, setSelectedIcon] = useState(
    existingGoal?.icon || 'car'
  );
  const [selectedColor, setSelectedColor] = useState(
    existingGoal?.color || '#10B981'
  );
  const [errors] = useState<{
    name?: string;
    targetAmount?: string;
  }>({});

  const handleSave = () => {
    const payload = {
      name: name.trim() || 'New Goal',
      targetAmount: parseFloat(targetAmount) || 1000,
      currentAmount: parseFloat(currentAmount) || 0,
      icon: selectedIcon,
      color: selectedColor,
    };
    if (editMode && existingGoal) {
      updateGoal(existingGoal.id, payload);
      toast.show('Goal updated', 'success');
    } else {
      addGoal(payload);
      toast.show('Goal created', 'success');
    }
    navigation.goBack();
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {editMode ? 'Edit Goal' : 'Create Goal'}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.headerSaveButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Text style={styles.headerSaveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScreenScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Goal Name */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Goal Name</Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="e.g. New Car"
            error={errors.name}
          />
        </View>

        {/* Target Amount */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Target Amount</Text>
          <View style={[styles.amountContainer, { backgroundColor: colors.surface || colors.card, borderColor: errors.targetAmount ? '#EF4444' : colors.border }]}>
            <Text style={[styles.dollarSign, { color: colors.textSecondary }]}>$</Text>
            <Input
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="0.00"
              keyboardType="numeric"
              style={styles.amountInput}
            />
          </View>
          {errors.targetAmount && (
            <Text style={[styles.errorText, { color: '#EF4444' }]}>{errors.targetAmount}</Text>
          )}
        </View>

        {/* Current Amount */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Current Amount</Text>
          <View style={[styles.amountContainer, { backgroundColor: colors.surface || colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dollarSign, { color: colors.textSecondary }]}>$</Text>
            <Input
              value={currentAmount}
              onChangeText={setCurrentAmount}
              placeholder="0.00"
              keyboardType="numeric"
              style={styles.amountInput}
            />
          </View>
        </View>

        {/* Icon Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Icon</Text>
          <View style={styles.iconGrid}>
            {GOAL_ICONS.map((icon) => {
              const isSelected = selectedIcon === icon.name;
              return (
                <TouchableOpacity
                  key={icon.name}
                  style={[
                    styles.iconItem,
                    {
                      backgroundColor: isSelected ? selectedColor + '20' : colors.surface || colors.card,
                      borderColor: isSelected ? selectedColor : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedIcon(icon.name)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={toIonicon(icon.name)}
                    size={24}
                    color={isSelected ? selectedColor : colors.text}
                  />
                  <Text
                    style={[
                      styles.iconLabel,
                      { color: isSelected ? selectedColor : colors.textSecondary },
                    ]}
                  >
                    {icon.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Color Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Color</Text>
          <View style={styles.colorRow}>
            {GOAL_COLORS.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: color,
                      borderColor: isSelected ? colors.background : 'transparent',
                      borderWidth: isSelected ? 3 : 0,
                    },
                  ]}
                  onPress={() => setSelectedColor(color)}
                  activeOpacity={0.7}
                />
              );
            })}
          </View>
        </View>

        {/* Preview */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Preview</Text>
          <View style={[styles.previewCard, { backgroundColor: colors.surface || colors.card }]}>
            <View style={[styles.previewIcon, { backgroundColor: selectedColor + '15' }]}>
              <Ionicons
                name={toIonicon(selectedIcon)}
                size={28}
                color={selectedColor}
              />
            </View>
            <View style={styles.previewInfo}>
              <Text style={[styles.previewName, { color: colors.text }]}>
                {name || 'Goal Name'}
              </Text>
              <Text style={[styles.previewAmount, { color: colors.textSecondary }]}>
                {targetAmount ? formatCurrency(parseFloat(targetAmount)) : '$0'} target
              </Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <Button
            title={editMode ? 'Save Changes' : 'Create Goal'}
            onPress={handleSave}
            variant="primary"
            size="lg"
            icon={<Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />}
          />
        </View>

        <View style={{ height: 60 }} />
      </ScreenScrollView>
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
  headerSaveButton: {
    minWidth: 64,
    height: 36,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSaveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md || 12,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    height: 64,
  },
  dollarSign: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    marginBottom: 0,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconItem: {
    width: '22%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md || 12,
    borderWidth: 2,
  },
  iconLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md || 12,
  },
  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  previewAmount: {
    fontSize: 14,
  },
  saveSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxxl,
  },
});

export default AddGoalScreen;
