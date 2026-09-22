import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import BottomSheet from '../../components/common/BottomSheet';
import { useAppStore } from '../../store/AppStore';
import { useToast } from '../../components/common/Toast';

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking', icon: 'wallet-outline' as const },
  { value: 'savings', label: 'Savings', icon: 'save-outline' as const },
  { value: 'credit', label: 'Credit Card', icon: 'card-outline' as const },
  { value: 'cash', label: 'Cash', icon: 'cash-outline' as const },
  { value: 'investment', label: 'Investment', icon: 'trending-up-outline' as const },
  { value: 'digital_wallet', label: 'Digital Wallet', icon: 'phone-portrait-outline' as const },
];

interface AddAccountScreenProps {
  navigation: any;
}

const AddAccountScreen: React.FC<AddAccountScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { addAccount } = useAppStore();
  const toast = useToast();
  const [showManualSheet, setShowManualSheet] = useState(false);
  const [showTypeSheet, setShowTypeSheet] = useState(false);

  // Manual form state
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [currency] = useState('USD');
  const [notes, setNotes] = useState('');

  const selectedType = ACCOUNT_TYPES.find((t) => t.value === accountType);

  const handleSaveManual = () => {
    addAccount({
      name: accountName.trim() || 'New Account',
      type: accountType || 'checking',
      balance: parseFloat(initialBalance) || 0,
      currency,
      institution: 'Manual',
    });
    setShowManualSheet(false);
    toast.show('Account added', 'success');
    navigation.goBack();
  };

  const handleResetForm = () => {
    setAccountName('');
    setAccountType('');
    setInitialBalance('');
    setNotes('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Option - Connect Bank */}
        <TouchableOpacity
          style={[styles.heroCard, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('BankSelection')}
        >
          <View style={styles.heroTop}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="link-outline" size={32} color="#FFFFFF" />
            </View>
            <Badge label="Recommended" variant="info" size="sm" />
          </View>
          <Text style={styles.heroTitle}>Connect Bank Account</Text>
          <Text style={styles.heroDescription}>
            Securely link your bank to automatically sync transactions
          </Text>
          <View style={styles.heroFooter}>
            <View style={styles.heroFeature}>
              <Ionicons name="shield-checkmark-outline" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroFeatureText}>256-bit encryption</Text>
            </View>
            <View style={styles.heroFeature}>
              <Ionicons name="sync-outline" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroFeatureText}>Auto-sync</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Secondary Option - Manual */}
        <TouchableOpacity
          style={[styles.manualCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.7}
          onPress={() => {
            handleResetForm();
            setShowManualSheet(true);
          }}
        >
          <View style={[styles.manualIconContainer, { backgroundColor: colors.primary + '10' }]}>
            <Ionicons name="create-outline" size={28} color={colors.primary} />
          </View>
          <View style={styles.manualTextContainer}>
            <Text style={[styles.manualTitle, { color: colors.text }]}>
              Add Account Manually
            </Text>
            <Text style={[styles.manualDescription, { color: colors.textSecondary }]}>
              Enter account details without bank linking
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={[styles.infoCard, { backgroundColor: colors.primaryBg }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.primary }]}>
              Connected accounts automatically sync your transactions and keep your balances up to date.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Manual Account Bottom Sheet */}
      <BottomSheet
        visible={showManualSheet}
        onClose={() => setShowManualSheet(false)}
        title="Add Account Manually"
      >
        <View style={styles.sheetContent}>
          <Input
            label="Account Name"
            value={accountName}
            onChangeText={setAccountName}
            placeholder="e.g., My Checking"
            icon={<Ionicons name="text-outline" size={20} color={colors.textTertiary} />}
          />

          <TouchableOpacity
            style={[styles.typeSelector, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => setShowTypeSheet(true)}
          >
            <Text style={[styles.typeLabel, { color: colors.textSecondary }]}>Account Type</Text>
            <View style={styles.typeValueRow}>
              {selectedType ? (
                <View style={styles.typeSelected}>
                  <Ionicons name={selectedType.icon} size={18} color={colors.primary} />
                  <Text style={[styles.typeSelectedText, { color: colors.text }]}>
                    {selectedType.label}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.typePlaceholder, { color: colors.textTertiary }]}>
                  Select type
                </Text>
              )}
              <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          <Input
            label="Initial Balance"
            value={initialBalance}
            onChangeText={setInitialBalance}
            placeholder="0.00"
            keyboardType="numeric"
            icon={<Text style={[styles.dollarSign, { color: colors.textTertiary }]}>$</Text>}
          />

          <View style={styles.currencyRow}>
            <Text style={[styles.currencyLabel, { color: colors.textSecondary }]}>Currency</Text>
            <View style={[styles.currencyBadge, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.currencyCode, { color: colors.primary }]}>{currency}</Text>
            </View>
          </View>

          <Input
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes..."
            multiline
            icon={<Ionicons name="document-text-outline" size={20} color={colors.textTertiary} />}
          />

          <View style={styles.sheetActions}>
            <Button
              title="Save Account"
              onPress={handleSaveManual}
              variant="primary"
              size="lg"
              style={styles.saveButton}
            />
            <Button
              title="Cancel"
              onPress={() => setShowManualSheet(false)}
              variant="ghost"
              size="md"
            />
          </View>
        </View>
      </BottomSheet>

      {/* Account Type Bottom Sheet */}
      <BottomSheet
        visible={showTypeSheet}
        onClose={() => setShowTypeSheet(false)}
        title="Select Account Type"
      >
        <View style={styles.sheetContent}>
          {ACCOUNT_TYPES.map((type) => {
            const isSelected = accountType === type.value;
            return (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeOption,
                  {
                    backgroundColor: isSelected ? colors.primary + '15' : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  setAccountType(type.value);
                  setShowTypeSheet(false);
                }}
              >
                <View
                  style={[
                    styles.typeOptionIcon,
                    { backgroundColor: isSelected ? colors.primary + '20' : colors.inputBg },
                  ]}
                >
                  <Ionicons
                    name={type.icon}
                    size={22}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                </View>
                <Text
                  style={[
                    styles.typeOptionText,
                    { color: isSelected ? colors.primary : colors.text },
                  ]}
                >
                  {type.label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheet>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  heroCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  heroDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  heroFooter: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  heroFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroFeatureText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xxl,
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
    marginHorizontal: spacing.md,
  },
  manualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  manualIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  manualTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  manualDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  infoSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
  infoCard: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  sheetContent: {
    gap: spacing.sm,
  },
  typeSelector: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeSelectedText: {
    fontSize: 16,
    fontWeight: '500',
  },
  typePlaceholder: {
    fontSize: 16,
  },
  dollarSign: {
    fontSize: 16,
    fontWeight: '600',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  currencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '700',
  },
  sheetActions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  saveButton: {
    marginBottom: spacing.sm,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  typeOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.md,
  },
});

export default AddAccountScreen;
