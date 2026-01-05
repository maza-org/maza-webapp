import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

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
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(() => StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 32,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
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
      backgroundColor: colors.inputBackground,
      borderRadius: 6,
    },
    menuButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
  }), [colors]);

  return (
    <View style={themedStyles.header}>
      <Text style={themedStyles.title}>{title}</Text>

      {(showMenu || showMaximize) && (
        <View style={themedStyles.headerButtons}>
          {showMaximize && (
            <TouchableOpacity style={themedStyles.maximizeButton} onPress={onMaximizePress}>
              <Feather name="maximize-2" size={20} color={colors.text} />
            </TouchableOpacity>
          )}

          {showMenu && (
            <TouchableOpacity style={themedStyles.menuButton} onPress={onMenuPress}>
              <Feather name="menu" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
