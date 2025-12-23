import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ProfileInfoItemProps {
  icon: string;
  label: string;
  value: string;
  children?: React.ReactNode;
}

export default function ProfileInfoItem({ icon, label, value, children }: ProfileInfoItemProps) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoHeader}>
        <Feather name={icon as any} size={20} color="#1fa2df" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      {children || <Text style={styles.infoValue}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  infoItem: {
    gap: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    color: '#A8A8B3',
    fontSize: 14,
    marginLeft: 28,
  },
});
