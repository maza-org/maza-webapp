import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '@/components/Button';
import { useOtpVerification, usePhoneLogin } from '@/app/hooks/useAuthMutations';
import AuthContainer, { AuthTopSection, AuthContent } from '@/app/components/auth/AuthContainer';
import AuthHeader from '@/app/components/auth/AuthHeader';
import AuthTitle from '@/app/components/auth/AuthTitle';
import OtpInput from '@/app/components/auth/OtpInput';

export default function Otp() {
  const { phone, otpId } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const otpVerificationMutation = useOtpVerification();
  const resendOtpMutation = usePhoneLogin();

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

  return (
    <AuthContainer>
      <AuthTopSection>
        <AuthHeader />
        <AuthTitle title="Código OTP" />
        <Text style={styles.subText}>
          Enviamos uma SMS com o código de autenticação{'\n'}
          para o número <Text style={styles.phoneNumber}>{phone}</Text>
        </Text>
      </AuthTopSection>

      <AuthContent>
        <OtpInput value={otp} onChange={setOtp} />

        <Button
          text={resendOtpMutation.isPending ? 'A reenviar código...' : 'Confirmar'}
          handle={handleConfirm}
          loading={otpVerificationMutation.isPending}
          disabled={otp.join('').length !== 6 || otpVerificationMutation.isPending}
        />

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
      </AuthContent>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  subText: {
    color: '#999999',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  phoneNumber: {
    color: '#FFFFFF',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  resendText: {
    color: '#999999',
    fontSize: 14,
  },
  resendLink: {
    color: '#2196F3',
    fontSize: 14,
  },
  disabledLink: {
    opacity: 0.5,
  },
});
