import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import Shimmer from '@/components/Shimmer';
import Header from '@/components/Header';
import { ApiResponse, Course } from '@/types/course';
import { blurhash } from '@/util/util';

export default function Category() {
  const { name, id } = useLocalSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [id]);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/courses?subjects=${id}`);
      const data: ApiResponse = await response.json();
      setCourses(data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setIsLoading(false);
    }
  };

  const handlePressCourse = (course: Course) => {
    console.log(course);
    router.push({
      pathname: '/room/lessons',
      params: {
        documentId: course.documentId,
      },
    });
  };

  const renderCourseItem = ({ item: course }: { item: Course }) => (
    <TouchableOpacity style={styles.courseCard} onPress={() => handlePressCourse(course)}>
      <Image
        style={styles.thumbnail}
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={1000}
        source={{
          uri: course.picture?.formats?.thumbnail?.url || course.picture?.formats?.small?.url || course.picture?.url,
        }}
      />
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
    <FlatList
      data={[...Array(7)]}
      keyExtractor={(_, index) => `shimmer-${index}`}
      renderItem={({ index }) => (
        <View key={index} style={styles.courseCard}>
          <Shimmer>
            <View style={styles.thumbnail} />
          </Shimmer>
          <View style={styles.courseInfo}>
            <Shimmer>
              <View style={styles.titleShimmer} />
            </Shimmer>
            <Shimmer>
              <View style={styles.descriptionShimmer} />
            </Shimmer>
          </View>
        </View>
      )}
      contentContainerStyle={styles.listContent}
    />
  );

  const ListEmptyComponent = () => <Text style={styles.noCourses}>Nenhum curso encontrado</Text>;

  const ListHeaderComponent = isLoading ? <Text style={styles.loadingText}>Carregando cursos...</Text> : null;

  return (
    <SafeAreaView style={styles.container}>
      <Header title={name as string} />

      {isLoading ? (
        renderLoadingShimmer()
      ) : (
        <FlatList
          data={courses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={ListEmptyComponent}
          ListHeaderComponent={ListHeaderComponent}
        />
      )}
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
  noCourses: {
    color: '#666',
    fontSize: 16,
    marginTop: 25,
  },
  courseCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#202024',
    borderRadius: 12,
    marginBottom: 16,
  },
  thumbnail: {
    width: 100,
    height: 70,
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
    marginRight: 8,
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
});
