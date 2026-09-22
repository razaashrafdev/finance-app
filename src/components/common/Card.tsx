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
  const { colors } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: 16,
      padding: 16,
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: colors.card || colors.background || '#FFFFFF',
      },
      elevated: {
        backgroundColor: colors.card || colors.background || '#FFFFFF',
        shadowColor: colors.text || '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border || '#E5E5E5',
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
        activeOpacity={0.7}
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
