import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Animated
} from 'react-native';
import { ScreenScrollView } from '../../components/common/ScreenScroll';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { formatCurrency, formatDate } from '../../utils/format';
import { spacing, borderRadius, shadow } from '../../theme/spacing';
import Badge from '../../components/common/Badge';
import BottomSheet from '../../components/common/BottomSheet';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useAppStore } from '../../store/AppStore';
import { toIonicon } from '../../utils/icons';

interface AddTransferProps {
  navigation?: {
    goBack: () => void;
  };
}

const AddTransferScreen: React.FC<AddTransferProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { accounts, addTransfer } = useAppStore();

  const [fromAccountId, setFromAccountId] = useState<string | null>(null);
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showFromSheet, setShowFromSheet] = useState(false);
  const [showToSheet, setShowToSheet] = useState(false);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    amount?: string;
    from?: string;
    to?: string;
  }>({});

  const checkAnim = useRef(new Animated.Value(0)).current;

  const fromAccount = accounts.find((a) => a.id === fromAccountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);

  const availableToAccounts = accounts.filter((a) => a.id !== fromAccountId);
  const availableFromAccounts = accounts.filter((a) => a.id !== toAccountId);

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleTransferNow = () => {
    setShowConfirmSheet(true);
  };

  const handleConfirmTransfer = () => {
    addTransfer(fromAccountId || undefined, toAccountId || undefined, amount, notes);
    setShowConfirmSheet(false);
    setShowSuccess(true);

    Animated.sequence([
      Animated.timing(checkAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDone = () => {
    setShowSuccess(false);
    checkAnim.setValue(0);
    navigation?.goBack();
  };

  const handleSwapAccounts = () => {
    if (fromAccountId && toAccountId) {
      setFromAccountId(toAccountId);
      setToAccountId(fromAccountId);
      setErrors({});
    }
  };

  const renderAccountOption = (
    account: (typeof accounts)[0],
    selected: boolean,
    onSelect: () => void
  ) => (
    <TouchableOpacity
      key={account.id}
      style={[
        styles.sheetOption,
        {
          backgroundColor: selected
            ? colors.primary + '20'
            : colors.card || colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.sheetOptionIcon,
          { backgroundColor: account.color + '15' },
        ]}
      >
        <Ionicons
          name={toIonicon(account.icon)}
          size={20}
          color={account.color}
        />
      </View>
      <View style={styles.sheetOptionInfo}>
        <Text
          style={[
            styles.sheetOptionName,
            {
              color: selected ? colors.primary : colors.text,
              fontWeight: selected ? '700' : '600',
            },
          ]}
        >
          {account.name}
        </Text>
        <Text style={[styles.sheetOptionBalance, { color: colors.textSecondary }]}>
          {formatCurrency(account.balance)}
        </Text>
      </View>
      {selected && (
        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  const renderFromSheet = () => (
    <BottomSheet
      visible={showFromSheet}
      onClose={() => setShowFromSheet(false)}
      title="Transfer From"
    >
      <View style={styles.sheetContent}>
        {availableFromAccounts.map((account) =>
          renderAccountOption(account, account.id === fromAccountId, () => {
            setFromAccountId(account.id);
            if (account.id === toAccountId) {
              setToAccountId(null);
            }
            setShowFromSheet(false);
            setErrors((prev) => ({ ...prev, from: undefined }));
          })
        )}
      </View>
    </BottomSheet>
  );

  const renderToSheet = () => (
    <BottomSheet
      visible={showToSheet}
      onClose={() => setShowToSheet(false)}
      title="Transfer To"
    >
      <View style={styles.sheetContent}>
        {availableToAccounts.map((account) =>
          renderAccountOption(account, account.id === toAccountId, () => {
            setToAccountId(account.id);
            setShowToSheet(false);
            setErrors((prev) => ({ ...prev, to: undefined }));
          })
        )}
      </View>
    </BottomSheet>
  );

  const renderConfirmSheet = () => (
    <BottomSheet
      visible={showConfirmSheet}
      onClose={() => setShowConfirmSheet(false)}
      title="Confirm Transfer"
    >
      <View style={styles.sheetContent}>
        <Text style={[styles.confirmAmount, { color: colors.primary }]}>
          {formatCurrency(parseFloat(amount))}
        </Text>

        <View style={[styles.confirmCard, { backgroundColor: colors.inputBg || colors.background }]}>
          <View style={styles.confirmRow}>
            <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
              From
            </Text>
            <Text style={[styles.confirmValue, { color: colors.text }]}>
              {fromAccount?.name}
            </Text>
          </View>
          <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />
          <View style={styles.confirmRow}>
            <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
              To
            </Text>
            <Text style={[styles.confirmValue, { color: colors.text }]}>
              {toAccount?.name}
            </Text>
          </View>
          <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />
          <View style={styles.confirmRow}>
            <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
              Date
            </Text>
            <Text style={[styles.confirmValue, { color: colors.text }]}>
              {formattedDate}
            </Text>
          </View>
          <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />
          <View style={styles.confirmRow}>
            <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
              Fee
            </Text>
            <Badge label="Free" variant="success" />
          </View>
          {notes ? (
            <>
              <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />
              <View style={styles.confirmRow}>
                <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
                  Notes
                </Text>
                <Text
                  style={[styles.confirmValue, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {notes}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.sheetButtons}>
          <Button
            title="Cancel"
            onPress={() => setShowConfirmSheet(false)}
            variant="outline"
            style={styles.sheetButton}
          />
          <Button
            title="Confirm"
            onPress={handleConfirmTransfer}
            variant="primary"
            style={styles.sheetButton}
          />
        </View>
      </View>
    </BottomSheet>
  );

  const renderSuccess = () => (
    <View
      style={[
        styles.successOverlay,
        { backgroundColor: colors.background },
      ]}
    >
      <Animated.View
        style={[
          styles.successCheck,
          {
            backgroundColor: '#DCFCE7',
            transform: [
              {
                scale: checkAnim.interpolate({
                  inputRange: [0, 0.6, 1],
                  outputRange: [0.3, 1.15, 1],
                }),
              },
            ],
            opacity: checkAnim,
          },
        ]}
      >
        <Ionicons name="checkmark" size={56} color="#10B981" />
      </Animated.View>

      <Animated.Text
        style={[
          styles.successTitle,
          { color: colors.text, opacity: checkAnim },
        ]}
      >
        Transfer Successful!
      </Animated.Text>

      <Animated.View style={{ opacity: checkAnim }}>
        <Text style={[styles.successAmount, { color: colors.primary }]}>
          {formatCurrency(parseFloat(amount))}
        </Text>

        <View style={styles.successRoute}>
          <View style={[styles.successAccount, { backgroundColor: colors.card }]}>
            <Ionicons
              name={toIonicon(fromAccount?.icon) || 'wallet-outline'}
              size={18}
              color={fromAccount?.color}
            />
            <Text style={[styles.successAccountName, { color: colors.text }]}>
              {fromAccount?.name}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
          <View style={[styles.successAccount, { backgroundColor: colors.card }]}>
            <Ionicons
              name={toIonicon(toAccount?.icon) || 'wallet-outline'}
              size={18}
              color={toAccount?.color}
            />
            <Text style={[styles.successAccountName, { color: colors.text }]}>
              {toAccount?.name}
            </Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.successButtonWrap, { opacity: checkAnim }]}>
        <Button
          title="Done"
          onPress={handleDone}
          variant="primary"
          style={styles.successButton}
        />
      </Animated.View>
    </View>
  );

  if (showSuccess) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        {renderSuccess()}
      </View>
    );
  }

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
          Transfer Money
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScreenScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.amountContainer}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
            Amount
          </Text>
          <View style={styles.amountInputRow}>
            <Text style={[styles.currencySymbol, { color: colors.text }]}>$</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={amount}
              onChangeText={(text) => {
                setAmount(text.replace(/[^0-9.]/g, ''));
                setErrors((prev) => ({ ...prev, amount: undefined }));
              }}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              autoFocus
            />
          </View>
          {errors.amount && (
            <Text style={styles.errorText}>{errors.amount}</Text>
          )}
        </View>

        <View style={styles.accountsSection}>
          <View style={styles.accountColumn}>
            <Text style={[styles.accountLabel, { color: colors.textSecondary }]}>
              From
            </Text>
            <TouchableOpacity
              style={[
                styles.accountSelector,
                {
                  backgroundColor: colors.card,
                  borderColor: errors.from ? '#EF4444' : colors.border,
                },
              ]}
              onPress={() => setShowFromSheet(true)}
              activeOpacity={0.7}
            >
              {fromAccount ? (
                <View style={styles.accountSelected}>
                  <View
                    style={[
                      styles.accountIcon,
                      { backgroundColor: fromAccount.color + '15' },
                    ]}
                  >
                    <Ionicons
                      name={toIonicon(fromAccount.icon)}
                      size={18}
                      color={fromAccount.color}
                    />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text
                      style={[styles.accountName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {fromAccount.name}
                    </Text>
                    <Text
                      style={[styles.accountBalance, { color: colors.textSecondary }]}
                    >
                      {formatCurrency(fromAccount.balance)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={[styles.accountPlaceholder, { color: colors.textTertiary }]}>
                  Select account
                </Text>
              )}
              <Ionicons
                name="chevron-down"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            {errors.from && <Text style={styles.errorText}>{errors.from}</Text>}
          </View>

          <TouchableOpacity
            style={[
              styles.swapButton,
              { backgroundColor: colors.primary, ...shadow.sm },
            ]}
            onPress={handleSwapAccounts}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-vertical" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.accountColumn}>
            <Text style={[styles.accountLabel, { color: colors.textSecondary }]}>
              To
            </Text>
            <TouchableOpacity
              style={[
                styles.accountSelector,
                {
                  backgroundColor: colors.card,
                  borderColor: errors.to ? '#EF4444' : colors.border,
                },
              ]}
              onPress={() => setShowToSheet(true)}
              activeOpacity={0.7}
            >
              {toAccount ? (
                <View style={styles.accountSelected}>
                  <View
                    style={[
                      styles.accountIcon,
                      { backgroundColor: toAccount.color + '15' },
                    ]}
                  >
                    <Ionicons
                      name={toIonicon(toAccount.icon)}
                      size={18}
                      color={toAccount.color}
                    />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text
                      style={[styles.accountName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {toAccount.name}
                    </Text>
                    <Text
                      style={[styles.accountBalance, { color: colors.textSecondary }]}
                    >
                      {formatCurrency(toAccount.balance)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={[styles.accountPlaceholder, { color: colors.textTertiary }]}>
                  Select account
                </Text>
              )}
              <Ionicons
                name="chevron-down"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            {errors.to && <Text style={styles.errorText}>{errors.to}</Text>}
          </View>
        </View>

        <View style={styles.feeRow}>
          <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>
            Transfer Fee
          </Text>
          <Badge label="Free" variant="success" />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Date</Text>
          <View
            style={[
              styles.dateDisplay,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {formattedDate}
            </Text>
          </View>
        </View>

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
            placeholder="Add a note (optional)"
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScreenScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <Button
          title="Transfer Now"
          onPress={handleTransferNow}
          variant="primary"
          icon={<Ionicons name="send-outline" size={18} color="#FFFFFF" />}
          style={styles.transferButton}
        />
      </View>

      {renderFromSheet()}
      {renderToSheet()}
      {renderConfirmSheet()}
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
  amountContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    paddingVertical: spacing.xl,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '300',
    marginRight: spacing.xs,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '800',
    minWidth: 120,
    letterSpacing: -1,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  accountsSection: {
    marginBottom: spacing.xxl,
  },
  accountColumn: {
    marginBottom: spacing.md,
  },
  accountLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accountSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
  },
  accountSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
  },
  accountBalance: {
    fontSize: 13,
    marginTop: 2,
  },
  accountPlaceholder: {
    fontSize: 15,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: spacing.xs,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#F0FDF4',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xxl,
  },
  feeLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500',
  },
  notesInput: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.screenPadding,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
  },
  transferButton: {
    width: '100%',
  },
  sheetContent: {
    padding: spacing.lg,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
  },
  sheetOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  sheetOptionInfo: {
    flex: 1,
  },
  sheetOptionName: {
    fontSize: 15,
    fontWeight: '600',
  },
  sheetOptionBalance: {
    fontSize: 13,
    marginTop: 2,
  },
  confirmAmount: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xxl,
    letterSpacing: -1,
  },
  confirmCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  confirmLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmValue: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  confirmDivider: {
    height: 1,
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  sheetButton: {
    flex: 1,
  },
  successOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.screenPadding,
  },
  successCheck: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: spacing.lg,
    letterSpacing: 0.3,
  },
  successAmount: {
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xxl,
    letterSpacing: -1,
  },
  successRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },
  successAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  successAccountName: {
    fontSize: 14,
    fontWeight: '600',
  },
  successButtonWrap: {
    width: '100%',
    paddingHorizontal: spacing.xxl,
  },
  successButton: {
    width: '100%',
  },
});

export default AddTransferScreen;
