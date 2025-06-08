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

type ErrorState = {
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export default function CategorySelection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const getErrorDetails = (response?: Response, error?: Error): ErrorState => {
    if (response) {
      const status = response.status;

      switch (true) {
        case status === 400:
          return {
            message: 'Solicitação inválida. Verifique os dados enviados.',
            icon: 'warning-outline',
          };
        case status === 401:
          return {
            message: 'Acesso não autorizado. Faça login novamente.',
            icon: 'lock-closed-outline',
          };
        case status === 403:
          return {
            message: 'Você não tem permissão para acessar este conteúdo.',
            icon: 'shield-outline',
          };
        case status === 404:
          return {
            message: 'Categorias não encontradas. Tente novamente mais tarde.',
            icon: 'search-outline',
          };
        case status >= 500:
          return {
            message: 'Erro no servidor. Nossa equipe foi notificada.',
            icon: 'server-outline',
          };
        case status >= 400:
          return {
            message: 'Erro na solicitação. Verifique sua conexão.',
            icon: 'alert-circle-outline',
          };
        default:
          return {
            message: 'Erro inesperado. Tente novamente.',
            icon: 'alert-circle-outline',
          };
      }
    }

    // Network or other errors
    if (error?.message?.includes('fetch')) {
      return {
        message: 'Sem conexão com a internet. Verifique sua rede.',
        icon: 'wifi-outline',
      };
    }

    return {
      message: 'Erro inesperado. Tente novamente.',
      icon: 'alert-circle-outline',
    };
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('https://api.mazas.org/api/categories');

      if (!response.ok) {
        const errorDetails = getErrorDetails(response);
        setError(errorDetails);
        return;
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      const errorDetails = getErrorDetails(undefined, error as Error);
      setError(errorDetails);
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
          <View style={styles.errorIconContainer}>
            <Ionicons name={error.icon} size={64} color="#2196F3" />
          </View>
          <Text style={styles.errorTitle}>Ops! Algo deu errado</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh-outline" size={20} color="#FFF" style={styles.retryIcon} />
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
    padding: 24,
  },
  errorIconContainer: {
    marginBottom: 24,
    opacity: 0.9,
  },
  errorTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#b3b3b3',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    maxWidth: 280,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  retryIcon: {
    marginRight: 8,
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
