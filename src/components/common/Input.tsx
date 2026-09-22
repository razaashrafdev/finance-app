import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  secureTextEntry?: boolean;
  multiline?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  style?: ViewStyle;
  rightComponent?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  icon,
  secureTextEntry,
  multiline,
  keyboardType,
  style,
  rightComponent,
  ...rest
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: 12,
      borderWidth: 1.5,
      backgroundColor: colors.inputBackground || colors.background || '#F8F9FA',
      paddingHorizontal: 16,
      minHeight: 52,
    };

    if (error) {
      return {
        ...base,
        borderColor: colors.danger || '#FF3B30',
      };
    }

    if (isFocused) {
      return {
        ...base,
        borderColor: colors.primary,
      };
    }

    return {
      ...base,
      borderColor: colors.border || '#E5E5E5',
    };
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: colors.textSecondary || '#6B7280' },
          ]}
        >
          {label}
        </Text>
      )}
      <View style={getContainerStyle()}>
        <View style={styles.inputContainer}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary || '#9CA3AF'}
            secureTextEntry={secureTextEntry}
            multiline={multiline}
            keyboardType={keyboardType}
            style={[
              styles.input,
              {
                color: colors.text || '#1A1A1A',
                textAlignVertical: multiline ? 'center' : 'auto',
              },
              icon ? { paddingLeft: 0 } : null,
            ]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...rest}
          />
          {rightComponent && (
            <View style={styles.rightComponent}>{rightComponent}</View>
          )}
        </View>
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.danger || '#FF3B30' }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
  },
  rightComponent: {
    marginLeft: 12,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
});

export default Input;
