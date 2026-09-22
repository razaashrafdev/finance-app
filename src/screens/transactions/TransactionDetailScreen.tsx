import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { categories } from '../../data/mockData';
import { useAppStore } from '../../store/AppStore';
import { formatCurrency, formatDate, formatShortDate } from '../../utils/format';
import Badge from '../../components/common/Badge';
import BottomSheet from '../../components/common/BottomSheet';
import Button from '../../components/common/Button';

interface TransactionDetailProps {
  route?: {
    params?: {
      transactionId?: string;
    };
  };
  navigation?: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

const TransactionDetailScreen: React.FC<TransactionDetailProps> = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const { transactions, deleteTransaction } = useAppStore();
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);

  const transactionId = route?.params?.transactionId;
  const transaction = transactions.find((t) => t.id === transactionId) || transactions[0];

  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';

  const categoryMeta = categories[transaction.category as keyof typeof categories];
  const categoryColor = categoryMeta?.color || colors.primary;
  const statusLabel = 'completed';

  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'income':
        return '↗';
      case 'expense':
        return '↘';
      case 'transfer':
        return '↔';
      default:
        return '•';
    }
  };

  const handleEdit = () => {
    navigation?.navigate('EditTransaction', { transactionId: transaction.id });
  };

  const handleDelete = () => {
    setShowDeleteSheet(true);
  };

  const confirmDelete = () => {
    deleteTransaction(transaction.id);
    setShowDeleteSheet(false);
    navigation?.goBack();
  };

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.iconContainer, { backgroundColor: categoryColor + '20' }]}>
          <View style={[styles.iconCircle, { backgroundColor: categoryColor }]}>
            <Text style={styles.iconText}>{getTransactionIcon()}</Text>
          </View>
        </View>

        <Text
          style={[
            styles.amount,
            {
              color: isIncome ? colors.income : isTransfer ? colors.primary : colors.expense,
            },
          ]}
        >
          {isIncome ? '+' : isTransfer ? '' : '-'}
          {formatCurrency(transaction.amount)}
        </Text>

        <Text style={[styles.title, { color: colors.text }]}>{transaction.title}</Text>

        <View style={styles.badgeRow}>
          <Badge
            label={transaction.category}
            variant="info"
          />
          <Badge
            label={statusLabel}
            variant="success"
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date & Time</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(transaction.date)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Type</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Category</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {transaction.category}
            </Text>
          </View>

          {isTransfer && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>From</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {transaction.accountName || 'Checking Account'}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>To</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  Savings Account
                </Text>
              </View>
            </>
          )}

          {!isTransfer && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Account</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {transaction.accountName || 'Primary Checking'}
                </Text>
              </View>
            </>
          )}
        </View>

        {transaction.notes && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Notes</Text>
            <Text style={[styles.notesText, { color: colors.text }]}>{transaction.notes}</Text>
          </View>
        )}

        {transaction.isRecurring && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Recurring</Text>
              <Badge label="Yes" variant="info" />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title="Edit Transaction"
          onPress={handleEdit}
          variant="primary"
          style={styles.footerButton}
        />
        <Button
          title="Delete Transaction"
          onPress={handleDelete}
          variant="danger"
          style={styles.footerButton}
        />
      </View>

      {renderDeleteSheet()}
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
  backButton: {
    padding: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 60,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
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
  footerButton: {
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
});

export default TransactionDetailScreen;
