import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal
} from 'react-native';
import { ScreenScrollView } from '../../components/common/ScreenScroll';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { resolveCategories } from '../../data/categories';
import { formatCurrency } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAppStore } from '../../store/AppStore';
import { toIonicon } from '../../utils/icons';
import { useToast } from '../../components/common/Toast';

interface AddBudgetScreenProps {
  navigation: any;
  route: any;
}

const PERIODS = ['Monthly', 'Weekly', 'Yearly'] as const;

const AddBudgetScreen: React.FC<AddBudgetScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { budgets, addBudget, updateBudget, categories: storeCategories } = useAppStore();
  const categories = resolveCategories(storeCategories);
  const toast = useToast();
  const { budgetId, editMode } = route.params || {};

  const existingBudget = useMemo(
    () => (editMode ? budgets.find((b: any) => b.id === budgetId) : null),
    [budgetId, editMode, budgets]
  );

  const [selectedCategory, setSelectedCategory] = useState(
    existingBudget?.category || ''
  );
  const [amount, setAmount] = useState(
    existingBudget ? String(existingBudget.budgeted) : ''
  );
  const [period, setPeriod] = useState<string>(
    existingBudget?.period === 'weekly'
      ? 'Weekly'
      : existingBudget?.period === 'yearly'
      ? 'Yearly'
      : 'Monthly'
  );
  const [errors] = useState<{ category?: string; amount?: string }>({});

  const categoryEntries = Object.entries(categories).filter(
    ([name]) => !['Income', 'Transfer', 'Groceries', 'Rent', 'Electricity', 'Internet', 'Phone', 'Gas', 'Insurance', 'Restaurants', 'Coffee', 'Streaming', 'Music', 'Gym', 'Medical', 'Courses', 'Books', 'Clothing', 'Movies'].includes(name)
  );

  const handleSave = () => {
    const payload = {
      category: selectedCategory || 'Other',
      budgeted: parseFloat(amount) || 500,
      period: period.toLowerCase() as 'monthly' | 'weekly' | 'yearly',
    };
    if (editMode && existingBudget) {
      updateBudget(existingBudget.id, payload);
      toast.show('Budget updated', 'success');
    } else {
      addBudget(payload);
      toast.show('Budget created', 'success');
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
          {editMode ? 'Edit Budget' : 'Add Budget'}
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
        {/* Category Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Category</Text>
          {errors.category && (
            <Text style={[styles.errorText, { color: '#EF4444' }]}>{errors.category}</Text>
          )}
          <View style={styles.categoryGrid}>
            {categoryEntries.map(([name, data]) => {
              const isSelected = selectedCategory === name;
              const catIcon = data.icon;
              const catColor = data.color;
              return (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: isSelected ? catColor + '20' : colors.surface || colors.card,
                      borderColor: isSelected ? catColor : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedCategory(name)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.categoryIconCircle, { backgroundColor: catColor + '15' }]}>
                    <Ionicons
                      name={toIonicon(catIcon)}
                      size={20}
                      color={catColor}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryName,
                      { color: isSelected ? catColor : colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Budget Amount */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Budget Amount</Text>
          <View style={[styles.amountInputContainer, { backgroundColor: colors.surface || colors.card, borderColor: errors.amount ? '#EF4444' : colors.border }]}>
            <Text style={[styles.dollarSign, { color: colors.textSecondary }]}>$</Text>
            <Input
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              style={styles.amountInput}
            />
          </View>
          {errors.amount && (
            <Text style={[styles.errorText, { color: '#EF4444' }]}>{errors.amount}</Text>
          )}
        </View>

        {/* Period Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Period</Text>
          <View style={[styles.periodContainer, { backgroundColor: colors.surface || colors.card }]}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.periodOption,
                  {
                    backgroundColor: period === p ? colors.primary : 'transparent',
                  },
                ]}
                onPress={() => setPeriod(p)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.periodText,
                    {
                      color: period === p ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <Button
            title="Save Budget"
            onPress={handleSave}
            variant="primary"
            size="lg"
            icon={<Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />}
          />
        </View>
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
    marginBottom: spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md || 12,
    borderWidth: 2,
  },
  categoryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  amountInputContainer: {
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
  periodContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.md || 12,
    padding: spacing.xs,
  },
  periodOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm || 8,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxxl,
  },
});

export default AddBudgetScreen;
