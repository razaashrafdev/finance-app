import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { ScreenScrollView } from '../../components/common/ScreenScroll';
import { Ionicons } from '@expo/vector-icons';
import AppLogo from '../../components/common/AppLogo';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/AppStore';

interface SignUpScreenProps {
  navigation: any;
}

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const { colors } = useTheme();
  const { signup, verifySignupCode, resendSignupCode } = useAppStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState('');

  const handleSignUp = async () => {
    if (!firstName.trim() || !email.trim() || !password) {
      setError('First name, email, and password are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreed) {
      setError('Agree to the Terms & Conditions to continue');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await signup({ firstName, lastName, email, password });
      if (result.needsVerification) {
        setVerificationSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const token = code.replace(/\s/g, '');
    if (!/^\d{6}$/.test(token)) {
      setError('Enter the 6-digit code from your email');
      return;
    }
    setVerifying(true);
    setError('');
    try {
      await verifySignupCode(email, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify the code');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError('');
    setNotice('');
    try {
      await resendSignupCode(email);
      setNotice('A new code is on its way.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend the code');
    } finally {
      setResending(false);
    }
  };

  if (verificationSent) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenScrollView
          contentContainerStyle={styles.verifyScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.verifyIconWrap, { backgroundColor: colors.primaryBg }]}>
            <View style={[styles.verifyIconInner, { backgroundColor: colors.primary }]}>
              <Ionicons name="keypad" size={32} color="#fff" />
            </View>
          </View>

          <Text style={[styles.verifyTitle, { color: colors.text }]}>Enter your code</Text>
          <Text style={[styles.verifySubtitle, { color: colors.textSecondary }]}>
            We sent a 6-digit code to your email. Your account is created when the code is confirmed.
          </Text>

          <View style={[styles.emailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emailIcon, { backgroundColor: colors.primaryBg }]}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.emailValue, { color: colors.text }]} numberOfLines={1}>
              {email.trim()}
            </Text>
          </View>

          <TextInput
            style={[
              styles.codeInput,
              {
                color: colors.text,
                backgroundColor: colors.card,
                borderColor: error ? colors.error : colors.border,
              },
            ]}
            value={code}
            onChangeText={(value) => {
              setCode(value.replace(/[^0-9]/g, '').slice(0, 6));
              setError('');
            }}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor={colors.textTertiary}
          />

          {error ? <Text style={[styles.codeError, { color: colors.error }]}>{error}</Text> : null}
          {notice ? <Text style={[styles.codeNotice, { color: colors.success }]}>{notice}</Text> : null}

          <TouchableOpacity
            style={[styles.signUpButton, styles.verifyButton, { backgroundColor: colors.primary }]}
            onPress={handleVerifyCode}
            disabled={verifying}
            activeOpacity={0.8}
          >
            {verifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.changeEmailButton}
            onPress={handleResendCode}
            disabled={resending}
          >
            <Text style={[styles.changeEmailText, { color: colors.primary }]}>
              {resending ? 'Sending...' : 'Resend code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.changeEmailButton}
            onPress={() => {
              setVerificationSent(false);
              setCode('');
              setError('');
              setNotice('');
            }}
          >
            <Text style={[styles.changeEmailText, { color: colors.textSecondary }]}>Use a different email</Text>
          </TouchableOpacity>
        </ScreenScrollView>
      </View>
    );
  }

  const renderInput = (
    label: string,
    value: string,
    onChange: (t: string) => void,
    _errorKey: string,
    icon: string,
    opts: {
      placeholder?: string;
      secure?: boolean;
      showToggle?: boolean;
      toggleValue?: boolean;
      onToggle?: () => void;
      keyboardType?: any;
    } = {}
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name={icon as any} size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={opts.placeholder || `Enter your ${label.toLowerCase()}`}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChange}
          secureTextEntry={opts.secure}
          keyboardType={opts.keyboardType}
          autoCapitalize="none"
        />
        {opts.showToggle && (
          <TouchableOpacity onPress={opts.onToggle}>
            <Ionicons
              name={opts.toggleValue ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <AppLogo size={64} />
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Start managing your finances
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              {renderInput('First Name', firstName, setFirstName, 'firstName', 'person-outline', {
                placeholder: 'John',
              })}
              {renderInput('Last Name', lastName, setLastName, 'lastName', 'person-outline', {
                placeholder: 'Doe',
              })}
            </View>

            {renderInput('Email', email, setEmail, 'email', 'mail-outline', {
              keyboardType: 'email-address',
            })}
            {renderInput('Password', password, setPassword, 'password', 'lock-closed-outline', {
              secure: !showPassword,
              showToggle: true,
              toggleValue: showPassword,
              onToggle: () => setShowPassword(!showPassword),
            })}
            {renderInput(
              'Confirm Password',
              confirmPassword,
              setConfirmPassword,
              'confirmPassword',
              'lock-closed-outline',
              {
                secure: !showConfirmPassword,
                showToggle: true,
                toggleValue: showConfirmPassword,
                onToggle: () => setShowConfirmPassword(!showConfirmPassword),
              }
            )}

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreed(!agreed)}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: agreed ? colors.primary : 'transparent',
                    borderColor: agreed ? colors.primary : colors.border,
                  },
                ]}
              >
                {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={[styles.checkboxText, { color: colors.textSecondary }]}>
                I agree to{' '}
                <Text style={{ color: colors.primary, fontWeight: '600' }}>
                  Terms & Conditions
                </Text>
              </Text>
            </TouchableOpacity>

            {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.signUpButton, { backgroundColor: colors.primary }]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signUpButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScreenScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
  },
  form: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    marginBottom: 16,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 14,
    flex: 1,
  },
  signUpButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  verifyScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  verifyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  verifyIconInner: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  verifySubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    gap: 12,
  },
  emailIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  codeInput: {
    height: 64,
    borderWidth: 1,
    borderRadius: 16,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 10,
    marginBottom: 12,
  },
  codeError: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  codeNotice: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepsCard: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 28,
    overflow: 'hidden',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  verifyButton: {
    marginBottom: 8,
  },
  changeEmailButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  changeEmailText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
