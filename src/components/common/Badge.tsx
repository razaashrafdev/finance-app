import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
  style?: ViewStyle;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  style,
}) => {
  const { colors, isDark } = useTheme();

  const getVariantStyle = (): { backgroundColor: string; borderColor: string; textColor: string; dotColor: string } => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(79, 70, 229, 0.08)',
          borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(79, 70, 229, 0.22)',
          textColor: isDark ? '#A5B4FC' : colors.primary,
          dotColor: colors.primary,
        };
      case 'purple':
        return {
          backgroundColor: isDark ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.08)',
          borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.22)',
          textColor: isDark ? '#C4B5FD' : '#7C3AED',
          dotColor: '#8B5CF6',
        };
      case 'success':
        return {
          backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(22, 163, 74, 0.08)',
          borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(22, 163, 74, 0.22)',
          textColor: colors.success,
          dotColor: colors.success,
        };
      case 'warning':
        return {
          backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.08)',
          borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(217, 119, 6, 0.22)',
          textColor: colors.warning,
          dotColor: colors.warning,
        };
      case 'danger':
        return {
          backgroundColor: isDark ? 'rgba(248, 113, 113, 0.12)' : 'rgba(220, 38, 38, 0.08)',
          borderColor: isDark ? 'rgba(248, 113, 113, 0.3)' : 'rgba(220, 38, 38, 0.22)',
          textColor: colors.danger,
          dotColor: colors.danger,
        };
      case 'info':
        return {
          backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(37, 99, 235, 0.08)',
          borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(37, 99, 235, 0.22)',
          textColor: colors.info,
          dotColor: colors.info,
        };
      case 'neutral':
      default:
        return {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)',
          borderColor: colors.border,
          textColor: colors.textSecondary,
          dotColor: colors.textSecondary,
        };
    }
  };

  const { backgroundColor, borderColor, textColor, dotColor } = getVariantStyle();

  const sizeStyles: Record<string, ViewStyle> = {
    sm: {
      paddingVertical: 3,
      paddingHorizontal: 9,
    },
    md: {
      paddingVertical: 5,
      paddingHorizontal: 12,
    },
  };

  const textSizeStyles: Record<string, { fontSize: number }> = {
    sm: { fontSize: 11 },
    md: { fontSize: 12 },
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, borderColor, borderWidth: 1 },
        sizeStyles[size],
        style,
      ]}
    >
      {dot && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: dotColor,
              width: size === 'sm' ? 5 : 6,
              height: size === 'sm' ? 5 : 6,
              borderRadius: 3,
            },
          ]}
        />
      )}
      <Text style={[styles.label, { color: textColor }, textSizeStyles[size]]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    marginRight: 6,
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default Badge;
