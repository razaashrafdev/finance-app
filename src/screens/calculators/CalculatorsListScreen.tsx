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
import { spacing, borderRadius } from '../../theme/spacing';

interface CalculatorsListScreenProps {
  navigation: any;
}

const CALCULATORS = [
  { id: 'loan', name: 'Loan Calculator', description: 'Calculate loan payments & amortization', icon: 'cash', color: '#4F46E5' },
  { id: 'mortgage', name: 'Mortgage Calculator', description: 'Estimate mortgage payments', icon: 'home', color: '#10B981' },
  { id: 'emi', name: 'EMI Calculator', description: 'Equated monthly installment', icon: 'calculator', color: '#F59E0B' },
  { id: 'compound', name: 'Compound Interest', description: 'Grow your savings over time', icon: 'trending-up', color: '#8B5CF6' },
  { id: 'simple', name: 'Simple Interest', description: 'Basic interest calculations', icon: 'pie-chart-outline', color: '#EC4899' },
  { id: 'savings', name: 'Savings Calculator', description: 'Plan your savings goals', icon: 'save-outline', color: '#14B8A6' },
  { id: 'investment', name: 'Investment Return', description: 'ROI and growth projections', icon: 'bar-chart-outline', color: '#F97316' },
  { id: 'debt', name: 'Debt Payoff', description: 'Plan your debt elimination', icon: 'clipboard-outline', color: '#EF4444' },
  { id: 'retirement', name: 'Retirement Calculator', description: 'Plan for retirement', icon: 'sunny-outline', color: '#6366F1' },
  { id: 'networth', name: 'Net Worth Calculator', description: 'Track your total wealth', icon: 'wallet', color: '#0EA5E9' },
  { id: 'emergency', name: 'Emergency Fund', description: 'Build your safety net', icon: 'shield-checkmark', color: '#22C55E' },
  { id: 'percentage', name: 'Percentage Calculator', description: 'Quick percentage operations', icon: 'calculator-outline', color: '#A855F7' },
];

const CalculatorsListScreen: React.FC<CalculatorsListScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return CALCULATORS;
    const q = search.toLowerCase();
    return CALCULATORS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }, [search]);

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Financial Calculators</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TouchableOpacity
            style={styles.searchInput}
            activeOpacity={1}
          >
            <Text
              style={[
                styles.searchText,
                { color: search ? colors.text : colors.textTertiary },
              ]}
            >
              {search || 'Search calculators...'}
            </Text>
          </TouchableOpacity>
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Calculators Grid */}
        <View style={styles.grid}>
          {filtered.map((calc) => (
            <TouchableOpacity
              key={calc.id}
              style={[styles.calcCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() =>
                navigation.navigate('CalculatorDetail', {
                  calculatorId: calc.id,
                  calculatorName: calc.name,
                  calculatorColor: calc.color,
                })
              }
              activeOpacity={0.7}
            >
              <View style={[styles.calcIconCircle, { backgroundColor: calc.color + '15' }]}>
                <Ionicons
                  name={calc.icon as keyof typeof Ionicons.glyphMap}
                  size={28}
                  color={calc.color}
                />
              </View>
              <Text style={[styles.calcName, { color: colors.text }]} numberOfLines={1}>
                {calc.name}
              </Text>
              <Text style={[styles.calcDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {calc.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No calculators found
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
  },
  searchText: {
    fontSize: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg - 6,
    marginTop: spacing.xl,
    gap: 12,
  },
  calcCard: {
    width: '47%',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  calcIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  calcName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  calcDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxxxl,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default CalculatorsListScreen;
