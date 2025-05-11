import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/Header';

type Category = {
  id: number;
  name: string;
  courses: number;
  icon: keyof typeof Ionicons.glyphMap;
};

type CourseSubject = {
  id: number;
  documentId: string;
  name: string;
};

type Course = {
  id: number;
  documentId: string;
  title: string;
  author: string | null;
  rating_avg: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  subjects: CourseSubject[];
};

type APIResponse = {
  data: Course[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export default function CategorySelection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('https://api.mazas.org/api/categories');
      if (!response.ok) {
        throw new Error('Falha ao buscar categorias');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ocorreu um erro');
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryPress = (category: Category) => {
    router.push({
      pathname: '/categories/[id]',
      params: { id: category.id, name: category.name },
    });
  };

  const handleRetry = () => {
    fetchCategories();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={'Escolha uma categoria'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2EA8FF" />
          <Text style={styles.loadingText}>Carregando categorias...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={'Escolha uma categoria'} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={'Escolha uma categoria'} />

      <View style={styles.categoriesList}>
        {categories.map((category) => (
          <TouchableOpacity key={category.id} style={styles.categoryItem} onPress={() => handleCategoryPress(category)}>
            <View style={styles.iconContainer}>
              <Ionicons name={category.icon} size={24} color="#FFF" />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.coursesCount}>
                {category.courses} {category.courses === 1 ? 'Curso' : 'Cursos'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#8257e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesList: {
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#29292E',
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#202024',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
  },
  coursesCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
});
