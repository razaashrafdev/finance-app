import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { availableBanks, bankConnectionSteps } from '../../data/mockData';

interface BankVerificationScreenProps {
  navigation: any;
  route: {
    params: {
      bankId: string;
      bankName: string;
      bankColor: string;
    };
  };
}

const BankVerificationScreen: React.FC<BankVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, isDark } = useTheme();
  const { bankId, bankName, bankColor } = route.params;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const selectedBank = availableBanks.find((b) => b.id === bankId);
  const currentStep = 2;
  const totalSteps = bankConnectionSteps.length;

  const handleContinue = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      navigation.navigate('BankConsent', {
        bankId,
        bankName,
        bankColor,
      });
    }, 800);
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
          Verify Your Identity
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step Indicator */}
          <View style={styles.stepContainer}>
            <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
              Step {currentStep} of {totalSteps}
            </Text>
            <View style={[styles.stepBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.stepProgress,
                  {
                    backgroundColor: bankColor,
                    width: `${(currentStep / totalSteps) * 100}%`,
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
                {selectedBank?.name || bankName}
              </Text>
              <Text style={[styles.bankSubtitle, { color: colors.textSecondary }]}>
                Online Banking Login
              </Text>
            </View>
          </View>

          {/* Security Notice */}
          <View style={[styles.securityCard, { backgroundColor: colors.primaryBg }]}>
            <Ionicons name="lock-closed" size={20} color={colors.primary} />
            <Text style={[styles.securityText, { color: colors.primary }]}>
              Your credentials are encrypted and never stored on our servers
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Online Banking Username"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
              autoCorrect={false}
              icon={
                <Ionicons name="person-outline" size={20} color={colors.textTertiary} />
              }
            />

            <Input
              label="Online Banking Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              icon={
                <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />
              }
              rightComponent={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              }
            />

            {/* Remember Device Toggle */}
            <TouchableOpacity
              style={styles.toggleRow}
              activeOpacity={0.7}
              onPress={() => setRememberDevice(!rememberDevice)}
            >
              <View style={styles.toggleLeft}>
                <Ionicons
                  name={rememberDevice ? 'phone-portrait-outline' : 'phone-portrait-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={[styles.toggleLabel, { color: colors.text }]}>
                  Remember this device
                </Text>
              </View>
              <View
                style={[
                  styles.toggle,
                  {
                    backgroundColor: rememberDevice ? bankColor : colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    {
                      transform: [{ translateX: rememberDevice ? 20 : 0 }],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Button
            title={isVerifying ? 'Verifying...' : 'Continue'}
            onPress={handleContinue}
            variant="primary"
            size="lg"
            loading={isVerifying}
            disabled={isVerifying}
            style={{ backgroundColor: bankColor }}
          />
          <TouchableOpacity style={styles.helpLink} activeOpacity={0.7}>
            <Text style={[styles.helpText, { color: colors.textSecondary }]}>
              Need help?
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      <Modal transparent visible={isVerifying} animationType="fade">
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.overlayCard, { backgroundColor: colors.card }]}>
            <ActivityIndicator size="large" color={bankColor} />
            <Text style={[styles.overlayTitle, { color: colors.text }]}>
              Verifying Credentials
            </Text>
            <Text style={[styles.overlaySubtitle, { color: colors.textSecondary }]}>
              Securely connecting to {bankName}...
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
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
    marginBottom: spacing.lg,
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
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  form: {
    gap: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
  },
  helpLink: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    minWidth: 260,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.xl,
  },
  overlaySubtitle: {
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default BankVerificationScreen;
