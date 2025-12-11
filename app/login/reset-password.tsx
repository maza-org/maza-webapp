import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '@/components/Button';
import { useResetPassword } from '@/app/hooks/useAuthMutations';
import AuthContainer, { AuthTopSection, AuthContent, AuthForm } from '@/app/components/auth/AuthContainer';
import AuthHeader from '@/app/components/auth/AuthHeader';
import AuthTitle from '@/app/components/auth/AuthTitle';
import FormInput from '@/app/components/auth/FormInput';
import AuthFooter from '@/app/components/auth/AuthFooter';

export default function ResetPassword() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const resetPasswordMutation = useResetPassword();

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!code.trim()) {
      newErrors.code = 'Por favor, insira o código de verificação';
    }

    if (password.length < 6) {
      newErrors.password = 'A palavra-passe deve ter pelo menos 6 caracteres';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As palavras-passe não coincidem';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    resetPasswordMutation.mutate({
      email: email || '',
      code: code.trim(),
      password,
      passwordConfirmation: confirmPassword,
    }, {
      onError: (error) => {
        setErrors({ general: error.message });
      },
    });
  };

  const isFormValid = code.trim().length > 0 && password.length >= 6 && confirmPassword.length >= 6;

  const clearError = (field: string) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <AuthContainer>
      <AuthTopSection>
        <AuthHeader />
        <AuthTitle title="Redefinir Palavra-passe" />
        <Text style={styles.subtitleText}>
          Insira o código enviado para {email || 'o seu email'} e crie uma nova palavra-passe.
        </Text>
      </AuthTopSection>

      <AuthContent>
        <AuthForm>
          <FormInput
            label="Código de Verificação"
            placeholder="Insira o código recebido"
            value={code}
            onChangeText={(text) => {
              setCode(text);
              clearError('code');
            }}
            autoCapitalize="none"
            error={errors.code}
          />

          <FormInput
            label="Nova Palavra-passe"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              clearError('password');
            }}
            showPasswordToggle
            isPasswordVisible={showPassword}
            onPasswordToggle={() => setShowPassword(!showPassword)}
            error={errors.password}
          />

          <FormInput
            label="Confirmar Palavra-passe"
            placeholder="Repita a palavra-passe"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              clearError('confirmPassword');
            }}
            showPasswordToggle
            isPasswordVisible={showConfirmPassword}
            onPasswordToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
          />
        </AuthForm>

        <Button
          text={resetPasswordMutation.isPending ? 'A processar...' : 'Redefinir Palavra-passe'}
          handle={handleSubmit}
          disabled={!isFormValid || resetPasswordMutation.isPending}
          loading={resetPasswordMutation.isPending}
        />

        <AuthFooter
          linkText="Voltar ao Login"
          onLinkPress={() => router.replace('/login/login-email')}
        />
      </AuthContent>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  subtitleText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 24,
  },
});
