import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Reviews from '@/components/Reviews';
import { Picture } from '@/types/course';

export interface Content {
  id: number;
  title: string;
  format: string;
  youtubeID: string;
  url: string;
  description: string | null;
}

export interface Module {
  id: number;
  title: string;
  quiz: any;
  contents: Content[];
}

interface Question {
  id: number;
  description: string;
  format: string;
  options: {
    id: number;
    description: string;
    comment: string | null;
    is_correct: boolean;
  }[];
}

export interface Quiz {
  id: number;
  pass_grade: number;
  questions: Question[];
}

interface Subject {
  id: number;
  documentId: string;
  name: string;
}

interface User {
  id: string;
  documentId: string;
  email: string;
  fullname: string;
  phone: string;
  yoma_id: string;
  token: string;
}

interface Course {
  id: number;
  documentId: string;
  title: string;
  author: string;
  rating_avg: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  subjects: Subject[];
  final_test: Quiz;
  modules: Module[];
  isFavorite?: boolean;
  cover: Picture;
}

interface TabProps {
  active: boolean;
  onPress: () => void;
  children: string;
}
function Tab({ active, onPress, children }: TabProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tab, active && styles.activeTab]}>
      <Text style={[styles.tabText, active && styles.activeTabText]}>{children}</Text>
    </TouchableOpacity>
  );
}

