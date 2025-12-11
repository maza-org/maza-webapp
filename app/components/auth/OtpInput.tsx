import React, { useRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface OtpInputProps {
  value: string[];
  onChange: (otp: string[]) => void;
  length?: number;
}

export default function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...value];
    newOtp[index] = text;
    onChange(newOtp);

    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!value[index] && index > 0) {
        const newOtp = [...value];
        newOtp[index - 1] = '';
        onChange(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Código de Verificação</Text>
      <View style={styles.otpContainer}>
        {Array.from({ length }, (_, i) => (
          <TextInput
            key={i}
            ref={(ref) => (inputRefs.current[i] = ref)}
            style={styles.otpInput}
            maxLength={1}
            keyboardType="number-pad"
            value={value[i] || ''}
            onChangeText={(text) => handleOtpChange(text, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    marginTop: 16,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 48,
    backgroundColor: '#252525',
    borderRadius: 24,
    textAlign: 'center',
    fontSize: 16,
    color: '#FFFFFF',
  },
});