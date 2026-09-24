import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
}) => {
  const { colors, isDark } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: colors.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.35 : 0.04,
        shadowRadius: 8,
        elevation: 2,
      },
      elevated: {
        backgroundColor: colors.card,
        borderColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(79, 70, 229, 0.12)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDark ? 0.45 : 0.08,
        shadowRadius: 16,
        elevation: 5,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
      },
    };

    return {
      ...base,
      ...variantStyles[variant],
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[getCardStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <React.Fragment>
      <TouchableOpacity
        activeOpacity={1}
        style={[getCardStyle(), style]}
        disabled
      >
        {children}
      </TouchableOpacity>
    </React.Fragment>
  );
};

export default Card;
