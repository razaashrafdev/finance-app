import React, { useState } from 'react';
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
import { useAppStore } from '../../store/AppStore';
import { formatCurrency, formatDate, formatShortDate } from '../../utils/format';
import { spacing, borderRadius, shadow } from '../../theme/spacing';
import Badge from '../../components/common/Badge';
import BottomSheet from '../../components/common/BottomSheet';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

interface IncomeDetailProps {
  route?: {
    params?: {
      incomeId?: string;
    };
  };
  navigation?: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

const IncomeDetailScreen: React.FC<IncomeDetailProps> = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const { transactions, deleteTransaction } = useAppStore();
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);

  const incomeId = route?.params?.incomeId;
  const income =
    transactions.find((t) => t.id === incomeId && t.type === 'income') ||
    transactions.find((t) => t.type === 'income')!;

  const formattedDate = new Date(income.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date(income.date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const handleEdit = () => {
    navigation?.navigate('EditTransaction', { transactionId: income.id });
  };

  const handleDelete = () => {
    setShowDeleteSheet(true);
  };

  const confirmDelete = () => {
    deleteTransaction(income.id);
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
        <View style={[styles.sheetIcon, { backgroundColor: '#FEE2E2' }]}>
          <Ionicons name="trash-outline" size={28} color="#DC2626" />
        </View>
        <Text style={[styles.sheetTitle, { color: colors.text }]}>
          Delete Income?
        </Text>
        <Text style={[styles.sheetDescription, { color: colors.textSecondary }]}>
          Are you sure you want to delete this income transaction? This action
          cannot be undone.
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

      <View
        style={[
          styles.header,
          { backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Income Details
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScreenScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#10B981' }]}>
            <Ionicons name="trending-up" size={32} color="#FFFFFF" />
          </View>
        </View>

        <Text style={[styles.amount, { color: '#10B981' }]}>
          +{formatCurrency(income.amount)}
        </Text>

        <Text style={[styles.title, { color: colors.text }]}>{income.title}</Text>

        <View style={styles.badgeRow}>
          <Badge label={income.subcategory || income.category} variant="success" />
          {income.isRecurring && <Badge label="Recurring" variant="info" />}
        </View>

        <Card variant="elevated" style={styles.detailCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Date & Time
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formattedDate} at {formattedTime}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="pricetag-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Source
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {income.subcategory || income.category}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="wallet-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Account
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {income.accountName}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="repeat-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Frequency
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {income.isRecurring ? 'Recurring' : 'One-time'}
            </Text>
          </View>
        </Card>

        {income.notes && (
          <Card variant="elevated" style={styles.detailCard}>
            <View style={styles.notesHeader}>
              <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
                Notes
              </Text>
            </View>
            <Text style={[styles.notesText, { color: colors.text }]}>
              {income.notes}
            </Text>
          </Card>
        )}
      </ScreenScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <Button
          title="Edit"
          onPress={handleEdit}
          variant="primary"
          icon={<Ionicons name="create-outline" size={18} color="#FFFFFF" />}
          style={styles.footerButton}
        />
        <Button
          title="Delete"
          onPress={handleDelete}
          variant="danger"
          icon={<Ionicons name="trash-outline" size={18} color="#FFFFFF" />}
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
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerRight: {
    width: 36,
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: 120,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.md,
  },
  amount: {
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -1,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  detailCard: {
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
    marginVertical: spacing.xs,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
  sheetContent: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  sheetIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  sheetDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.xxl,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  sheetButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  sheetButton: {
    flex: 1,
  },
});

export default IncomeDetailScreen;
