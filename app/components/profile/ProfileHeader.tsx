import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface ProfileHeaderProps {
  onBack?: () => void;
  onEdit?: () => void;
}

export default function ProfileHeader({ onBack, onEdit }: ProfileHeaderProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const styles = StyleSheet.create({
    header: {
      height: 100,
      padding: 24,
      backgroundColor: colors.cardBackground, // Use card background or similar
      justifyContent: 'center', // Added for better alignment if needed
      paddingTop: 40, // Adjust for status bar if not handled safely elsewhere, or just keep padding
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
      backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

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
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
          <Feather name="edit-2" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
