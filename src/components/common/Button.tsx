import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
}) => {
  const { colors } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const sizeStyles: Record<string, ViewStyle> = {
      sm: { paddingVertical: 8, paddingHorizontal: 16 },
      md: { paddingVertical: 12, paddingHorizontal: 24 },
      lg: { paddingVertical: 16, paddingHorizontal: 32 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: colors.primary,
      },
      secondary: {
        backgroundColor: colors.primaryLight || colors.primary + '20',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.border || colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      danger: {
        backgroundColor: colors.danger || '#FF3B30',
      },
    };

    return {
      ...base,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      sm: { fontSize: 14, fontWeight: '600' },
      md: { fontSize: 16, fontWeight: '600' },
      lg: { fontSize: 18, fontWeight: '700' },
    };

    const variantTextStyles: Record<string, TextStyle> = {
      primary: { color: '#FFFFFF' },
      secondary: { color: colors.primary },
      outline: { color: colors.text || '#1A1A1A' },
      ghost: { color: colors.primary },
      danger: { color: '#FFFFFF' },
    };

    return {
      ...sizeStyles[size],
      ...variantTextStyles[variant],
    };
  };

  const iconColor = variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.primary}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={[styles.icon, styles.iconLeft]}>{icon}</View>
          )}
          <Text style={getTextStyle()}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <View style={[styles.icon, styles.iconRight]}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginLeft: 8,
  },
  iconLeft: {
    marginLeft: 0,
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
    marginRight: 0,
  },
});

export default Button;
