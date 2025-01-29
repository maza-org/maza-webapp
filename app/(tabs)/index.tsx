import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [popularCourses, setPopularCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    fetchSubjects();
    fetchPopularCourses();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/courses`);
      const data = await response.json();

      const allSubjects = data.data.flatMap((course) => course.subjects);
      const uniqueSubjects = Array.from(new Map(allSubjects.map((subject) => [subject.id, subject])).values());

      setSubjects(uniqueSubjects.slice(0, 3));
      setLoadingSubjects(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setLoadingSubjects(false);
    }
  };

  const fetchPopularCourses = async () => {
    try {
      const response = await fetch('https://maza-strapi-backend.onrender.com/api/courses');
      const data = await response.json();
      setPopularCourses(data.data);
      setLoadingCourses(false);
    } catch (error) {
      console.error('Error fetching popular courses:', error);
      setLoadingCourses(false);
    }
  };

  const handleSubjectClick = (subject) => {
    console.log('Selected subject:', {
      id: subject.id,
      documentId: subject.documentId,
      name: subject.name,
    });
  };

  const handleSearchPress = () => {
    router.push('/search');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.push('/start')}>
          <Text style={{ color: 'white', fontSize: 20 }}>GO</Text>
        </TouchableOpacity>

        {/* Header with Bell Icon */}
        <View style={styles.header}>
          <Text style={styles.headerText}>O que pretende aprender hoje?</Text>
          <TouchableOpacity
            style={{
              borderStyle: 'solid',
              borderColor: '#b3b3b3',
              borderWidth: 0.5,
              padding: 8,
              borderRadius: 50,
              position: 'relative',
            }}
          >
            <Feather name="bell" size={24} color="#FFF" />
            <View
              style={{
                position: 'absolute',
                right: 6,
                top: 6,
                backgroundColor: '#FF4444',
                width: 13,
                height: 13,
                borderRadius: 50,
                borderWidth: 2,
                borderColor: '#121214',
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchContainer} onPress={handleSearchPress} activeOpacity={0.7}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar..."
            placeholderTextColor="#666"
            selectionColor="#fff"
          />
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        </TouchableOpacity>

        {/* Category Icons */}
        <View style={styles.categoryContainer}>
          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => {
              router.push({
                pathname: '/categories/[id]',
                params: {
                  id: 17,
                  documentId: 'fwubsstwm950034zmd6dnt8r',
                  name: 'Design',
                },
              });
            }}
          >
            <View style={styles.iconContainer}>
              <Feather name="pen-tool" size={20} color="#FFF" />
            </View>
            <Text style={styles.categoryText}>Design</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => {
              router.push({
                pathname: '/categories/[id]',
                params: {
                  id: 35,
                  documentId: 'unz4bv8reqwncrv34zed36zb',
                  name: 'Tecnologia',
                },
              });
            }}
          >
            <View style={styles.iconContainer}>
              <Feather name="monitor" size={20} color="#FFF" />
            </View>
            <Text style={styles.categoryText}>Tecnologia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => {
              router.push({
                pathname: '/categories/[id]',
                params: {
                  id: 33,
                  documentId: 'f2tnfg0q70l17lob34ll8w87',
                  name: 'Saude',
                },
              });
            }}
          >
            <View style={styles.iconContainer}>
              <Feather name="heart" size={20} color="#FFF" />
            </View>
            <Text style={styles.categoryText}>Saúde</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryItem} onPress={() => router.push('/categories')}>
            <View style={styles.iconContainer}>
              <Feather name="grid" size={20} color="#FFF" />
            </View>
            <Text style={styles.categoryText}>Ver Mais</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Course Section */}
        <View style={styles.courseSection}>
          <Text style={styles.sectionTitle}>Continuar curso</Text>

          <View style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <Image source={{ uri: 'https://via.placeholder.com/40' }} style={styles.profileImage} />
              <View style={styles.courseHeaderInfo}>
                <Text style={styles.instructorName}>Lívia Donin</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.starIcon}>★</Text>
                  <Text style={styles.ratingText}>4,5</Text>
                </View>
              </View>
            </View>

            <Text style={styles.courseTitle}>Entrepreneurship and New Venture Creation</Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>1/5 Module</Text>
                <Text style={styles.progressText}>10%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '10%' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Courses in Progress */}
        <View style={styles.coursesInProgress}>
          <View style={styles.coursesHeader}>
            <Text style={styles.sectionTitle}>Cursos em andamento</Text>
            <TouchableOpacity>
              <Text style={styles.verTodos}>VER TODOS</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.coursesList}>
            <TouchableOpacity style={styles.courseItem}>
              <Image source={{ uri: 'https://via.placeholder.com/60' }} style={styles.courseImage} />
              <View style={styles.courseInfo}>
                <Text style={styles.courseCategory}>Design</Text>
                <Text style={styles.courseItemTitle}>Principles of Industri...</Text>
                <Text style={styles.moduleCount}>7/10 Modulos</Text>
              </View>
              <Text style={styles.percentageText}>70%</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.courseItem}>
              <Image source={{ uri: 'https://via.placeholder.com/60' }} style={styles.courseImage} />
              <View style={styles.courseInfo}>
                <Text style={styles.courseCategory}>Programação</Text>
                <Text style={styles.courseItemTitle}>HTML & CSS: Building...</Text>
                <Text style={styles.moduleCount}>4/14 Modulos</Text>
              </View>
              <Text style={styles.percentageText}>70%</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Popular Courses */}
        <View style={styles.popularCoursesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cursos mais populares</Text>
            <TouchableOpacity>
              <Text style={styles.verTodos}>VER TODOS</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.popularCoursesList}>
            {loadingCourses ? (
              // Loading placeholder
              <View style={styles.popularCourseCard}>
                <View style={[styles.popularCourseImage, { backgroundColor: '#29292E' }]} />
                <View style={styles.popularCourseInfo}>
                  <View style={[styles.courseCategory, { width: 100, height: 20, backgroundColor: '#29292E' }]} />
                  <View
                    style={[
                      styles.popularCourseTitle,
                      { width: 200, height: 20, backgroundColor: '#29292E', marginTop: 8 },
                    ]}
                  />
                </View>
              </View>
            ) : (
              popularCourses.map((course) => (
                <TouchableOpacity key={course.id} style={styles.popularCourseCard}>
                  {course.picture ? (
                    <Image source={{ uri: course.picture.formats.small.url }} style={styles.popularCourseImage} />
                  ) : (
                    <View
                      style={[
                        styles.popularCourseImage,
                        { backgroundColor: '#29292E', justifyContent: 'center', alignItems: 'center' },
                      ]}
                    >
                      <Feather name="image" size={24} color="#666" />
                    </View>
                  )}

                  <View style={styles.courseLevelBadge}>
                    <Text style={styles.courseLevelText}>Intermediário</Text>
                  </View>

                  <View style={styles.courseRatingBadge}>
                    <Text style={styles.starIcon}>★</Text>
                    <Text style={styles.ratingText}>{course.rating_avg}</Text>
                  </View>

                  <View style={styles.popularCourseInfo}>
                    {course.subjects && course.subjects[0] && (
                      <Text style={styles.courseCategory}>{course.subjects[0].name}</Text>
                    )}

                    <Text style={styles.popularCourseTitle} numberOfLines={2}>
                      {course.title}
                    </Text>

                    <View style={styles.instructorInfo}>
                      <Image source={{ uri: 'https://via.placeholder.com/24' }} style={styles.instructorAvatar} />
                      <Text style={styles.instructorName}>
                        {course.author ? course.author.slice(0, 5) + '...' : 'Instrutor'}
                      </Text>
                      <View style={styles.courseStats}>
                        <Feather name="book" size={12} color="#FFF" />
                        <Text style={styles.statsText}>12 módulos</Text>
                        <Feather name="users" size={12} color="#FFF" />
                        <Text style={styles.statsText}>3.8K inscritos</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    padding: 25,
    paddingEnd: 25,
    paddingStart: 25,
  },
  popularCoursesSection: {
    marginVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  popularCoursesList: {
    marginHorizontal: -25,
    paddingHorizontal: 25,
  },
  popularCourseCard: {
    width: 280,
    backgroundColor: '#29292E',
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
  },
  popularCourseImage: {
    width: '100%',
    height: 140,
  },
  courseLevelBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(41, 41, 46, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  courseLevelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  courseRatingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(41, 41, 46, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  popularCourseInfo: {
    padding: 16,
  },
  popularCourseTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 8,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  instructorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.7,
    marginRight: 8,
  },
  courseCategory: {
    color: '#1fa2df',
    fontSize: 14,
    fontWeight: '500',
  },
  instructorName: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.7,
  },
  starIcon: {
    color: '#1fa2df',
    marginRight: 4,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  coursesInProgress: {
    marginVertical: 24,
  },
  coursesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  coursesList: {
    gap: 12,
  },
  courseItem: {
    flexDirection: 'row',
    backgroundColor: '#29292E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  courseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
    gap: 4,
  },
  courseItemTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  moduleCount: {
    color: '#FFF',
    opacity: 0.7,
    fontSize: 12,
  },
  percentageText: {
    color: '#1fa2df',
    fontSize: 16,
    fontWeight: '600',
  },
  mentoresSection: {
    marginTop: 24,
  },
  mentoresHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 0,
    fontFamily: 'ManropeBold',
  },
  verTodos: {
    color: '#1fa2df',
    fontSize: 14,
    fontWeight: '500',
  },
  mentorCard: {
    backgroundColor: '#29292E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  mentorInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  mentorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  mentorDetails: {
    flex: 1,
  },
  mentorName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  mentorArea: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  mentorStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#FFF',
    fontSize: 14,
  },
  statSubtext: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.7,
  },
  seguirButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  seguirButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  pointsCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  pointsLabel: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.7,
  },
  pointsValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
  },
  pointsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
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
  searchContainer: {
    backgroundColor: '#202024',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontFamily: 'ManropeRegular',
  },
  searchIcon: {
    marginRight: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryItem: {
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#29292E',
    padding: 12,
    borderRadius: 50,
    marginBottom: 8,
  },
  categoryText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'ManropeRegular',
  },
  courseSection: {
    flex: 1,
  },
  courseCard: {
    backgroundColor: '#29292E',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  courseHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  progressContainer: {
    gap: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: '#FFF',
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1fa2df',
    borderRadius: 4,
  },
});
