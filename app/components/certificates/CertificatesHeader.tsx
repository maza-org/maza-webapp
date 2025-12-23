import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface CertificatesHeaderProps {
  onBackPress: () => void;
}

export default function CertificatesHeader({ onBackPress }: CertificatesHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconButton} onPress={onBackPress}>
        <Feather name="chevron-left" size={24} color="#FFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Meus Certificados</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 100,
    padding: 24,
    backgroundColor: '#202024',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
