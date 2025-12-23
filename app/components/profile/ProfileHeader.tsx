import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

interface ProfileHeaderProps {
  onBack?: () => void;
  onEdit?: () => void;
}

export default function ProfileHeader({ onBack, onEdit }: ProfileHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      router.push('/user/edit');
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
          <Feather name="chevron-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
          <Feather name="edit-2" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    padding: 24,
    backgroundColor: '#202024',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
