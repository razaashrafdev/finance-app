import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { toIonicon } from '../../utils/icons';

interface Transaction {
  title: string;
  amount: number;
  category: string;
  date: string;
  icon?: string;
  type: string;
  accountName?: string;
}

interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
  style?: ViewStyle;
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  food: 'restaurant-outline',
  shopping: 'cart-outline',
  transport: 'car-outline',
  bills: 'receipt-outline',
  salary: 'cash-outline',
  entertainment: 'film-outline',
  health: 'heart-outline',
  education: 'school-outline',
  transfer: 'swap-horizontal-outline',
  other: 'ellipsis-horizontal-outline',
};

const CATEGORY_COLORS: Record<string, string> = {
  food: '#FF6B6B',
  shopping: '#4ECDC4',
  transport: '#45B7D1',
  bills: '#F7DC6F',
  salary: '#10B981',
  entertainment: '#BB8FCE',
  health: '#F1948A',
  education: '#85C1E9',
  transfer: '#96CEB4',
  other: '#9CA3AF',
};

const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  onPress,
  style,
}) => {
  const { colors } = useTheme();

  const categoryKey = transaction.category.toLowerCase();
  const iconName = toIonicon(transaction.icon || CATEGORY_ICONS[categoryKey] || 'ellipsis-horizontal-outline');
  const categoryColor = CATEGORY_COLORS[categoryKey] || colors.primary;

  const formatAmount = (amount: number): string => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return transaction.type === 'income' ? `+$${formatted}` : `-$${formatted}`;
  };

  const amountColor = transaction.type === 'income'
    ? colors.income
    : colors.expense;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.borderLight,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: categoryColor + '14',
            borderColor: categoryColor + '28',
          },
        ]}
      >
        <Ionicons name={iconName} size={20} color={categoryColor} />
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={1}
        >
          {transaction.title}
        </Text>
        <Text
          style={[styles.subtitle, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {transaction.category}
          {transaction.accountName ? ` • ${transaction.accountName}` : ''}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {formatAmount(transaction.amount)}
        </Text>
        <Text
          style={[styles.date, { color: colors.textTertiary }]}
        >
          {transaction.date}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  date: {
    fontSize: 11,
  },
});

export default TransactionRow;
