import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React from 'react';

export default function HomepageCategories() {
  return (
    <View style={styles.categoryContainer}>
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => {
          router.push({
            pathname: '/categories/[id]',
            params: {
              id: 43,
              documentId: 'miclj6ukx3k7u1eqeyxo3pf2',
              name: 'Competências Digitais',
            },
          });
        }}
      >
        <View style={styles.iconContainer}>
          <Feather name="monitor" size={20} color="#FFF" />
        </View>
        <Text style={styles.categoryText} numberOfLines={2}>
          Competências Digitais
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => {
          router.push({
            pathname: '/categories/[id]',
            params: {
              id: 71,
              documentId: 'unz4bv8reqwncrv34zed36zb',
              name: 'Competências Verdes',
            },
          });
        }}
      >
        <View style={styles.iconContainer}>
          <Feather name="sun" size={20} color="#FFF" />
        </View>
        <Text style={styles.categoryText} numberOfLines={2}>
          Competências Verdes
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => {
          router.push({
            pathname: '/categories/[id]',
            params: {
              id: 69,
              documentId: 'f2tnfg0q70l17lob34ll8w87',
              name: 'Mudanças Climáticas',
            },
          });
        }}
      >
        <View style={styles.iconContainer}>
          <Feather name="cloud" size={20} color="#FFF" />
        </View>
        <Text style={styles.categoryText} numberOfLines={2}>
          Mudanças Climáticas
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.categoryItem} onPress={() => router.push('/categories')}>
        <View style={styles.iconContainer}>
          <Feather name="grid" size={20} color="#FFF" />
        </View>
        <Text style={styles.categoryText} numberOfLines={2}>
          Ver Mais
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    padding: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'ManropeBold',
    color: '#FFF',
    width: 200,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  categoryItem: {
    alignItems: 'center',
    width: '23%',
  },
  iconContainer: {
    backgroundColor: '#29292E',
    padding: 12,
    borderRadius: 50,
    marginBottom: 8,
  },
  categoryText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'ManropeRegular',
    textAlign: 'center',
    lineHeight: 14,
  },
});
