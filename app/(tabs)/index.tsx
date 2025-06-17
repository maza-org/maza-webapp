import { Course } from '@/types/course';
import useUser from '@/hooks/useUser';
import Shimmer from '@/components/Shimmer';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import HomepageCategories from '@/components/HomepageCategories';
import { baseUrl } from '@/services/api';

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const { data: user, isLoading, error } = useUser();
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [popularCourses, setPopularCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [userCourses, setUserCourses] = useState([]);
  const [loadingUserCourses, setLoadingUserCourses] = useState(true);
  const [newCourses, setNewCourses] = useState([]);
  const [loadingNewCourses, setLoadingNewCourses] = useState(true);
  const [suggestedCourses, setSuggestedCourses] = useState([]);
  const [loadingSuggestedCourses, setLoadingSuggestedCourses] = useState(true);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    fetchSubjects();
    fetchPopularCourses();
    fetchNewCourses();
    fetchSuggestedCourses();
    if (user?.token) {
      fetchUserCourses();
    }
  }, [user?.token]);

  async function fetchUserCourses() {
    try {
      const response = await fetch(`${baseUrl}/user-courses?status=InProgress`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = await response.json();
      // Explicitly sort by updatedAt in descending order to get the most recently updated course first
      const sortedCourses = [...data.data].sort((a, b) => {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      });
      setUserCourses(sortedCourses);
      setLoadingUserCourses(false);
    } catch (error) {
      console.error('Error fetching user courses:', error);
      setLoadingUserCourses(false);
    }
  }

  async function fetchSubjects() {
    try {
      const response = await fetch(`${baseUrl}/courses`);
      const data = await response.json();

      const allSubjects = data.data.flatMap((course) => course.subjects);
      const uniqueSubjects = Array.from(new Map(allSubjects.map((subject) => [subject.id, subject])).values());

      setSubjects(uniqueSubjects.slice(0, 3));
      setLoadingSubjects(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setLoadingSubjects(false);
    }
  }

  async function fetchPopularCourses() {
    try {
      const response = await fetch(`${baseUrl}/courses?sort=subscribed%3Adesc&pageSize=15&page=1`);
      const data = await response.json();
      setPopularCourses(data.data);
      setLoadingCourses(false);
    } catch (error) {
      console.error('Error fetching popular courses:', error);
      setLoadingCourses(false);
    }
  }

  async function fetchNewCourses() {
    try {
      const response = await fetch(`${baseUrl}/courses?sort=publishedAt%3Adesc&pageSize=10&page=1`);
      const data = await response.json();
      setNewCourses(data.data);
      setLoadingNewCourses(false);
    } catch (error) {
      console.error('Error fetching new courses:', error);
      setLoadingNewCourses(false);
    }
  }

  async function fetchSuggestedCourses() {
    try {
      // Fetch courses for suggestions - you could customize this endpoint based on user preferences
      // For this example, we're using the same endpoint as new courses but could be customized
      const response = await fetch(`${baseUrl}/courses?sort=rating_avg%3Adesc&pageSize=10&page=1`);
      const data = await response.json();

      // Filter out courses based on some criteria (e.g., high rating + specific subjects)
      const filtered = data.data.filter(
        (course) =>
          course.rating_avg >= 4 &&
          // Optional: filter by specific subjects
          // (course.subjects?.some(subject => ["Saúde", "Tecnologia"].includes(subject.name)) || false)
          true
      );

      setSuggestedCourses(filtered);
      setLoadingSuggestedCourses(false);
    } catch (error) {
      console.error('Error fetching suggested courses:', error);
      setLoadingSuggestedCourses(false);
    }
  }

  function handleSearchPress() {
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    router.push('/search');
  }

  function handleOnPressPopularCourse(course: Course) {
    router.push({
      pathname: '/room/lessons',
      params: {
        documentId: course.documentId,
      },
    });
  }

  function handleOnPressPopularCourses() {
    router.push({
      pathname: '/categories/[id]',
      params: {
        type: 'popular',
        name: 'Cursos Populares',
        id: 0,
      },
    });
  }

  function handleOnPressNewCourses() {
    router.push({
      pathname: '/categories/[id]',
      params: {
        type: 'new',
        name: 'Cursos Recentes',
        id: 0,
      },
    });
  }

  function handleOnPressSuggestedCourses() {
    router.push({
      pathname: '/categories/[id]',
      params: {
        type: 'suggested',
        name: 'Cursos Sugeridos',
        id: 0,
      },
    });
  }

  function handleOnInProgressCoursePress(course: Course) {
    router.push({
      pathname: '/room/lessons',
      params: {
        documentId: course.documentId,
      },
    });
  }

  function handleOnOpenCoursesInProgress() {
    router.push('/(tabs)/courses');
  }

  const PopularCoursesShimmer = () => (
    <View style={styles.popularCourseCard}>
      <Shimmer style={styles.popularCourseImageShimmer}>
        <View style={{ width: '100%', height: 140, backgroundColor: '#29292E' }} />
      </Shimmer>

      <View style={styles.popularCourseInfo}>
        <Shimmer style={{ width: 80, height: 20, marginBottom: 8 }}>
          <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E' }} />
        </Shimmer>

        <Shimmer style={{ height: 40, marginBottom: 12 }}>
          <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E' }} />
        </Shimmer>

        <View style={styles.instructorInfo}>
          <Shimmer style={{ width: 24, height: 24, borderRadius: 12 }}>
            <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E', borderRadius: 12 }} />
          </Shimmer>

          <Shimmer style={{ width: 80, height: 16 }}>
            <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E' }} />
          </Shimmer>

          <Shimmer style={{ width: 60, height: 16 }}>
            <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E' }} />
          </Shimmer>
        </View>
      </View>
    </View>
  );

  const CourseInProgressShimmer = () => (
    <View style={styles.courseItem}>
      <Shimmer style={{ width: 60, height: 60, borderRadius: 8, marginRight: 12 }}>
        <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E', borderRadius: 8 }} />
      </Shimmer>

      <View style={styles.courseInfo}>
        <Shimmer style={{ width: 100, height: 16, marginBottom: 4 }}>
          <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E' }} />
        </Shimmer>

        <Shimmer style={{ width: '80%', height: 20, marginBottom: 4 }}>
          <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E' }} />
        </Shimmer>

        <Shimmer style={{ width: 60, height: 14 }}>
          <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E' }} />
        </Shimmer>
      </View>

      <Shimmer style={{ width: 40, height: 20 }}>
        <View style={{ width: '100%', height: '100%', backgroundColor: '#29292E' }} />
      </Shimmer>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity
          style={styles.header}
          onPress={() => {
            router.push('/start/photo');
          }}
        >
          <Text style={styles.headerText}>O que pretende aprender hoje?</Text>
        </TouchableOpacity>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchContainer} onPress={handleSearchPress} activeOpacity={0.7}>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Pesquisar..."
            placeholderTextColor="#666"
            selectionColor="#fff"
            onFocus={handleSearchPress}
          />
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        </TouchableOpacity>

        {/* Category Icons */}
        <HomepageCategories />

        {/* Continue Course Section */}
        {user?.token && !loadingUserCourses && userCourses.length > 0 && (
          <View style={styles.courseSection}>
            <Text style={styles.sectionTitle}>Continuar curso</Text>

            <TouchableOpacity
              style={styles.courseCard}
              onPress={() => handleOnInProgressCoursePress(userCourses[0]?.course)}
            >
              <View style={styles.courseHeader}>
                {userCourses[0].course.picture ? (
                  <Image
                    source={{ uri: userCourses[0].course.picture.formats.thumbnail.url }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View
                    style={[
                      styles.profileImage,
                      { backgroundColor: '#29292E', justifyContent: 'center', alignItems: 'center' },
                    ]}
                  >
                    <Feather name="user" size={20} color="#666" />
                  </View>
                )}
                <View style={styles.courseHeaderInfo}>
                  <Text style={styles.instructorName}>{userCourses[0].course.author}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.starIcon}>★</Text>
                    <Text style={styles.ratingText}>{userCourses[0].course.rating_avg}</Text>
                  </View>
                </View>
              </View>

              <Image
                source={{ uri: userCourses[0]?.course?.cover?.formats?.thumbnail?.url }}
                style={styles.coverImage}
              />

              <Text style={styles.courseTitle}>{userCourses[0].course.title}</Text>

              <View style={styles.progressContainer}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>Progresso</Text>
                  <Text style={styles.progressText}>{userCourses[0].progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${userCourses[0].progress}%` }]} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Courses in Progress */}
        {user?.token && !loadingUserCourses && userCourses.length > 1 && (
          <View style={styles.coursesInProgress}>
            <View style={styles.coursesHeader}>
              <Text style={styles.sectionTitle}>Cursos em andamento</Text>
              <TouchableOpacity onPress={handleOnOpenCoursesInProgress}>
                <Text style={styles.verTodos}>VER TODOS</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.coursesList}>
              {userCourses.slice(1).map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={styles.courseItem}
                  onPress={() => handleOnInProgressCoursePress(course?.course)}
                >
                  {course.course.picture ? (
                    <Image source={{ uri: course.course.picture.formats.thumbnail.url }} style={styles.courseImage} />
                  ) : (
                    <View
                      style={[
                        styles.courseImage,
                        { backgroundColor: '#29292E', justifyContent: 'center', alignItems: 'center' },
                      ]}
                    >
                      <Feather name="image" size={20} color="#666" />
                    </View>
                  )}
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseCategory}>{course.course.author}</Text>
                    <Text style={styles.courseItemTitle}>{course.course.title}</Text>
                    <Text style={styles.moduleCount}>Progresso</Text>
                  </View>
                  <Text style={styles.percentageText}>{course.progress}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Suggested Courses Section */}
        <View style={styles.suggestedCoursesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cursos sugeridos</Text>
            <TouchableOpacity onPress={handleOnPressSuggestedCourses}>
              <Text style={styles.verTodos}>VER TODOS</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestedCoursesList}>
            {loadingSuggestedCourses
              ? [1, 2, 3].map((key) => <PopularCoursesShimmer key={key} />)
              : suggestedCourses.map((course: Course) => (
                  <TouchableOpacity
                    key={course.id}
                    style={styles.popularCourseCard}
                    onPress={() => handleOnPressPopularCourse(course)}
                  >
                    {course.picture ? (
                      <Image source={{ uri: course?.picture?.formats?.small?.url }} style={styles.popularCourseImage} />
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

                    <View style={styles.courseRecommendedBadge}>
                      <Feather name="thumbs-up" size={12} color="#FFF" style={{ marginRight: 4 }} />
                      <Text style={styles.recommendedBadgeText}>RECOMENDADO</Text>
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
                        <Image
                          source={{ uri: course?.picture?.formats?.thumbnail?.url }}
                          style={styles.instructorAvatar}
                        />
                        <Text style={styles.instructorName}>
                          {course.author ? course.author.slice(0, 5) + '...' : 'Instrutor'}
                        </Text>
                        <View style={styles.courseStats}>
                          <Feather name="users" size={12} color="#FFF" />
                          <Text style={styles.statsText}>
                            {course.subscribed >= 1000
                              ? `${(course.subscribed / 1000).toFixed(1)}k`
                              : course.subscribed}{' '}
                            inscritos
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
          </ScrollView>
        </View>

        {/* New Courses Section */}
        <View style={styles.newCoursesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cursos recentes</Text>
            <TouchableOpacity onPress={handleOnPressNewCourses}>
              <Text style={styles.verTodos}>VER TODOS</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.newCoursesList}>
            {loadingNewCourses
              ? [1, 2, 3].map((key) => <PopularCoursesShimmer key={key} />)
              : newCourses.map((course: Course) => (
                  <TouchableOpacity
                    key={course.id}
                    style={styles.popularCourseCard}
                    onPress={() => handleOnPressPopularCourse(course)}
                  >
                    {course.picture ? (
                      <Image source={{ uri: course?.picture?.formats?.small?.url }} style={styles.popularCourseImage} />
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

                    <View style={styles.courseBadge}>
                      <Feather name="clock" size={12} color="#FFF" style={{ marginRight: 4 }} />
                      <Text style={styles.newBadgeText}>NOVO</Text>
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
                        <Image
                          source={{ uri: course?.picture?.formats?.thumbnail?.url }}
                          style={styles.instructorAvatar}
                        />
                        <Text style={styles.instructorName}>
                          {course.author ? course.author.slice(0, 5) + '...' : 'Instrutor'}
                        </Text>
                        <View style={styles.courseStats}>
                          <Feather name="users" size={12} color="#FFF" />
                          <Text style={styles.statsText}>
                            {course.subscribed >= 1000
                              ? `${(course.subscribed / 1000).toFixed(1)}k`
                              : course.subscribed}{' '}
                            inscritos
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
          </ScrollView>
        </View>

        {/* Popular Courses */}
        <View style={styles.popularCoursesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cursos populares</Text>
            <TouchableOpacity onPress={handleOnPressPopularCourses}>
              <Text style={styles.verTodos}>VER TODOS</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.popularCoursesList}>
            {loadingCourses
              ? [1, 2, 3].map((key) => <PopularCoursesShimmer key={key} />)
              : popularCourses.map((course: Course) => (
                  <TouchableOpacity
                    key={course.id}
                    style={styles.popularCourseCard}
                    onPress={() => handleOnPressPopularCourse(course)}
                  >
                    {course.picture ? (
                      <Image source={{ uri: course?.picture?.formats?.small?.url }} style={styles.popularCourseImage} />
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
                        <Image
                          source={{ uri: course?.picture?.formats?.thumbnail?.url }}
                          style={styles.instructorAvatar}
                        />
                        <Text style={styles.instructorName}>
                          {course.author ? course.author.slice(0, 5) + '...' : 'Instrutor'}
                        </Text>
                        <View style={styles.courseStats}>
                          <Feather name="users" size={12} color="#FFF" />
                          <Text style={styles.statsText}>
                            {course.subscribed >= 1000
                              ? `${(course.subscribed / 1000).toFixed(1)}k`
                              : course.subscribed}{' '}
                            inscritos
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
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
  scrollContainer: {
    ...(Platform.OS === 'web' ? { paddingHorizontal: 25, paddingVertical: 25 } : undefined),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  popularCoursesList: {
    ...(Platform.OS === 'web' ? { marginHorizontal: 0 } : { marginHorizontal: -25, paddingHorizontal: 25 }),
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
  coverImage: {
    width: '100%',
    height: 160,
    borderRadius: 5,
    marginBottom: 12,
  },
  popularCourseImageShimmer: {
    width: '100%',
    height: 140,
  },
  newCoursesSection: {
    marginVertical: 24,
  },
  newCoursesList: {
    ...(Platform.OS === 'web' ? { marginHorizontal: 0 } : { marginHorizontal: -25, paddingHorizontal: 25 }),
  },
  courseBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(31, 162, 223, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  newBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  suggestedCoursesSection: {
    marginVertical: 24,
  },
  suggestedCoursesList: {
    ...(Platform.OS === 'web' ? { marginHorizontal: 0 } : { marginHorizontal: -25, paddingHorizontal: 25 }),
  },
  courseRecommendedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  recommendedBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  courseSection: {
    marginVertical: 10,
  },
});
