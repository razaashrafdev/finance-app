import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'sm',
  style,
}) => {
  const { colors } = useTheme();

  const getVariantStyle = (): { backgroundColor: string; textColor: string } => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: (colors.success || '#10B981') + '15',
          textColor: colors.success || '#10B981',
        };
      case 'warning':
        return {
          backgroundColor: (colors.warning || '#F59E0B') + '15',
          textColor: colors.warning || '#F59E0B',
        };
      case 'danger':
        return {
          backgroundColor: (colors.danger || '#EF4444') + '15',
          textColor: colors.danger || '#EF4444',
        };
      case 'info':
        return {
          backgroundColor: (colors.info || '#3B82F6') + '15',
          textColor: colors.info || '#3B82F6',
        };
      case 'neutral':
      default:
        return {
          backgroundColor: colors.border || '#E5E5E5',
          textColor: colors.textSecondary || '#6B7280',
        };
    }
  };

  const { backgroundColor, textColor } = getVariantStyle();

  const sizeStyles: Record<string, ViewStyle> = {
    sm: {
      paddingVertical: 4,
      paddingHorizontal: 10,
    },
    md: {
      paddingVertical: 6,
      paddingHorizontal: 14,
    },
  };

  const textSizeStyles: Record<string, { fontSize: number }> = {
    sm: { fontSize: 11 },
    md: { fontSize: 13 },
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        sizeStyles[size],
        style,
      ]}
    >
      <Text style={[styles.label, { color: textColor }, textSizeStyles[size]]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Badge;
