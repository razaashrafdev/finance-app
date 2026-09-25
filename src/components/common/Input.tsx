import React, { forwardRef, useCallback, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  StyleProp,
  TextStyle,
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
  /** Style for the outer wrapper (not the TextInput). */
  style?: StyleProp<ViewStyle>;
  /** Style for the TextInput itself. */
  inputStyle?: StyleProp<TextStyle>;
  rightComponent?: React.ReactNode;
}

const Input = forwardRef<TextInput, InputProps>(function Input(
  {
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
    inputStyle,
    rightComponent,
    returnKeyType,
    onSubmitEditing,
    onFocus,
    onBlur,
    blurOnSubmit,
    ...rest
  },
  ref
) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(
    (event: any) => {
      setIsFocused(true);
      onFocus?.(event);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (event: any) => {
      setIsFocused(false);
      onBlur?.(event);
    },
    [onBlur]
  );

  // Border color only — never change size/elevation on focus (that remounts layout
  // and can cascade focus to the next field under the finger).
  const borderColor = error
    ? colors.danger
    : isFocused
      ? colors.inputFocus
      : colors.inputBorder;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.inputBackground,
            borderColor,
          },
          multiline ? styles.containerMultiline : null,
        ]}
      >
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          style={[
            styles.input,
            {
              color: colors.text,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            multiline ? styles.inputMultiline : null,
            inputStyle,
          ]}
          {...rest}
          autoFocus={false}
          // Default false: Android otherwise advances focus to the next field on submit.
          blurOnSubmit={blurOnSubmit ?? false}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {rightComponent ? <View style={styles.rightComponent}>{rightComponent}</View> : null}
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
});

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
  container: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 10,
    minHeight: 100,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    margin: 0,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: 0,
    paddingBottom: 0,
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
