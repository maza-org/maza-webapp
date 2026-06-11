import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  style?: any;
  inputStyle?: any;
  label?: string;
  labelStyle?: any;
  dark?: boolean;
  onBlur?: () => void;
}

/**
 * Phone input with +258 (Mozambique) as a fixed non-editable prefix.
 * The value passed in/out is ONLY the local part (after +258).
 */
export default function PhoneInput({ value, onChangeText, style, inputStyle, label, labelStyle, onBlur }: PhoneInputProps) {
  const { colors } = useTheme();
  const handleChangeText = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '');
    const localNumber = digits.startsWith('258') ? digits.slice(3) : digits;
    onChangeText(localNumber.slice(0, 9));
  };

  return (
    <View style={style}>
      {label ? <Text style={[styles.label, { color: colors.text }, labelStyle]}>{label}</Text> : null}
      <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }, inputStyle]}>
        <View style={styles.prefix}>
          <Text style={[styles.code, { color: colors.text }]}>+258</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          keyboardType="phone-pad"
          placeholder=""
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={handleChangeText}
          onBlur={onBlur}
          maxLength={13}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 6,
  },
  code: { fontSize: 15, fontWeight: '700' },
  divider: { width: 1, height: 28 },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15 },
});
