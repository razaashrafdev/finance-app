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
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: 14,
      borderWidth: 1,
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 16,
      minHeight: 50,
      justifyContent: 'center',
    };

    if (error) {
      return {
        ...base,
        borderColor: colors.danger,
      };
    }

    if (isFocused) {
      return {
        ...base,
        borderColor: colors.inputFocus,
        shadowColor: colors.inputFocus,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.12,
        shadowRadius: 8,
        elevation: 2,
      };
    }

    return {
      ...base,
      borderColor: colors.inputBorder,
    };
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: colors.textSecondary },
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
            placeholderTextColor={colors.textTertiary}
            secureTextEntry={secureTextEntry}
            multiline={multiline}
            keyboardType={keyboardType}
            style={[
              styles.input,
              {
                color: colors.text,
                textAlignVertical: multiline ? 'top' : 'center',
                minHeight: multiline ? 88 : undefined,
              },
              icon ? { paddingLeft: 0 } : null,
            ]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            blurOnSubmit={false}
            {...rest}
          />
          {rightComponent && (
            <View style={styles.rightComponent}>{rightComponent}</View>
          )}
        </View>
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.danger }]}>
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
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
    letterSpacing: 0.1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
  },
  rightComponent: {
    marginLeft: 10,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
});

export default Input;
