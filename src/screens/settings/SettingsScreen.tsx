import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/AppStore';
import { spacing, borderRadius } from '../../theme/spacing';
import Avatar from '../../components/common/Avatar';
import BottomSheet from '../../components/common/BottomSheet';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';

type IconName = keyof typeof Ionicons.glyphMap;

interface SettingsItem {
  id: string;
  label: string;
  icon: IconName;
  iconColor: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  danger?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { colors, isDark, mode, setMode } = useTheme();
  const { user: userProfile, logout } = useAppStore();
  const toast = useToast();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetTitle, setSheetTitle] = useState('');
  const [sheetContent, setSheetContent] = useState<React.ReactNode>(null);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [billReminders, setBillReminders] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [pinSheetVisible, setPinSheetVisible] = useState(false);
  const [appearanceSheetVisible, setAppearanceSheetVisible] = useState(false);
  const [confirmSheetVisible, setConfirmSheetVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'clear' | 'logout'>('clear');
  const [aboutSheetVisible, setAboutSheetVisible] = useState(false);
  const [faqSheetVisible, setFaqSheetVisible] = useState(false);

  const openSheet = (title: string, content: React.ReactNode) => {
    setSheetTitle(title);
    setSheetContent(content);
    setSheetVisible(true);
  };

  const sections: SettingsSection[] = [
    {
      title: 'Profile',
      items: [
        {
          id: 'profile',
          label: `${userProfile.firstName} ${userProfile.lastName}`,
          icon: 'person-outline',
          iconColor: '#4F46E5',
          value: userProfile.email,
          onPress: () => navigation.navigate('ProfileScreen'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'currency',
          label: 'Currency',
          icon: 'cash-outline',
          iconColor: '#10B981',
          value: 'USD ($)',
          onPress: () =>
            openSheet(
              'Currency',
              <View>
                {['USD ($)', 'EUR (€)', 'GBP (£)', 'JPY (¥)'].map((cur) => (
                  <TouchableOpacity
                    key={cur}
                    style={[styles.sheetOption, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setSheetVisible(false);
                      toast.show(`Currency set to ${cur}`, 'success');
                    }}
                  >
                    <Text style={[styles.sheetOptionText, { color: colors.text }]}>{cur}</Text>
                    {cur === 'USD ($)' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            ),
        },
        {
          id: 'appearance',
          label: 'Appearance',
          icon: 'color-palette-outline',
          iconColor: '#8B5CF6',
          value: mode === 'system' ? 'System' : mode === 'dark' ? 'Dark' : 'Light',
          onPress: () => setAppearanceSheetVisible(true),
        },
        {
          id: 'language',
          label: 'Language',
          icon: 'language-outline',
          iconColor: '#0EA5E9',
          value: 'English',
          onPress: () =>
            openSheet(
              'Language',
              <View>
                {['English', 'Spanish', 'French', 'German'].map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.sheetOption, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setSheetVisible(false);
                      toast.show(`Language set to ${lang}`, 'success');
                    }}
                  >
                    <Text style={[styles.sheetOptionText, { color: colors.text }]}>{lang}</Text>
                    {lang === 'English' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            ),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'push',
          label: 'Push Notifications',
          icon: 'notifications-outline',
          iconColor: '#EF4444',
          toggle: true,
          toggleValue: pushEnabled,
          onToggle: setPushEnabled,
        },
        {
          id: 'email',
          label: 'Email Notifications',
          icon: 'mail-outline',
          iconColor: '#3B82F6',
          toggle: true,
          toggleValue: emailEnabled,
          onToggle: setEmailEnabled,
        },
        {
          id: 'bill_reminders',
          label: 'Bill Reminders',
          icon: 'receipt-outline',
          iconColor: '#F59E0B',
          toggle: true,
          toggleValue: billReminders,
          onToggle: setBillReminders,
        },
        {
          id: 'budget_alerts',
          label: 'Budget Alerts',
          icon: 'alert-circle-outline',
          iconColor: '#F97316',
          toggle: true,
          toggleValue: budgetAlerts,
          onToggle: setBudgetAlerts,
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          id: 'pin',
          label: 'Change PIN',
          icon: 'lock-closed-outline',
          iconColor: '#6366F1',
          onPress: () => setPinSheetVisible(true),
        },
        {
          id: 'biometric',
          label: 'Biometric Lock',
          icon: 'finger-print-outline',
          iconColor: '#10B981',
          toggle: true,
          toggleValue: biometric,
          onToggle: setBiometric,
        },
        {
          id: 'twofactor',
          label: 'Two-Factor Auth',
          icon: 'shield-checkmark-outline',
          iconColor: '#8B5CF6',
          toggle: true,
          toggleValue: twoFactor,
          onToggle: setTwoFactor,
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          id: 'backup',
          label: 'Backup Data',
          icon: 'cloud-upload-outline',
          iconColor: '#06B6D4',
          value: 'Last backup: Today',
          onPress: () => toast.show('Backup completed successfully', 'success'),
        },
        {
          id: 'export',
          label: 'Export Data',
          icon: 'download-outline',
          iconColor: '#0EA5E9',
          onPress: () => toast.show('Export started', 'info'),
        },
        {
          id: 'accounts',
          label: 'Connected Accounts',
          icon: 'link-outline',
          iconColor: '#EC4899',
          onPress: () => navigation.navigate('AccountsScreen'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          label: 'Help & Support',
          icon: 'help-circle-outline',
          iconColor: '#3B82F6',
          onPress: () => setFaqSheetVisible(true),
        },
        {
          id: 'about',
          label: 'About',
          icon: 'information-circle-outline',
          iconColor: '#64748B',
          value: 'v2.1.0',
          onPress: () => setAboutSheetVisible(true),
        },
        {
          id: 'terms',
          label: 'Terms of Service',
          icon: 'document-text-outline',
          iconColor: '#9CA3AF',
          onPress: () =>
            openSheet(
              'Terms of Service',
              <Text style={[styles.sheetText, { color: colors.textSecondary }]}>
                These Terms of Service govern your use of FinanceApp. By using our application,
                you agree to be bound by these terms. FinanceApp provides personal finance
                management tools and is not a financial advisor. All financial decisions are your
                sole responsibility.
              </Text>
            ),
        },
        {
          id: 'privacy',
          label: 'Privacy Policy',
          icon: 'shield-outline',
          iconColor: '#9CA3AF',
          onPress: () =>
            openSheet(
              'Privacy Policy',
              <Text style={[styles.sheetText, { color: colors.textSecondary }]}>
                We respect your privacy. FinanceApp collects only the data necessary to provide
                our services. Your financial data is encrypted and stored securely. We do not
                sell or share your personal information with third parties for marketing purposes.
              </Text>
            ),
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          id: 'clear',
          label: 'Clear All Data',
          icon: 'trash-outline',
          iconColor: '#EF4444',
          onPress: () => {
            setConfirmAction('clear');
            setConfirmSheetVisible(true);
          },
          danger: true,
        },
        {
          id: 'logout',
          label: 'Logout',
          icon: 'log-out-outline',
          iconColor: '#EF4444',
          onPress: () => {
            setConfirmAction('logout');
            setConfirmSheetVisible(true);
          },
          danger: true,
        },
      ],
    },
  ];

  const renderProfileItem = (item: SettingsItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.profileItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.7}
      onPress={item.onPress}
    >
      <Avatar
        uri={userProfile.avatar}
        name={`${userProfile.firstName} ${userProfile.lastName}`}
        size={52}
      />
      <View style={styles.profileInfo}>
        <Text style={[styles.profileName, { color: colors.text }]}>{item.label}</Text>
        <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{item.value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
              {section.title.toUpperCase()}
            </Text>

            {section.title === 'Profile' ? (
              renderProfileItem(section.items[0])
            ) : (
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {section.items.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.menuItem,
                      index < section.items.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.borderLight || colors.border,
                      },
                    ]}
                    activeOpacity={item.toggle ? 1 : 0.6}
                    onPress={item.toggle ? undefined : item.onPress}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: item.iconColor + '15' }]}>
                      <Ionicons name={item.icon} size={20} color={item.iconColor} />
                    </View>
                    <Text
                      style={[
                        styles.menuLabel,
                        { color: item.danger ? colors.negative : colors.text },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <View style={styles.menuRight}>
                      {item.value && !item.toggle && (
                        <Text style={[styles.menuValue, { color: colors.textTertiary }]} numberOfLines={1}>
                          {item.value}
                        </Text>
                      )}
                      {item.toggle ? (
                        <Switch
                          value={item.toggleValue}
                          onValueChange={item.onToggle}
                          trackColor={{ false: colors.border, true: colors.primary + '50' }}
                          thumbColor={item.toggleValue ? colors.primary : colors.textTertiary}
                        />
                      ) : (
                        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Generic Bottom Sheet */}
      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} title={sheetTitle}>
        {sheetContent}
      </BottomSheet>

      {/* Appearance Bottom Sheet */}
      <BottomSheet
        visible={appearanceSheetVisible}
        onClose={() => setAppearanceSheetVisible(false)}
        title="Appearance"
      >
        {(['light', 'dark', 'system'] as const).map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.sheetOption, { borderBottomColor: colors.border }]}
            onPress={() => {
              setMode(opt);
              setAppearanceSheetVisible(false);
              toast.show(`Theme set to ${opt}`, 'success');
            }}
          >
            <Text style={[styles.sheetOptionText, { color: colors.text }]}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </Text>
            {mode === opt && <Ionicons name="checkmark" size={20} color={colors.primary} />}
          </TouchableOpacity>
        ))}
      </BottomSheet>

      {/* PIN Bottom Sheet */}
      <BottomSheet
        visible={pinSheetVisible}
        onClose={() => setPinSheetVisible(false)}
        title="Change PIN"
      >
        <View style={styles.pinContainer}>
          <Text style={[styles.pinLabel, { color: colors.textSecondary }]}>Enter new 4-digit PIN</Text>
          <View style={styles.pinDotsRow}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.pinDot, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]} />
            ))}
          </View>
          <Text style={[styles.pinLabel, { color: colors.textSecondary, marginTop: spacing.xl }]}>Confirm PIN</Text>
          <View style={styles.pinDotsRow}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.pinDot, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]} />
            ))}
          </View>
          <Button
            title="Update PIN"
            onPress={() => {
              setPinSheetVisible(false);
              toast.show('PIN updated successfully', 'success');
            }}
            style={styles.sheetButton}
          />
        </View>
      </BottomSheet>

      {/* Confirmation Bottom Sheet */}
      <BottomSheet
        visible={confirmSheetVisible}
        onClose={() => setConfirmSheetVisible(false)}
        title={confirmAction === 'clear' ? 'Clear All Data' : 'Logout'}
      >
        <View style={styles.confirmContainer}>
          <View style={[styles.confirmIconContainer, { backgroundColor: colors.negative + '15' }]}>
            <Ionicons
              name={confirmAction === 'clear' ? 'warning-outline' : 'log-out-outline'}
              size={40}
              color={colors.negative}
            />
          </View>
          <Text style={[styles.confirmTitle, { color: colors.text }]}>
            {confirmAction === 'clear' ? 'Clear All Data?' : 'Are you sure?'}
          </Text>
          <Text style={[styles.confirmMessage, { color: colors.textSecondary }]}>
            {confirmAction === 'clear'
              ? 'This will permanently delete all your data including transactions, budgets, and goals. This action cannot be undone.'
              : 'You will be logged out of your account. You can sign back in at any time.'}
          </Text>
          <View style={styles.confirmButtons}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setConfirmSheetVisible(false)}
              style={styles.confirmBtn}
            />
            <Button
              title={confirmAction === 'clear' ? 'Clear Data' : 'Logout'}
              variant="danger"
              onPress={() => {
                setConfirmSheetVisible(false);
                if (confirmAction === 'logout') {
                  logout();
                }
                toast.show(
                  confirmAction === 'clear' ? 'All data cleared' : 'Logged out successfully',
                  'success'
                );
              }}
              style={styles.confirmBtn}
            />
          </View>
        </View>
      </BottomSheet>

      {/* About Bottom Sheet */}
      <BottomSheet
        visible={aboutSheetVisible}
        onClose={() => setAboutSheetVisible(false)}
        title="About"
      >
        <View style={styles.aboutContainer}>
          <View style={[styles.aboutIconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="wallet-outline" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.aboutAppName, { color: colors.text }]}>FinanceApp</Text>
          <Text style={[styles.aboutVersion, { color: colors.textSecondary }]}>Version 2.1.0</Text>
          <Text style={[styles.aboutDescription, { color: colors.textSecondary }]}>
            Your personal finance companion. Track expenses, manage budgets, and achieve your
            financial goals.
          </Text>
        </View>
      </BottomSheet>

      {/* FAQ Bottom Sheet */}
      <BottomSheet
        visible={faqSheetVisible}
        onClose={() => setFaqSheetVisible(false)}
        title="Help & Support"
      >
        <View style={styles.faqContainer}>
          {[
            { q: 'How do I connect my bank account?', a: 'Go to Accounts > Add Account and follow the secure connection process.' },
            { q: 'How do I set up budgets?', a: 'Navigate to Budgets and tap the + button to create a new budget category.' },
            { q: 'Is my data secure?', a: 'Yes, we use bank-level encryption to protect all your data.' },
            { q: 'How do I export my data?', a: 'Go to Settings > Data > Export Data to download your information.' },
          ].map((faq, i) => (
            <View key={i} style={[styles.faqItem, i < 3 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.q}</Text>
              <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.a}</Text>
            </View>
          ))}
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
  section: {
    marginTop: spacing.sectionGap,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  sectionCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuValue: {
    fontSize: 14,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  sheetOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sheetText: {
    fontSize: 15,
    lineHeight: 24,
  },
  sheetButton: {
    marginTop: spacing.xxl,
    width: '100%',
  },
  pinContainer: {
    paddingTop: spacing.sm,
  },
  pinLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  pinDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  pinDot: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  confirmContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  confirmIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  confirmMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  confirmBtn: {
    flex: 1,
  },
  aboutContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  aboutIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  aboutAppName: {
    fontSize: 22,
    fontWeight: '800',
  },
  aboutVersion: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  aboutDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  faqContainer: {
    paddingTop: spacing.sm,
  },
  faqItem: {
    paddingVertical: spacing.md,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SettingsScreen;
