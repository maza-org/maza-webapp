import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface CoursesHeaderProps {
  title?: string;
  showMenu?: boolean;
  showMaximize?: boolean;
  onMenuPress?: () => void;
  onMaximizePress?: () => void;
}

export default function CoursesHeader({
  title = 'Meus Cursos',
  showMenu = false,
  showMaximize = false,
  onMenuPress,
  onMaximizePress,
}: CoursesHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>

      {(showMenu || showMaximize) && (
        <View style={styles.headerButtons}>
          {showMaximize && (
            <TouchableOpacity style={styles.maximizeButton} onPress={onMaximizePress}>
              <Feather name="maximize-2" size={20} color="#fff" />
            </TouchableOpacity>
          )}

          {showMenu && (
            <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
              <Feather name="menu" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: '#121214',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  maximizeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29292E',
    borderRadius: 6,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29292E',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
