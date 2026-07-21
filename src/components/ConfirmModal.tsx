import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  visible, title, message,
  confirmText = 'Confirmar', cancelText = 'Cancelar',
  confirmColor = colors.error,
  onConfirm, onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={styles.cancelTxt}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: confirmColor }]} onPress={onConfirm} activeOpacity={0.8}>
              <Text style={styles.confirmTxt}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  message: { fontSize: 14, color: colors.textMuted, lineHeight: 21, marginBottom: 24 },
  btnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 30,
    backgroundColor: '#F1F5F9', alignItems: 'center',
  },
  cancelTxt: { fontWeight: '600', color: colors.textMuted, fontSize: 15 },
  confirmBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 30, alignItems: 'center',
  },
  confirmTxt: { fontWeight: 'bold', color: '#fff', fontSize: 15 },
});
