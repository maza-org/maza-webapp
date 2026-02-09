import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, useWindowDimensions, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '@/components/Button';
import { useOtpVerification, usePhoneLogin } from '@/app/hooks/useAuthMutations';
import AuthContainer, { AuthTopSection, AuthContent } from '@/app/components/auth/AuthContainer';
import AuthHeader from '@/app/components/auth/AuthHeader';
import AuthTitle from '@/app/components/auth/AuthTitle';
import OtpInput from '@/app/components/auth/OtpInput';
import { CompactModeProvider } from '@/app/components/auth/CompactModeContext';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function Otp() {
  const { phone, otpId } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const { height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 700; // iPhone SE, 7, 8 have ~667px height

  const otpVerificationMutation = useOtpVerification();
  const resendOtpMutation = usePhoneLogin();

  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const handleConfirm = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      return;
    }

    otpVerificationMutation.mutate({
      phone: phone as string,
      otp: otpCode,
      otpId: otpId as string,
    });
  };

  const handleResendOtp = () => {
    resendOtpMutation.mutate(
      { phone: phone as string },
      {
        onSuccess: () => {
          setOtp(['', '', '', '', '', '']);
        },
      }
    );
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        subText: {
          color: colors.textSecondary,
          fontSize: 14,
          lineHeight: 20,
          marginBottom: 12,
          paddingHorizontal: 24,
          paddingTop: 8,
        },
        phoneNumber: {
          color: colors.text,
        },
        resendContainer: {
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 16,
        },
        resendText: {
          color: colors.textSecondary,
          fontSize: 14,
        },
        resendLink: {
          color: colors.primary,
          fontSize: 14,
        },
        disabledLink: {
          opacity: 0.5,
        },
      }),
    [colors]
  );

  return (
    <CompactModeProvider>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? (isSmallScreen ? 60 : 100) : 0}
    >
      <AuthContainer>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthTopSection>
          <AuthHeader />
          <AuthTitle title="Código OTP" />
          {!isSmallScreen && (
            <Text style={styles.subText}>
              Enviamos uma SMS com o código de autenticação{'\n'}
              para o número <Text style={styles.phoneNumber}>{phone}</Text>
            </Text>
          )}
        </AuthTopSection>

        <AuthContent>
          <OtpInput value={otp} onChange={setOtp} />

          <Button
            text={resendOtpMutation.isPending ? 'A reenviar código...' : 'Confirmar'}
            handle={handleConfirm}
            loading={otpVerificationMutation.isPending}
            disabled={otp.join('').length !== 6 || otpVerificationMutation.isPending}
          />

          {!isSmallScreen && (
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Não recebeu o código? </Text>
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={resendOtpMutation.isPending || otpVerificationMutation.isPending}
              >
                <Text
                  style={[
                    styles.resendLink,
                    (resendOtpMutation.isPending || otpVerificationMutation.isPending) && styles.disabledLink,
                  ]}
                >
                  Reenviar Código
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </AuthContent>
        </ScrollView>
      </AuthContainer>
    </KeyboardAvoidingView>
    </CompactModeProvider>
  );
}

