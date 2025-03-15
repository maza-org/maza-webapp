import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface Instructor {
  name: string;
}

interface Course {
  id: number;
  documentId: string;
  title: string;
  author: string;
  rating_avg: number;
}

interface FavoriteCourse {
  id: number;
  documentId: string;
  position: string;
  is_favorite: boolean;
  progress: number;
  course: Course;
}

interface FavoriteResponse {
  data: FavoriteCourse[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

const FavoriteCoursesGrid = () => {
  const [favorites, setFavorites] = useState<FavoriteCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user');
      if (!userData) {
        throw new Error('Dados do utilizador não encontrados');
      }

      const { token } = JSON.parse(userData);
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`https://api.mazas.org/api/user-courses/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao obter favoritos');
      }

      const data: FavoriteResponse = await response.json();
      setFavorites(data.data);
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      setError('Não foi possível carregar os seus favoritos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2EA8FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.message}>{error}</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.message}>Não tem cursos favoritos disponíveis</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.gridContainer}>
        {favorites.map((favorite) => (
          <TouchableOpacity
            key={favorite.id}
            style={styles.courseCard}
            onPress={() => {
              router.push({
                pathname: '/room/lessons',
                params: {
                  documentId: favorite.course.documentId,
                },
              });
            }}
          >
            {/* Course Image */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: 'https://picsum.photos/400/320' }} style={styles.courseImage} />
              <Pressable style={styles.heartButton}>
                <Ionicons name="heart" size={20} color="#FF4B4B" />
              </Pressable>
            </View>

            {/* Course Content */}
            <View style={styles.contentContainer}>
              {/* Position Status */}
              <Text style={styles.category}>
                {favorite.position === 'NotStarted' ? 'Não iniciado' : favorite.position}
              </Text>

              {/* Title */}
              <Text style={styles.title} numberOfLines={2}>
                {favorite.course.title}
              </Text>

              {/* Author */}
              <View style={styles.instructorContainer}>
                <Image source={{ uri: 'https://i.pravatar.cc/300' }} style={styles.instructorAvatar} />
                <Text style={styles.instructorName}>{favorite.course.author}</Text>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.level}>Progresso: {favorite.progress}%</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.rating}>{favorite.course.rating_avg.toFixed(1)}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#121214',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    color: '#8F8F8F',
    fontSize: 16,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  courseCard: {
    width: '47%',
    backgroundColor: '#202024',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    padding: 12,
  },
  category: {
    fontSize: 12,
    color: '#2EA8FF',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 20,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  instructorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  instructorName: {
    fontSize: 12,
    color: '#8F8F8F',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  level: {
    fontSize: 12,
    color: '#8F8F8F',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: '#FFD700',
  },
});

export default FavoriteCoursesGrid;
