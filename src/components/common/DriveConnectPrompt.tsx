import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/AppStore';
import Badge from './Badge';

export default function DriveConnectPrompt() {
  const { colors, isDark } = useTheme();
  const { driveSync, connectDrive } = useAppStore();

  if (driveSync.status !== 'not_connected' && driveSync.status !== 'reconnect_required') return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#121A2B' : '#FFFFFF',
          borderColor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(79, 70, 229, 0.18)',
          shadowColor: colors.primary,
          shadowOpacity: isDark ? 0.2 : 0.06,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: isDark ? 'rgba(34, 211, 238, 0.14)' : 'rgba(8, 145, 178, 0.1)',
              borderColor: isDark ? 'rgba(34, 211, 238, 0.3)' : 'rgba(8, 145, 178, 0.2)',
            },
          ]}
        >
          <Ionicons name="cloud-outline" size={22} color={isDark ? '#22D3EE' : '#0891B2'} />
        </View>
        <Badge label="Google Drive Sync" variant="info" dot size="sm" />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Your data under your control</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        Connect Google Drive to automatically sync your ledger into a dedicated, isolated folder on your personal Drive.
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        activeOpacity={0.85}
        onPress={connectDrive}
      >
        <Ionicons name="logo-google" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Connect Google Drive</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});