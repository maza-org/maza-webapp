import { Text, TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import { useGetJourneys } from '@/app/hooks/useJourneyQueries';

export default function HomepageCategories() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { data: journeys } = useGetJourneys();

  const randomJourney = React.useMemo(() => {
    return journeys?.data ? [...journeys.data].sort(() => Math.random() - 0.5).slice(0, 3) : [];
  }, [journeys]);

  return (
    <View style={[styles.listContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      {randomJourney?.map((journey) => (
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
    borderWidth: Platform.OS === 'web' ? 0 : 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: Platform.OS === 'web' ? 'wrap' : 'nowrap',
    gap: Platform.OS === 'web' ? 16 : 0,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    ...(Platform.OS === 'web' ? {
      minWidth: 250,
      flex: 1,
      borderWidth: 1,
      borderRadius: 12,
      borderColor: 'rgba(0,0,0,0.1)',
    } : {}),
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
    display: Platform.OS === 'web' ? 'none' : 'flex',
  },
});
