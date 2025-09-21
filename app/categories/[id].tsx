import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Shimmer from '@/components/Shimmer';
import Header from '@/components/Header';
import { ApiResponse, Course } from '@/types/course';
import { blurhash } from '@/util/util';
import { baseUrl } from '@/services/api';
import useUser from '@/hooks/useUser';

export default function Category() {
  const { name, id, type } = useLocalSearchParams();
  const { data: user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [id, type]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let url;
      let headers: HeadersInit = {};

      if (type === 'popular') {
        url = `${baseUrl}/courses?sort=subscribed%3Adesc&pageSize=15&page=1`;
      } else if (type === 'new') {
        url = `${baseUrl}/courses?sort=publishedAt:desc&pageSize=10&page=1`;
      } else if (type === 'suggested') {
        url = `${baseUrl}/courses/suggested?pageSize=10&page=1`;
        if (user?.token) {
          headers = {
            Authorization: `Bearer ${user.token}`,
          };
        }
      } else {
        url = `${baseUrl}/courses?subjects=${id}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Falha ao carregar cursos: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setCourses(data.data);
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os cursos. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePressCourse = (course: Course) => {
    router.push({
      pathname: '/room/lessons',
      params: {
        documentId: course.documentId,
      },
    });
  };

  const renderCourseItem = ({ item: course }: { item: Course }) => (
    <TouchableOpacity style={styles.courseCard} onPress={() => handlePressCourse(course)}>
      <View style={styles.thumbnailContainer}>
        <Image
          style={styles.thumbnail}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
          source={{
            uri: course.picture?.formats?.thumbnail?.url || course.picture?.formats?.small?.url || course.picture?.url,
          }}
        />
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <View>
          {course.author && <Text style={styles.author}>{course.author}</Text>}
          <Text style={styles.rating}>★ {course.rating_avg.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLoadingShimmer = () => (
    <>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2EA8FF" />
        <Text style={styles.loadingText}>Carregando os cursos...</Text>
      </View>
      <FlatList
        data={[...Array(5)]}
        keyExtractor={(_, index) => `shimmer-${index}`}
        renderItem={() => (
          <View style={styles.courseCard}>
            {/* Thumbnail shimmer */}
            <View style={styles.thumbnailContainer}>
              <Shimmer>
                <View style={styles.thumbnail} />
              </Shimmer>
            </View>

            {/* Content shimmer */}
            <View style={styles.courseInfo}>
              <Shimmer style={{ marginBottom: 8 }}>
                <View style={[styles.titleShimmer]} />
              </Shimmer>

              <View style={{ gap: 8 }}>
                <Shimmer>
                  <View style={[styles.descriptionShimmer]} />
                </Shimmer>
                <Shimmer>
                  <View style={[styles.descriptionShimmer, { width: '40%' }]} />
                </Shimmer>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </>
  );

  const ErrorComponent = () => (
    <View style={styles.centerContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#FF4B4B" />
      </View>
      <Text style={styles.errorTitle}>Ops! Algo deu errado</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchCourses}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        style={styles.emptyIcon}
        source={require('@/assets/images/not-found.png')}
        contentFit="contain"
        placeholder={blurhash}
        transition={300}
        onError={(error) => {
          console.error('Erro ao carregar imagem de estado vazio:', error);
        }}
        accessible={true}
        accessibilityLabel="Ilustração de nenhum curso encontrado"
      />
      <Text style={styles.emptyTitle}>Nenhum curso disponível</Text>
      <Text style={styles.emptySubtitle}>Nenhuma opção de aprendizado foi encontrada.</Text>
      <Text style={styles.emptySubtitle}>Por favor, volte a verificar mais tarde</Text>
    </View>
  );

  const ListHeaderComponent = () =>
    !isLoading && courses.length > 0 ? (
      <Text style={styles.coursesAvailable}>
        {courses.length} {courses.length === 1 ? 'curso disponível' : 'cursos disponíveis'}
      </Text>
    ) : null;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={name as string} />
        {renderLoadingShimmer()}
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={name as string} />
        <ErrorComponent />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={name as string} />

      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  listContent: {
    paddingHorizontal: 24,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 25,
    marginBottom: 24,
  },
  courseCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#202024',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 100,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  courseInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  courseTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  rating: {
    color: '#FFD700',
    fontSize: 14,
    marginTop: 10,
  },
  author: {
    color: '#666',
    fontSize: 14,
  },
  titleShimmer: {
    height: 20,
    backgroundColor: '#29292E',
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  descriptionShimmer: {
    height: 16,
    backgroundColor: '#29292E',
    borderRadius: 4,
    width: '60%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  loadingLabel: {
    color: '#666',
    fontSize: 16,
    marginTop: 24,
    marginBottom: 16,
    marginLeft: 24,
  },
  coursesAvailable: {
    color: '#666',
    fontSize: 16,
    marginTop: 24,
    marginBottom: 16,
    marginLeft: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 40,
  },
  emptyIcon: {
    width: 150,
    height: 140,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#121214',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    marginBottom: 24,
    opacity: 0.6,
  },
  errorTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtitle: {
    color: '#8F8F8F',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#2EA8FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