export default function CourseDetail() {
  const [activeTab, setActiveTab] = useState<'lessons' | 'opinions'>('lessons');
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isInProgress, setIsInProgress] = useState(false);

  const { documentId } = useLocalSearchParams();
  const checkCourseProgress = async () => {
    if (!user?.token) return;
    try {
      const response = await fetch(`https://maza-strapi-backend.onrender.com/api/user-courses?status=InProgress`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsInProgress(data.data.some((course: any) => course.course.documentId === documentId));
      }
    } catch (error) {
      console.error('Error checking course progress:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadUserData();
        await fetchCourseData();
        await checkCourseProgress();
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, [documentId, user?.token]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Erro', 'Falha ao carregar dados do utilizador');
    }
  };

  const fetchCourseData = async () => {
    try {
      const response = await fetch(`https://maza-strapi-backend.onrender.com/api/courses/${documentId}`);
      const data = await response.json();
      setCourseData(data);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoritePress = async () => {
    if (!user?.token) {
      Alert.alert('Erro', 'Você precisa estar logado para favoritar um curso');
      return;
    }

    try {
      const response = await fetch(`https://maza-strapi-backend.onrender.com/api/user-courses/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          data: {
            course: documentId,
          },
        }),
      });

      if (response.ok) {
        setIsFavorite(true);
      } else {
        throw new Error('Failed to add to favorites');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      Alert.alert('Erro', 'Falha ao adicionar aos favoritos');
    }
  };

  const handleStartCourse = async () => {
    if (isInProgress) {
      return;
    }
    if (!user?.token) {
      Alert.alert('Erro', 'Você precisa estar logado para iniciar o curso');
      return;
    }

    setUpdating(true);
    try {
      // First, save the course to user's courses
      const saveResponse = await fetch(`https://maza-strapi-backend.onrender.com/api/user-courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          data: {
            course: documentId,
          },
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save course');
      }

      const updateResponse = await fetch(`https://maza-strapi-backend.onrender.com/api/user-courses/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          data: {
            progress: 1,
          },
        }),
      });

      if (!updateResponse.ok) {
        const data = await updateResponse.json();
        console.log(JSON.stringify(data, null, 2));
        throw new Error('Erro ao começar curso');
      }
    } catch (error) {
      console.error('Error starting course:', error);
      Alert.alert('Erro', 'Falha ao iniciar o curso');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1fa2df" />
      </View>
    );
  }

  if (!courseData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao carregar curso</Text>
      </View>
    );
  }

  function handlePlayModule(module: Module) {
    router.push({
      pathname: '/room/watch',
      params: {
        module: JSON.stringify(module),
        author: courseData?.author,
        title: courseData?.title,
        imageUrl: courseData?.cover?.formats?.thumbnail?.url,
      },
    });
  }

  function handleStartQuiz(content: Quiz) {
    router.push({
      pathname: '/room/quiz',
      params: {
        content: JSON.stringify(content),
      },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} stickyHeaderIndices={[1]}>
        <ImageBackground source={{ uri: courseData?.cover?.formats?.thumbnail?.url }} style={styles.header}>
          <View style={styles.headerOverlay}>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                <Feather name="chevron-left" size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.rightActions}>
                <TouchableOpacity style={styles.iconButton}>
                  <Feather name="share" size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={handleFavoritePress}>
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFavorite ? '#ff0000' : '#FFF'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{courseData.title}</Text>
          <View style={styles.instructor}>
            <Text style={styles.instructorName}>{courseData.author}</Text>
            <Text style={styles.categoryTag}>• {courseData.subjects[0]?.name || ''}</Text>
          </View>

          <View style={styles.tabContainer}>
            <Tab active={activeTab === 'lessons'} onPress={() => setActiveTab('lessons')}>
              Aulas
            </Tab>
            <Tab active={activeTab === 'opinions'} onPress={() => setActiveTab('opinions')}>
              Opiniões
            </Tab>
          </View>
        </View>

        {activeTab === 'lessons' ? (
          <View style={styles.modulesList}>
            {!courseData.modules || courseData.modules.length === 0 ? (
              <View style={styles.noModulesContainer}>
                <Feather name="book-open" size={48} color="#A8A8B3" style={styles.noModulesIcon} />
                <Text style={styles.noModulesText}>Nenhum módulo encontrado para este curso</Text>
              </View>
            ) : (
              <>
                {courseData.modules.map((module, index) => (
                  <TouchableOpacity key={module.id} style={styles.moduleItem} onPress={() => handlePlayModule(module)}>
                    <View style={styles.moduleContent}>
                      <View style={styles.moduleTopRow}>
                        <View style={styles.moduleInfo}>
                          <Text style={styles.moduleNumber}>{index + 1}.</Text>
                          <Text style={styles.moduleTitle}>{module.title}</Text>
                        </View>
                        <View style={styles.moduleDetails}>
                          <View style={styles.iconContainer}>
                            <Ionicons name="play" size={20} color="#4db5ff" />
                          </View>
                        </View>
                      </View>
                      <View style={styles.videoCount}>
                        <Feather name="film" size={14} color="#A8A8B3" />
                        <Text style={styles.videoCountText}>{module.contents.length} videos</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
                {courseData.final_test && (
                  <TouchableOpacity style={styles.moduleItem} onPress={() => handleStartQuiz(courseData.final_test)}>
                    <View style={styles.moduleContent}>
                      <View style={styles.moduleTopRow}>
                        <View style={styles.moduleInfo}>
                          <Text style={styles.moduleNumber}>Q.</Text>
                          <Text style={styles.moduleTitle}>Teste Final</Text>
                        </View>
                        <View style={styles.moduleDetails}>
                          <View style={styles.iconContainer}>
                            <Ionicons name="help-circle" size={20} color="#4db5ff" />
                          </View>
                        </View>
                      </View>
                      <View style={styles.videoCount}>
                        <Feather name="check-circle" size={14} color="#A8A8B3" />
                        <Text style={styles.videoCountText}>{courseData.final_test.questions.length} perguntas</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        ) : (
          <View style={styles.opinionsContainer}>
            <View style={styles.ratingOverview}>
              <Reviews courseId={documentId as string} />
            </View>
          </View>
        )}
      </ScrollView>

      {/*<View style={styles.footer}>*/}
      {/*  <TouchableOpacity*/}
      {/*    style={[styles.startButton, updating && styles.startButtonDisabled, isInProgress && styles.continueButton]}*/}
      {/*    onPress={handleStartCourse}*/}
      {/*    disabled={updating}*/}
      {/*  >*/}
      {/*    {updating ? (*/}
      {/*      <ActivityIndicator color="#FFF" />*/}
      {/*    ) : (*/}
      {/*      <Text style={[styles.startButtonText, isInProgress && styles.continueButton]}>*/}
      {/*        {isInProgress ? 'Continuar' : 'Iniciar Curso'}*/}
      {/*      </Text>*/}
      {/*    )}*/}
      {/*  </TouchableOpacity>*/}
      {/*</View>*/}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121214',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121214',
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: 200,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 24,
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    padding: 24,
    backgroundColor: '#121214',
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  instructor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructorName: {
    color: '#FFF',
    fontSize: 14,
  },
  categoryTag: {
    color: '#1fa2df',
    fontSize: 14,
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#323238',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1fa2df',
  },
  tabText: {
    color: '#A8A8B3',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1fa2df',
  },
  modulesList: {
    padding: 24,
  },
  moduleItem: {
    padding: 16,
    backgroundColor: '#202024',
    borderRadius: 15,
    marginBottom: 12,
  },
  moduleContent: {
    gap: 12,
  },
  moduleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  moduleNumber: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  moduleTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  moduleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#2a2d3e',
    borderRadius: 50,
    padding: 5,
  },
  videoCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginStart: 25,
  },
  videoCountText: {
    color: '#A8A8B3',
    fontSize: 12,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#323238',
  },
  startButton: {
    backgroundColor: '#1fa2df',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#1fa2df80',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'ManropeBold',
  },
  opinionsContainer: {},
  ratingOverview: {
    marginBottom: 24,
  },
  overallRating: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starIcon: {
    marginHorizontal: 2,
  },
  noModulesContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#202024',
    borderRadius: 15,
    marginVertical: 12,
  },
  noModulesText: {
    color: '#A8A8B3',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  noModulesIcon: {
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: '#1fa2df',
  },
});
