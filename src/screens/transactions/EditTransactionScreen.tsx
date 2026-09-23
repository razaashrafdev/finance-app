import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Switch
} from 'react-native';
import { ScreenScrollView } from '../../components/common/ScreenScroll';
import { useTheme } from '../../theme/ThemeContext';
import { resolveCategoryList } from '../../data/categories';
import { useAppStore } from '../../store/AppStore';
import { useToast } from '../../components/common/Toast';
import { formatCurrency } from '../../utils/format';
import Button from '../../components/common/Button';
import BottomSheet from '../../components/common/BottomSheet';

type TransactionType = 'income' | 'expense' | 'transfer';
type Frequency = 'weekly' | 'biweekly' | 'monthly' | 'yearly';

interface EditTransactionProps {
  route?: {
    params?: {
      transactionId?: string;
    };
  };
  navigation?: {
    goBack: () => void;
  };
}

const frequencies: { label: string; value: Frequency }[] = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Bi-weekly', value: 'biweekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

const accounts = [
  { id: '1', name: 'Primary Checking', icon: '🏦' },
  { id: '2', name: 'Savings Account', icon: '💰' },
  { id: '3', name: 'Credit Card', icon: '💳' },
  { id: '4', name: 'Cash', icon: '💵' },
];

const EditTransactionScreen: React.FC<EditTransactionProps> = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const { transactions, updateTransaction, deleteTransaction, categories: storeCategories } = useAppStore();
  const categoryList = resolveCategoryList(storeCategories);
  const toast = useToast();

  const transactionId = route?.params?.transactionId;
  const existingTransaction = transactions.find((t) => t.id === transactionId) || transactions[0];

  const [transactionType, setTransactionType] = useState<TransactionType>(
    existingTransaction.type as TransactionType
  );
  const [amount, setAmount] = useState(existingTransaction.amount.toString());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    existingTransaction.category
  );
  const [selectedAccount, setSelectedAccount] = useState(existingTransaction.accountId || accounts[0].id);
  const [date, setDate] = useState(new Date(existingTransaction.date));
  const [notes, setNotes] = useState(existingTransaction.notes || '');
  const [isRecurring, setIsRecurring] = useState(existingTransaction.isRecurring || false);
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [showAccountSheet, setShowAccountSheet] = useState(false);
  const [showDateSheet, setShowDateSheet] = useState(false);
  const [showFrequencySheet, setShowFrequencySheet] = useState(false);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [errors] = useState<{ amount?: string; category?: string }>({});

  const filteredCategories = categoryList.filter((cat) => {
    if (transactionType === 'income') return cat.type === 'income';
    if (transactionType === 'expense') return cat.type === 'expense';
    return true;
  });

  const handleUpdate = () => {
    updateTransaction(existingTransaction.id, {
      amount: parseFloat(amount) || existingTransaction.amount,
      category: selectedCategory || existingTransaction.category,
      type: transactionType,
      notes,
      isRecurring,
    });
    toast.show('Transaction updated', 'success');
    navigation?.goBack();
  };

  const handleDelete = () => {
    setShowDeleteSheet(true);
  };

  const confirmDelete = () => {
    deleteTransaction(existingTransaction.id);
    setShowDeleteSheet(false);
    toast.show('Transaction deleted', 'success');
    navigation?.goBack();
  };

  const renderTypeSelector = () => (
    <View style={[styles.typeSelector, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {(['income', 'expense', 'transfer'] as TransactionType[]).map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.typeOption,
            {
              backgroundColor: transactionType === type ? colors.primary : 'transparent',
            },
          ]}
          onPress={() => {
            setTransactionType(type);
            setSelectedCategory(null);
          }}
        >
          <Text
            style={[
              styles.typeText,
              { color: transactionType === type ? '#FFFFFF' : colors.text },
            ]}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAmountInput = () => (
    <View style={styles.amountContainer}>
      <Text style={[styles.currencySymbol, { color: colors.text }]}>$</Text>
      <TextInput
        style={[styles.amountInput, { color: colors.text }]}
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        placeholderTextColor={colors.textSecondary}
        keyboardType="numeric"
      />
      {errors.amount && <Text style={[styles.errorText, { color: colors.error }]}>{errors.amount}</Text>}
    </View>
  );

  const renderCategoryGrid = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Category</Text>
      {errors.category && <Text style={[styles.errorText, { color: colors.error }]}>{errors.category}</Text>}
      <View style={styles.categoryGrid}>
        {filteredCategories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryItem,
              {
                backgroundColor: selectedCategory === cat.name ? cat.color + '20' : colors.card,
                borderColor: selectedCategory === cat.name ? cat.color : colors.border,
              },
            ]}
            onPress={() => setSelectedCategory(cat.name)}
          >
            <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
              <Text style={styles.categoryIconText}>{cat.icon}</Text>
            </View>
            <Text
              style={[
                styles.categoryName,
                {
                  color: selectedCategory === cat.name ? cat.color : colors.text,
                  fontWeight: selectedCategory === cat.name ? '600' : '400',
                },
              ]}
              numberOfLines={1}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderAccountSelector = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
      <TouchableOpacity
        style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setShowAccountSheet(true)}
      >
        <Text style={[styles.selectorText, { color: colors.text }]}>
          {accounts.find((a) => a.id === selectedAccount)?.name}
        </Text>
        <Text style={[styles.selectorIcon, { color: colors.textSecondary }]}>▼</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDatePicker = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Date</Text>
      <TouchableOpacity
        style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setShowDateSheet(true)}
      >
        <Text style={[styles.selectorText, { color: colors.text }]}>
          {date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Text style={[styles.selectorIcon, { color: colors.textSecondary }]}>📅</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotesInput = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
      <TextInput
        style={[
          styles.notesInput,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Add a note..."
        placeholderTextColor={colors.textSecondary}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  );

  const renderRecurringToggle = () => (
    <View style={styles.section}>
      <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recurring</Text>
          <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
            Automatically repeat this transaction
          </Text>
        </View>
        <Switch
          value={isRecurring}
          onValueChange={setIsRecurring}
          trackColor={{ false: colors.border, true: colors.primary + '50' }}
          thumbColor={isRecurring ? colors.primary : colors.textSecondary}
        />
      </View>

      {isRecurring && (
        <TouchableOpacity
          style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}
          onPress={() => setShowFrequencySheet(true)}
        >
          <Text style={[styles.selectorText, { color: colors.text }]}>
            {frequencies.find((f) => f.value === frequency)?.label}
          </Text>
          <Text style={[styles.selectorIcon, { color: colors.textSecondary }]}>▼</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderDeleteSheet = () => (
    <BottomSheet
      visible={showDeleteSheet}
      onClose={() => setShowDeleteSheet(false)}
      title="Delete Transaction"
    >
      <View style={styles.sheetContent}>
        <Text style={[styles.sheetDescription, { color: colors.textSecondary }]}>
          Are you sure you want to delete this transaction? This action cannot be undone.
        </Text>
        <View style={styles.sheetButtons}>
          <Button
            title="Cancel"
            onPress={() => setShowDeleteSheet(false)}
            variant="outline"
            style={styles.sheetButton}
          />
          <Button
            title="Delete"
            onPress={confirmDelete}
            variant="danger"
            style={styles.sheetButton}
          />
        </View>
      </View>
    </BottomSheet>
  );

  const renderAccountSheet = () => (
    <BottomSheet
      visible={showAccountSheet}
      onClose={() => setShowAccountSheet(false)}
      title="Select Account"
    >
      <View style={styles.sheetContent}>
        {accounts.map((account) => (
          <TouchableOpacity
            key={account.id}
            style={[
              styles.sheetOption,
              {
                backgroundColor: selectedAccount === account.id ? colors.primary + '20' : colors.card,
              },
            ]}
            onPress={() => {
              setSelectedAccount(account.id);
              setShowAccountSheet(false);
            }}
          >
            <Text style={styles.sheetOptionIcon}>{account.icon}</Text>
            <Text
              style={[
                styles.sheetOptionText,
                {
                  color: selectedAccount === account.id ? colors.primary : colors.text,
                  fontWeight: selectedAccount === account.id ? '600' : '400',
                },
              ]}
            >
              {account.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>
  );

  const renderDateSheet = () => (
    <BottomSheet
      visible={showDateSheet}
      onClose={() => setShowDateSheet(false)}
      title="Select Date"
    >
      <View style={styles.sheetContent}>
        {['Today', 'Yesterday', 'Tomorrow'].map((label) => (
          <TouchableOpacity
            key={label}
            style={[styles.sheetOption, { backgroundColor: colors.card }]}
            onPress={() => {
              const d = new Date();
              if (label === 'Yesterday') d.setDate(d.getDate() - 1);
              if (label === 'Tomorrow') d.setDate(d.getDate() + 1);
              setDate(d);
              setShowDateSheet(false);
            }}
          >
            <Text style={[styles.sheetOptionText, { color: colors.text }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>
  );

  const renderFrequencySheet = () => (
    <BottomSheet
      visible={showFrequencySheet}
      onClose={() => setShowFrequencySheet(false)}
      title="Select Frequency"
    >
      <View style={styles.sheetContent}>
        {frequencies.map((freq) => (
          <TouchableOpacity
            key={freq.value}
            style={[
              styles.sheetOption,
              {
                backgroundColor: frequency === freq.value ? colors.primary + '20' : colors.card,
              },
            ]}
            onPress={() => {
              setFrequency(freq.value);
              setShowFrequencySheet(false);
            }}
          >
            <Text
              style={[
                styles.sheetOptionText,
                {
                  color: frequency === freq.value ? colors.primary : colors.text,
                  fontWeight: frequency === freq.value ? '600' : '400',
                },
              ]}
            >
              {freq.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.closeButton}>
          <Text style={[styles.closeText, { color: colors.text }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Transaction</Text>
        <View style={styles.headerRight} />
      </View>

      <ScreenScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        {renderTypeSelector()}
        {renderAmountInput()}
        {renderCategoryGrid()}
        {renderAccountSelector()}
        {renderDatePicker()}
        {renderNotesInput()}
        {renderRecurringToggle()}
      </ScreenScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title="Update Transaction"
          onPress={handleUpdate}
          variant="primary"
          style={styles.updateButton}
        />
        <Button
          title="Delete Transaction"
          onPress={handleDelete}
          variant="danger"
          style={styles.deleteButton}
        />
      </View>

      {renderDeleteSheet()}
      {renderAccountSheet()}
      {renderDateSheet()}
      {renderFrequencySheet()}
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
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 32,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 180,
  },
  typeSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '300',
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconText: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 11,
    textAlign: 'center',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectorIcon: {
    fontSize: 12,
  },
  notesInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 100,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  updateButton: {
    width: '100%',
  },
  deleteButton: {
    width: '100%',
  },
  sheetContent: {
    padding: 20,
  },
  sheetDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sheetButton: {
    flex: 1,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sheetOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sheetOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EditTransactionScreen;
