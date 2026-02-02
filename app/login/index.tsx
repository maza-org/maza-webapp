import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { validateMozambiquePhone } from '@/util/util';
import { usePhoneLogin } from '@/app/hooks/useAuthMutations';
import AuthContainer, { AuthTopSection, AuthContent, AuthForm } from '@/app/components/auth/AuthContainer';
import AuthHeader from '@/app/components/auth/AuthHeader';
import AuthTitle from '@/app/components/auth/AuthTitle';
import FormInput from '@/app/components/auth/FormInput';
import AuthFooter from '@/app/components/auth/AuthFooter';

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);

  const phoneLoginMutation = usePhoneLogin();

  // Validate phone number when it changes
  useEffect(() => {
    if (touched && phoneNumber) {
      const validation = validateMozambiquePhone(phoneNumber);
      if (!validation.isValid) {
        setError(validation.error);
      } else {
        setError('');
      }
    } else if (touched && !phoneNumber) {
      setError('Por favor preencha o número de telefone');
    }
  }, [phoneNumber, touched]);

  const handleLogin = () => {
    setTouched(true);

    if (!phoneNumber) {
      setError('Por favor preencha o número de telefone');
      return;
    }

    const validation = validateMozambiquePhone(phoneNumber);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    phoneLoginMutation.mutate(
      { phone: validation.formattedNumber },
      {
        onError: (error: any) => {
          if (error?.status === 417) {
            setError('Este número de telefone não tem conta associada');
          } else {
            setError(error.message);
          }
        },
      }
    );
  };

  const handlePhoneNumberChange = (text: string) => {
    const sanitizedText = text.replace(/[^\d+]/g, '');
    setPhoneNumber(sanitizedText);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <AuthContainer>
        <AuthTopSection>
          <AuthHeader />
          <AuthTitle
            title="Faça login com a sua conta"
            subtitle="Não possui uma conta?"
            linkText="Registar"
            linkAction={() => router.push('/login/create-email')}
          />
        </AuthTopSection>

        <AuthContent>
          <AuthForm>
            <FormInput
              label="Número de Telemóvel"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              onBlur={() => setTouched(true)}
              maxLength={13}
              error={error && touched ? error : undefined}
            />
          </AuthForm>

          <Button
            text={phoneLoginMutation.isPending ? 'A processar...' : 'Entrar'}
            handle={handleLogin}
            disabled={!!error || !phoneNumber || phoneLoginMutation.isPending}
            loading={phoneLoginMutation.isPending}
          />

          <AuthFooter
            linkText="Prefere usar email e palavra-passe?"
            onLinkPress={() => router.push('/login/login-email')}
          />
        </AuthContent>
      </AuthContainer>
    </KeyboardAvoidingView>
  );
}
