import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/AppStore';

export default function DriveConnectPrompt() {
  const { colors } = useTheme();
  const { driveSync, connectDrive } = useAppStore();

  if (driveSync.status !== 'not_connected' && driveSync.status !== 'reconnect_required') return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.warningLight || '#FEF3C7', borderColor: colors.warning || '#F59E0B' }]}>
      <Text style={[styles.title, { color: colors.text }]}>Connect Google Drive</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        Connect your Google Drive to save and sync your FinanceFlow data securely.
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary || '#4F46E5' }]}
        onPress={connectDrive}
      >
        <Text style={styles.buttonText}>Connect Drive</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  message: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});