import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ProfileErrorStateProps {
  title?: string;
  message?: string;
  buttonText?: string;
  onButtonPress: () => void;
}

export default function ProfileErrorState({
  title = 'Sessão Expirada',
  message = 'A sua sessão expirou ou não está autenticado. Por favor, inicie sessão novamente para aceder ao seu perfil.',
  buttonText = 'Iniciar Sessão',
  onButtonPress,
}: ProfileErrorStateProps) {
  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorContent}>
        <View style={styles.errorIconContainer}>
          <Feather name="user-x" size={48} color="#1fa2df" />
        </View>
        <Text style={styles.errorTitle}>{title}</Text>
        <Text style={styles.errorText}>{message}</Text>
        <TouchableOpacity style={styles.loginButton} onPress={onButtonPress}>
          <Feather name="log-in" size={20} color="#FFF" style={styles.loginButtonIcon} />
          <Text style={styles.loginButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#121214',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorContent: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    borderRadius: 16,
    padding: 24,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(31, 162, 223, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    color: '#A8A8B3',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#1fa2df',
    padding: 16,
    borderRadius: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginButtonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});