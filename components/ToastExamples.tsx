import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useToast } from '@/hooks/useToast';
import Toast from './Toast';

export default function ToastExamples() {
  const { toast, config, showInfo, showSuccess, showWarning, showError, showLoading, showCustom, hideToast } =
    useToast();

  const handleShowInfo = () => {
    showInfo('Esta é uma mensagem informativa para o utilizador.');
  };

  const handleShowSuccess = () => {
    showSuccess('Operação concluída com sucesso!');
  };

  const handleShowWarning = () => {
    showWarning('Atenção! Esta ação pode ter consequências.');
  };

  const handleShowError = () => {
    showError('Ocorreu um erro. Tente novamente.');
  };

  const handleShowLoading = () => {
    showLoading('A processar...', { duration: 5000 });
  };

  const handleShowCustom = () => {
    showCustom(
      '🎉 Promoção especial! 50% de desconto!',
      {
        background: '#FF6B6B',
        border: '#FF6B6B',
        icon: '#FFF',
      },
      'gift',
      { duration: 4000 }
    );
  };

  const handleShowTopToast = () => {
    showInfo('Toast no topo da tela', { position: 'top' });
  };

  const handleShowNoIcon = () => {
    showSuccess('Toast sem ícone', { showIcon: false });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Exemplos de Toast</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.infoButton]} onPress={handleShowInfo}>
            <Text style={styles.buttonText}>Info Toast</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.successButton]} onPress={handleShowSuccess}>
            <Text style={styles.buttonText}>Success Toast</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={handleShowWarning}>
            <Text style={styles.buttonText}>Warning Toast</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.errorButton]} onPress={handleShowError}>
            <Text style={styles.buttonText}>Error Toast</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.loadingButton]} onPress={handleShowLoading}>
            <Text style={styles.buttonText}>Loading Toast</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.customButton]} onPress={handleShowCustom}>
            <Text style={styles.buttonText}>Custom Toast</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.topButton]} onPress={handleShowTopToast}>
            <Text style={styles.buttonText}>Top Position</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.noIconButton]} onPress={handleShowNoIcon}>
            <Text style={styles.buttonText}>No Icon</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Tipos de Toast Disponíveis:</Text>
          <Text style={styles.infoText}>• Info - Azul (#3B82F6)</Text>
          <Text style={styles.infoText}>• Success - Azul Maza (#1fa2df)</Text>
          <Text style={styles.infoText}>• Warning - Amarelo (#F59E0B)</Text>
          <Text style={styles.infoText}>• Error - Vermelho (#EF4444)</Text>
          <Text style={styles.infoText}>• Loading - Roxo (#8B5CF6)</Text>
          <Text style={styles.infoText}>• Custom - Cores personalizadas</Text>
        </View>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
        duration={config.duration}
        position={config.position}
        showIcon={config.showIcon}
        customIcon={config.customIcon}
        customColors={config.customColors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoButton: {
    backgroundColor: '#3B82F6',
  },
  successButton: {
    backgroundColor: '#1fa2df',
  },
  warningButton: {
    backgroundColor: '#F59E0B',
  },
  errorButton: {
    backgroundColor: '#EF4444',
  },
  loadingButton: {
    backgroundColor: '#8B5CF6',
  },
  customButton: {
    backgroundColor: '#FF6B6B',
  },
  topButton: {
    backgroundColor: '#10B981',
  },
  noIconButton: {
    backgroundColor: '#6B7280',
  },
  infoSection: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#202024',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#E1E1E6',
    marginBottom: 5,
  },
});
