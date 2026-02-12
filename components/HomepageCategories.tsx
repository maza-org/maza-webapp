import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import { useGetJourneys } from '@/app/hooks/useJourneyQueries';

export default function HomepageCategories() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { data: journeys, error } = useGetJourneys();

  console.log('AAA', JSON.stringify(error, null, 2))

  return (
    <View style={[styles.listContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      {journeys?.data.map((journey) => (
        <TouchableOpacity
          key={journey.id}
          style={styles.listItem}
          onPress={() =>
            router.push({
              pathname: '/journeys/[id]',
              params: { id: journey.id, documentId: journey.documentId, name: journey.name },
            })
          }
        >
          <View style={[styles.iconBox, { backgroundColor: colors.buttonBackground }]}>
            <Feather name="monitor" size={20} color={colors.iconColor} />
          </View>
          <Text style={[styles.itemText, { color: colors.text }]}>{journey.name}</Text>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      ))}

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      <TouchableOpacity style={styles.listItem} onPress={() => router.push('/journeys')}>
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
