import React, { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onPasswordToggle?: () => void;
}

export default function FormInput({
  label,
  error,
  showPasswordToggle = false,
  isPasswordVisible = false,
  onPasswordToggle,
  style,
  ...props
}: FormInputProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        inputGroup: {
          gap: 12,
        },
        inputLabel: {
          color: colors.text,
          fontSize: 14,
          fontWeight: '500',
          fontFamily: 'ManropeMedium',
        },
        inputContainer: {
          position: 'relative',
        },
        input: {
          height: 48,
          backgroundColor: colors.inputBackground,
          borderRadius: 24,
          paddingHorizontal: 16,
          fontSize: 16,
          color: colors.text,
          fontFamily: 'ManropeRegular',
        },
        inputWithIcon: {
          paddingRight: 50,
        },
        inputError: {
          borderWidth: 1,
          borderColor: '#FF6B6B',
        },
        passwordToggle: {
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: [{ translateY: -10 }],
        },
        errorText: {
          color: '#FF6B6B',
          fontSize: 12,
          marginTop: 4,
          marginLeft: 8,
          fontFamily: 'ManropeRegular',
        },
      }),
    [colors, isDark]
  );

  return (
    <View style={themedStyles.inputGroup}>
      <Text style={themedStyles.inputLabel}>{label}</Text>
      <View style={themedStyles.inputContainer}>
        <TextInput
          style={[themedStyles.input, showPasswordToggle && themedStyles.inputWithIcon, error && themedStyles.inputError, style]}
          secureTextEntry={showPasswordToggle && !isPasswordVisible}
          placeholderTextColor={colors.textMuted}
          {...props}
        />
        {showPasswordToggle && (
          <TouchableOpacity onPress={onPasswordToggle} style={themedStyles.passwordToggle}>
            <Ionicons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={themedStyles.errorText}>{error}</Text>}
    </View>
  );
}
