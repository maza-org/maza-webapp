import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function HomepageCategories() {
  const { theme } = useTheme();
  const colors = Colors[theme];

  return (
    <View style={[styles.listContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.listItem}
        onPress={() =>
          router.push({
            pathname: '/categories/[id]',
            params: { id: 113, documentId: 'otrisrttxpxo649v9jr3quhk', name: 'Competências Digitais' },
          })
        }
      >
        <View style={[styles.iconBox, { backgroundColor: colors.buttonBackground }]}>
          <Feather name="monitor" size={20} color={colors.iconColor} />
        </View>
        <Text style={[styles.itemText, { color: colors.text }]}>Competências Digitais</Text>
        <Feather name="chevron-right" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      <TouchableOpacity
        style={styles.listItem}
        onPress={() =>
          router.push({
            pathname: '/categories/[id]',
            params: { id: 133, documentId: 'go6yit01mydfu1m06kuj4pm3', name: 'Competências Verdes' },
          })
        }
      >
        <View style={[styles.iconBox, { backgroundColor: colors.buttonBackground }]}>
          <Feather name="globe" size={20} color={colors.iconColor} />
        </View>
        <Text style={[styles.itemText, { color: colors.text }]}>Competências Verdes</Text>
        <Feather name="chevron-right" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      <TouchableOpacity
        style={styles.listItem}
        onPress={() =>
          router.push({
            pathname: '/categories/[id]',
            params: { id: 117, documentId: 'gvrwa61nzxhf4oea6nnhxr2p', name: 'Mudanças Climáticas' },
          })
        }
      >
        <View style={[styles.iconBox, { backgroundColor: colors.buttonBackground }]}>
          <Feather name="cloud" size={20} color={colors.iconColor} />
        </View>
        <Text style={[styles.itemText, { color: colors.text }]}>Mudanças Climáticas</Text>
        <Feather name="chevron-right" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      <TouchableOpacity style={styles.listItem} onPress={() => router.push('/categories')}>
        <View style={[styles.iconBox, { backgroundColor: colors.buttonBackground }]}>
          <Feather name="grid" size={20} color={colors.iconColor} />
        </View>
        <Text style={[styles.itemText, { color: colors.text }]}>Ver Mais</Text>
        <Feather name="chevron-right" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'ManropeRegular',
    lineHeight: 20,
  },
  separator: {
    height: 1,
    marginLeft: 70,
  },
});
