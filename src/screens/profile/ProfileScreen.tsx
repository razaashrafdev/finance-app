import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { ScreenScrollView } from '../../components/common/ScreenScroll';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { formatCurrency, formatDate } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';
import Avatar from '../../components/common/Avatar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import BottomSheet from '../../components/common/BottomSheet';
import { useToast } from '../../components/common/Toast';
import { useAppStore } from '../../store/AppStore';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const toast = useToast();
  const { user: userProfile, updateUser, changePassword } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [firstName, setFirstName] = useState(userProfile.firstName);
  const [lastName, setLastName] = useState(userProfile.lastName);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);

  const handleSave = async () => {
    if (!firstName.trim()) {
      toast.show('First name is required', 'error');
      return;
    }
    setLoading(true);
    try {
      await updateUser({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone });
      setIsEditing(false);
      toast.show('Profile updated successfully', 'success');
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Could not update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.show('Enter your current and new password', 'error');
      return;
    }
    if (newPassword.length < 6) {
      toast.show('New password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.show('Passwords do not match', 'error');
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setChangePasswordVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      toast.show('Password updated successfully', 'success');
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Could not update password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancel = () => {
    setFirstName(userProfile.firstName);
    setLastName(userProfile.lastName);
    setEmail(userProfile.email);
    setPhone(userProfile.phone);
    setIsEditing(false);
  };

  const memberSince = formatDate(userProfile.joinDate);

  const infoRows = [
    { label: 'First Name', value: firstName, setter: setFirstName, key: 'firstName' },
    { label: 'Last Name', value: lastName, setter: setLastName, key: 'lastName' },
    { label: 'Email', value: email, setter: setEmail, key: 'email' },
    { label: 'Phone', value: phone, setter: setPhone, key: 'phone' },
  ];

  const financialSummary = [
    { label: 'Monthly Income', value: userProfile.monthlyIncome, color: colors.positive },
    { label: 'Monthly Expenses', value: userProfile.monthlyExpenses, color: colors.negative },
    { label: 'Total Savings', value: userProfile.totalSavings, color: colors.primary },
    { label: 'Net Worth', value: userProfile.netWorth, color: colors.info },
  ];

  const quickLinks = [
    {
      label: 'Change Password',
      icon: 'lock-closed-outline',
      iconColor: '#6366F1',
      onPress: () => setChangePasswordVisible(true),
    },
    {
      label: 'Notification Preferences',
      icon: 'notifications-outline',
      iconColor: '#F59E0B',
      onPress: () => navigation.navigate('SettingsScreen'),
    },
    {
      label: 'Export My Data',
      icon: 'download-outline',
      iconColor: '#0EA5E9',
      onPress: () => toast.show('Export started', 'info'),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Avatar
              uri={userProfile.avatar}
              name={`${userProfile.firstName} ${userProfile.lastName}`}
              size={100}
            />
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {userProfile.firstName} {userProfile.lastName}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{userProfile.email}</Text>
          <Text style={[styles.memberSince, { color: colors.textTertiary }]}>
            Member since {memberSince}
          </Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>PERSONAL INFORMATION</Text>
            {!isEditing ? (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={[styles.editToggle, { color: colors.primary }]}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleCancel}>
                <Text style={[styles.editToggle, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {infoRows.map((row, index) => (
              <View
                key={row.key}
                style={[
                  styles.infoRow,
                  index < infoRows.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderLight || colors.border,
                  },
                ]}
              >
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{row.label}</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.infoInput, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                    value={row.value}
                    onChangeText={row.setter}
                    editable={isEditing}
                    placeholderTextColor={colors.textTertiary}
                  />
                ) : (
                  <Text style={[styles.infoValue, { color: colors.text }]}>{row.value}</Text>
                )}
              </View>
            ))}
          </View>
          {isEditing && (
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={loading}
              style={styles.saveButton}
            />
          )}
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>FINANCIAL SUMMARY</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {financialSummary.map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.infoRow,
                  index < financialSummary.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderLight || colors.border,
                  },
                ]}
              >
                <View style={styles.financialLabelRow}>
                  <View style={[styles.financialDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                </View>
                <Text style={[styles.financialValue, { color: colors.text }]}>
                  {formatCurrency(item.value)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>QUICK LINKS</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {quickLinks.map((link, index) => (
              <TouchableOpacity
                key={link.label}
                style={[
                  styles.menuItem,
                  index < quickLinks.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderLight || colors.border,
                  },
                ]}
                activeOpacity={0.6}
                onPress={link.onPress}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: link.iconColor + '15' }]}>
                  <Ionicons name={link.icon as any} size={20} color={link.iconColor} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.text }]}>{link.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScreenScrollView>

      {/* Change Password Bottom Sheet */}
      <BottomSheet
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
        title="Change Password"
      >
        <View style={styles.passwordContainer}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Current Password</Text>
          <TextInput
            style={[styles.passwordInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
            secureTextEntry
            placeholderTextColor={colors.textTertiary}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: spacing.lg }]}>
            New Password
          </Text>
          <TextInput
            style={[styles.passwordInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
            secureTextEntry
            placeholderTextColor={colors.textTertiary}
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: spacing.lg }]}>
            Confirm New Password
          </Text>
          <TextInput
            style={[styles.passwordInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
            secureTextEntry
            placeholderTextColor={colors.textTertiary}
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
          />

          <Button
            title="Update Password"
            loading={passwordLoading}
            onPress={handleChangePassword}
            style={styles.passwordButton}
          />
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
  avatarSection: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  memberSince: {
    fontSize: 13,
  },
  section: {
    marginTop: spacing.sectionGap,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  editToggle: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'right',
  },
  infoInput: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'right',
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 160,
  },
  financialLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  financialDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    marginTop: spacing.lg,
    width: '100%',
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
  passwordContainer: {
    paddingTop: spacing.sm,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
  },
  passwordButton: {
    marginTop: spacing.xxl,
    width: '100%',
  },
});

export default ProfileScreen;
