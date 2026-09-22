import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppLogo from '../../components/common/AppLogo';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/AppStore';

interface SignUpScreenProps {
  navigation: any;
}

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const { colors } = useTheme();
  const { signup } = useAppStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    signup({ firstName, lastName, email, password });
    setLoading(false);
  };

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
        <ScrollView
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
        </ScrollView>
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
});
