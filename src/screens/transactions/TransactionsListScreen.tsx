import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar
} from 'react-native';
import { ScreenFlatList } from '../../components/common/ScreenScroll';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/AppStore';
import { categoryList } from '../../data/mockData';
import { formatCurrency, formatDate, formatShortDate } from '../../utils/format';
import TransactionRow from '../../components/common/TransactionRow';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import BottomSheet from '../../components/common/BottomSheet';

type FilterType = 'all' | 'income' | 'expense' | 'transfer';
type DateFilter = 'thisWeek' | 'thisMonth' | 'lastMonth' | 'custom';

interface DateRange {
  label: string;
  value: DateFilter;
}

const dateRanges: DateRange[] = [
  { label: 'This Week', value: 'thisWeek' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'Custom', value: 'custom' },
];

const TransactionsListScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { transactions } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('thisMonth');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showDateSheet, setShowDateSheet] = useState(false);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }

    if (activeFilter !== 'all') {
      result = result.filter((t) => t.type === activeFilter);
    }

    if (selectedCategory) {
      result = result.filter((t) => t.category === selectedCategory);
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchQuery, activeFilter, selectedCategory]);

  const groupedTransactions = useMemo(() => {
    const groups: { title: string; data: typeof filteredTransactions }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const todayItems: typeof filteredTransactions = [];
    const yesterdayItems: typeof filteredTransactions = [];
    const weekItems: typeof filteredTransactions = [];
    const earlierItems: typeof filteredTransactions = [];

    filteredTransactions.forEach((t) => {
      const date = new Date(t.date);
      date.setHours(0, 0, 0, 0);

      if (date.getTime() === today.getTime()) {
        todayItems.push(t);
      } else if (date.getTime() === yesterday.getTime()) {
        yesterdayItems.push(t);
      } else if (date >= weekStart) {
        weekItems.push(t);
      } else {
        earlierItems.push(t);
      }
    });

    if (todayItems.length > 0) groups.push({ title: 'Today', data: todayItems });
    if (yesterdayItems.length > 0) groups.push({ title: 'Yesterday', data: yesterdayItems });
    if (weekItems.length > 0) groups.push({ title: 'This Week', data: weekItems });
    if (earlierItems.length > 0) groups.push({ title: 'Earlier', data: earlierItems });

    return groups;
  }, [filteredTransactions]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const renderDateFilterSheet = () => (
    <BottomSheet
      visible={showDateSheet}
      onClose={() => setShowDateSheet(false)}
      title="Select Date Range"
    >
      <View style={styles.sheetContent}>
        {dateRanges.map((range) => (
          <TouchableOpacity
            key={range.value}
            style={[
              styles.dateOption,
              { backgroundColor: dateFilter === range.value ? colors.primary + '20' : colors.card },
            ]}
            onPress={() => {
              setDateFilter(range.value);
              setShowDateSheet(false);
            }}
          >
            <Text
              style={[
                styles.dateOptionText,
                { color: dateFilter === range.value ? colors.primary : colors.text },
              ]}
            >
              {range.label}
            </Text>
            {dateFilter === range.value && (
              <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>
  );

  const renderCategorySheet = () => (
    <BottomSheet
      visible={showCategorySheet}
      onClose={() => setShowCategorySheet(false)}
      title="Filter by Category"
    >
      <View style={styles.sheetContent}>
        <TouchableOpacity
          style={[
            styles.categoryOption,
            { backgroundColor: !selectedCategory ? colors.primary + '20' : colors.card },
          ]}
          onPress={() => {
            setSelectedCategory(null);
            setShowCategorySheet(false);
          }}
        >
          <Text
            style={[
              styles.categoryOptionText,
              { color: !selectedCategory ? colors.primary : colors.text },
            ]}
          >
            All Categories
          </Text>
        </TouchableOpacity>
        {categoryList.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryOption,
              { backgroundColor: selectedCategory === cat.name ? colors.primary + '20' : colors.card },
            ]}
            onPress={() => {
              setSelectedCategory(cat.name);
              setShowCategorySheet(false);
            }}
          >
            <Text
              style={[
                styles.categoryOptionText,
                { color: selectedCategory === cat.name ? colors.primary : colors.text },
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>
  );

  const renderFilterChips = () => (
    <View style={styles.chipRow}>
      {(['all', 'income', 'expense', 'transfer'] as FilterType[]).map((filter) => {
        const selected = activeFilter === filter;
        return (
          <TouchableOpacity
            key={filter}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? colors.primary : colors.card,
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveFilter(filter)}
            activeOpacity={0.8}
          >
            <Text
              numberOfLines={1}
              style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.text }]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowDateSheet(true)}
        >
          <Text style={[styles.filterButtonText, { color: colors.text }]}>
            {dateRanges.find((r) => r.value === dateFilter)?.label}
          </Text>
          <Text style={[styles.filterIcon, { color: colors.textSecondary }]}>▼</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowCategorySheet(true)}
        >
          <Text style={[styles.filterButtonText, { color: colors.text }]}>
            {selectedCategory || 'All Categories'}
          </Text>
          <Text style={[styles.filterIcon, { color: colors.textSecondary }]}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.countRow}>
        <Text style={[styles.countText, { color: colors.textSecondary }]}>
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  const renderSectionHeader = (title: string) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <TransactionRow
      transaction={item}
      onPress={() => {}}
    />
  );

  const renderList = () => (
    <ScreenFlatList
      data={filteredTransactions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        <EmptyState
          title="No transactions found"
          description="Try adjusting your filters or add a new transaction."
          icon="receipt-outline"
        />
      }
      contentContainerStyle={[styles.listContent, { paddingBottom: 156 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowCategorySheet(true)}
        >
          <Text style={styles.floatingButtonText}>⊞</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search transactions..."
        />
      </View>

      <View style={styles.chipContainer}>{renderFilterChips()}</View>

      {renderList()}

      {renderDateFilterSheet()}
      {renderCategorySheet()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  chipContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 6,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterIcon: {
    fontSize: 12,
  },
  countRow: {
    alignItems: 'flex-start',
  },
  countText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 20,
  },
  sheetContent: {
    padding: 20,
  },
  dateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  dateOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TransactionsListScreen;
