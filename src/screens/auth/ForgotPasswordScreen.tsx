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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error] = useState('');

  const handleSend = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContent}>
          <View style={[styles.successIcon, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="checkmark-circle" size={72} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Check your email</Text>
          <Text style={[styles.successDescription, { color: colors.textSecondary }]}>
            We've sent password reset instructions to{'\n'}
            <Text style={{ fontWeight: '600', color: colors.text }}>{email}</Text>
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => {
              setSent(false);
              setEmail('');
            }}
          >
            <Text style={[styles.resendText, { color: colors.primary }]}>
              Try a different email
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="key-outline" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter your email to receive reset instructions
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.card,
                    borderColor: error ? colors.error : colors.border,
                  },
                ]}
              >
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleSend}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backToLoginText, { color: colors.primary }]}>
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: 0,
  },
  inputGroup: {
    marginBottom: 24,
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
    marginTop: 6,
    marginLeft: 4,
  },
  primaryButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLogin: {
    alignItems: 'center',
    marginTop: 28,
  },
  backToLoginText: {
    fontSize: 15,
    fontWeight: '500',
  },
  // Success state
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  successDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
  },
  resendButton: {
    marginTop: 16,
  },
  resendText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
