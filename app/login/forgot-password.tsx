import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useForgotPassword } from '@/app/hooks/useAuthMutations';
import AuthContainer, { AuthTopSection, AuthContent, AuthForm } from '@/app/components/auth/AuthContainer';
import AuthHeader from '@/app/components/auth/AuthHeader';
import AuthTitle from '@/app/components/auth/AuthTitle';
import FormInput from '@/app/components/auth/FormInput';
import AuthFooter from '@/app/components/auth/AuthFooter';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Por favor, insira o seu email');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      setError('Por favor, insira um email válido');
      return;
    }

    setError('');
    
    forgotPasswordMutation.mutate(
      { email: trimmedEmail },
      {
        onSuccess: () => {
          setSuccess(true);
        },
        onError: (error) => {
          setError(error.message);
        },
      }
    );
  };

  const handleBackToLogin = () => {
    router.back();
  };

  if (success) {
    return (
      <AuthContainer>
        <AuthTopSection>
          <AuthHeader />
          <AuthTitle title="Código Enviado" />
        </AuthTopSection>

        <AuthContent>
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>PIN enviado com sucesso!</Text>
            <Text style={styles.successMessage}>
              Enviámos um código de verificação para{'\n'}
              <Text style={styles.successIdentifier}>{email}</Text>
            </Text>
            <Text style={styles.successInstructions}>
              Por favor, verifique a sua caixa de entrada e use o código para redefinir a sua palavra-passe.
            </Text>
          </View>

          <Button
            text="Introduzir Código"
            handle={() => router.push({ pathname: '/login/reset-password', params: { email } })}
          />

          <TouchableOpacity
            style={styles.resendContainer}
            onPress={() => {
              setSuccess(false);
              handleSubmit();
            }}
          >
            <Text style={styles.resendText}>Não recebeu o código? </Text>
            <Text style={styles.resendLink}>Reenviar</Text>
          </TouchableOpacity>

          <AuthFooter
            linkText="Voltar ao Login"
            onLinkPress={() => router.back()}
          />
        </AuthContent>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <AuthTopSection>
        <AuthHeader />
        <AuthTitle
          title="Recuperar Palavra-passe"
        />
        <Text style={styles.subtitleText}>
          Insira o seu email para receber um código de verificação.
        </Text>
      </AuthTopSection>

      <AuthContent>
        <AuthForm>
          <FormInput
            label="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError('');
            }}
            autoCapitalize="none"
            error={error}
          />
        </AuthForm>

        <Button
          text={forgotPasswordMutation.isPending ? 'A enviar...' : 'Enviar Código'}
          handle={handleSubmit}
          disabled={!email.trim() || forgotPasswordMutation.isPending}
          loading={forgotPasswordMutation.isPending}
        />

        <AuthFooter
          linkText="Já tem um código?"
          onLinkPress={() => router.push('/login/reset-password')}
        />

        <AuthFooter
          linkText="Voltar ao Login"
          onLinkPress={() => router.back()}
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
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  successIdentifier: {
    color: '#2196F3',
    fontWeight: '500',
  },
  successInstructions: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    color: '#999999',
    fontSize: 14,
  },
  resendLink: {
    color: '#2196F3',
    fontSize: 14,
  },
});
