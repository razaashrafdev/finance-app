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

interface BankConsentScreenProps {
  navigation: any;
  route: {
    params: {
      bankId: string;
      bankName: string;
      bankColor: string;
    };
  };
}

const permissions = [
  {
    icon: 'wallet-outline' as const,
    title: 'Account balances and details',
    description: 'View your account types, balances, and account numbers',
    allowed: true,
  },
  {
    icon: 'list-outline' as const,
    title: 'Transaction history',
    description: 'Access your recent transactions and spending patterns',
    allowed: true,
  },
  {
    icon: 'person-outline' as const,
    title: 'Account holder name',
    description: 'Verify the name on the account for accurate tracking',
    allowed: true,
  },
  {
    icon: 'swap-horizontal-outline' as const,
    title: 'Cannot make transfers or payments',
    description: 'We will never initiate any moves of your money',
    allowed: false,
  },
  {
    icon: 'create-outline' as const,
    title: 'Cannot modify your account',
    description: 'No changes can be made to your account settings',
    allowed: false,
  },
];

const BankConsentScreen: React.FC<BankConsentScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, isDark } = useTheme();
  const { bankId, bankName, bankColor } = route.params;

  const [consented, setConsented] = useState(false);

  const handleAllowAccess = () => {
    navigation.navigate('BankConnecting', {
      bankId,
      bankName,
      bankColor,
    });
  };

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
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Grant Access
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Indicator */}
        <View style={styles.stepContainer}>
          <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
            Step 3 of 5
          </Text>
          <View style={[styles.stepBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.stepProgress,
                {
                  backgroundColor: bankColor,
                  width: '60%',
                },
              ]}
            />
          </View>
        </View>

        {/* Bank Info Card */}
        <View
          style={[
            styles.bankCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.bankIcon, { backgroundColor: bankColor + '18' }]}>
            <Ionicons name="business" size={28} color={bankColor} />
          </View>
          <View style={styles.bankInfo}>
            <Text style={[styles.bankName, { color: colors.text }]}>
              {bankName}
            </Text>
            <Text style={[styles.bankSubtitle, { color: colors.textSecondary }]}>
              Ready to connect
            </Text>
          </View>
        </View>

        {/* What We'll Access */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          What we'll access
        </Text>
        <View
          style={[
            styles.permissionsCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {permissions.map((permission, index) => (
            <View
              key={permission.title}
              style={[
                styles.permissionRow,
                index < permissions.length - 1 && {
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.permissionIcon,
                  {
                    backgroundColor: permission.allowed
                      ? colors.positive + '18'
                      : colors.textTertiary + '18',
                  },
                ]}
              >
                <Ionicons
                  name={permission.icon}
                  size={18}
                  color={permission.allowed ? colors.positive : colors.textTertiary}
                />
              </View>
              <View style={styles.permissionContent}>
                <Text
                  style={[
                    styles.permissionTitle,
                    {
                      color: permission.allowed ? colors.text : colors.textTertiary,
                      textDecorationLine: permission.allowed ? 'none' : 'line-through',
                    },
                  ]}
                >
                  {permission.title}
                </Text>
                <Text
                  style={[
                    styles.permissionDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {permission.description}
                </Text>
              </View>
              <Ionicons
                name={permission.allowed ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={permission.allowed ? colors.positive : colors.textTertiary}
              />
            </View>
          ))}
        </View>

        {/* Security Badges */}
        <View style={styles.securitySection}>
          <View style={[styles.securityBadge, { backgroundColor: colors.primaryBg }]}>
            <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
            <Text style={[styles.securityBadgeText, { color: colors.primary }]}>
              256-bit encryption
            </Text>
          </View>
          <View style={[styles.securityBadge, { backgroundColor: colors.positiveLight }]}>
            <Ionicons name="eye-off" size={18} color={colors.positive} />
            <Text style={[styles.securityBadgeText, { color: colors.positive }]}>
              Read-only access
            </Text>
          </View>
          <View style={[styles.securityBadge, { backgroundColor: colors.warningLight }]}>
            <Ionicons name="link-outline" size={18} color={colors.warning} />
            <Text style={[styles.securityBadgeText, { color: colors.warning }]}>
              Disconnect anytime
            </Text>
          </View>
        </View>

        {/* Consent Checkbox */}
        <TouchableOpacity
          style={styles.consentRow}
          activeOpacity={0.7}
          onPress={() => setConsented(!consented)}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: consented ? bankColor : 'transparent',
                borderColor: consented ? bankColor : colors.border,
              },
            ]}
          >
            {consented && (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            )}
          </View>
          <Text style={[styles.consentText, { color: colors.text }]}>
            I authorize FinanceFlow to access my account data in read-only mode
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <Button
          title="Allow Access"
          onPress={handleAllowAccess}
          variant="primary"
          size="lg"
          disabled={false}
          style={{ backgroundColor: bankColor }}
        />
        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 40,
  },
  stepContainer: {
    marginBottom: spacing.xxl,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  stepBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  stepProgress: {
    height: '100%',
    borderRadius: 2,
  },
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.xxl,
  },
  bankIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 18,
    fontWeight: '700',
  },
  bankSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  permissionsCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.xxl,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  permissionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  permissionContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  securitySection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  securityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  consentText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default BankConsentScreen;
