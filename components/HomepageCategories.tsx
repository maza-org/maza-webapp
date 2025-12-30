import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React from 'react';

export default function HomepageCategories() {
  return (
    <View style={styles.listContainer}>
      <TouchableOpacity
        style={styles.listItem}
        onPress={() =>
          router.push({
            pathname: '/categories/[id]',
            params: { id: 113, documentId: 'otrisrttxpxo649v9jr3quhk', name: 'Competências Digitais' },
          })
        }
      >
        <View style={styles.iconBox}>
          <Feather name="monitor" size={20} color="#E1E1E6" />
        </View>
        <Text style={styles.itemText}>Competências Digitais</Text>
        <Feather name="chevron-right" size={20} color="#52525B" />
      </TouchableOpacity>

      <View style={styles.separator} />

      <TouchableOpacity
        style={styles.listItem}
        onPress={() =>
          router.push({
            pathname: '/categories/[id]',
            params: { id: 133, documentId: 'go6yit01mydfu1m06kuj4pm3', name: 'Competências Verdes' },
          })
        }
      >
        <View style={styles.iconBox}>
          <Feather name="globe" size={20} color="#E1E1E6" />
        </View>
        <Text style={styles.itemText}>Competências Verdes</Text>
        <Feather name="chevron-right" size={20} color="#52525B" />
      </TouchableOpacity>

      <View style={styles.separator} />

      <TouchableOpacity
        style={styles.listItem}
        onPress={() =>
          router.push({
            pathname: '/categories/[id]',
            params: { id: 117, documentId: 'gvrwa61nzxhf4oea6nnhxr2p', name: 'Mudanças Climáticas' },
          })
        }
      >
        <View style={styles.iconBox}>
          <Feather name="cloud" size={20} color="#E1E1E6" />
        </View>
        <Text style={styles.itemText}>Mudanças Climáticas</Text>
        <Feather name="chevron-right" size={20} color="#52525B" />
      </TouchableOpacity>

      <View style={styles.separator} />

      <TouchableOpacity style={styles.listItem} onPress={() => router.push('/categories')}>
        <View style={styles.iconBox}>
          <Feather name="grid" size={20} color="#E1E1E6" />
        </View>
        <Text style={styles.itemText}>Ver Mais</Text>
        <Feather name="chevron-right" size={20} color="#52525B" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    backgroundColor: '#202024',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#29292E',
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
    backgroundColor: '#29292E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemText: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Manrope',
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#29292E',
    marginLeft: 70,
  },
});
