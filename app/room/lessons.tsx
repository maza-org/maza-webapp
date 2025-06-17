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
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { baseUrl } from '@/services/api';

export interface Content {
  id: number;
  title: string;
  format: string;
  youtubeID: string;
  url: string;
  description: string | null;
}

interface Certificate {
  createdAt: string;
  id: number;
  documentId: string;
  course: {
    id: number;
    documentId: string;
    title: string;
    author: string;
    rating_avg: number;
    subscribed: number;
  };
  user: {
    id: number;
    documentId: string;
    email: string;
    phone: string;
  };
}

export interface Module {
  id: number;
  title: string;
  quiz: any;
  description: string;
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
  description?: string;
  level?: 'Básico' | 'Intermédio' | 'Avançado';
}

interface TabProps {
  active: boolean;
  onPress: () => void;
  children: string;
}

export default function CourseDetail() {
  const [activeTab, setActiveTab] = useState<'lessons' | 'opinions'>('lessons');
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isInProgress, setIsInProgress] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { documentId } = useLocalSearchParams();

  // Inline Level Badge Component
  type Level = 'Básico' | 'Intermédio' | 'Avançado';

  type LevelMapType = {
    [key in Level]: string;
  };

  type LevelColorType = {
    [key in Level]: string;
  };

  interface LevelBadgeProps {
    level?: Level;
  }

  const LevelBadge = ({ level = 'Básico' }: LevelBadgeProps) => {
    // Define colors for each level
    const levelColors: LevelColorType = {
      Básico: '#4db5ff',
      Intermédio: '#ffa500',
      Avançado: '#ff4d4d',
    };

    const dotColor = levelColors[level] || '#ffa500';

    return (
      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>{level}</Text>
        <View style={[styles.levelDot, { backgroundColor: dotColor }]} />
      </View>
    );
  };

  // Inline Tab Component
  function Tab({ active, onPress, children }: TabProps) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.tab, active && styles.activeTab]}>
        <Text style={[styles.tabText, active && styles.activeTabText]}>{children}</Text>
      </TouchableOpacity>
    );
  }

  // Toggle menu visibility
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuOption = (option: string) => {
    switch (option) {
      case 'certificate':
        // Check if this course has a certificate
        const certificate = certificates.find((cert) => cert.course.documentId === documentId);
        if (certificate) {
          router.push({
            pathname: '/user/certificate',
            params: { certificateId: certificate.documentId },
          });
        } else {
          Alert.alert('Certificado não disponível', 'Você ainda não tem um certificado para este curso.');
        }
        break;
      case 'report':
        Alert.alert('Reportar', 'Reportar um problema com este curso');
        // Implement report bug functionality here
        break;
      default:
        break;
    }
    setMenuVisible(false);
  };

  const checkCourseProgress = async () => {
    if (!user?.token) return;
    try {
      const response = await fetch(`${baseUrl}/user-courses?status=InProgress`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsInProgress(data.data.some((course: any) => course.course.documentId === documentId));
      }
    } catch (error) {
      console.error('Erro ao verificar progresso do curso:', error);
    }
  };

  const initializeData = async () => {
    try {
      await checkCourseProgress();
    } catch (error) {
      console.error('Erro ao inicializar dados:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      Alert.alert('Erro', 'Falha ao carregar dados do utilizador');
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await fetch(`${baseUrl}/certificates`);
      const data = await response.json();
      setCertificates(data);
    } catch (error) {
      console.error('Erro ao buscar certificados:', error);
    }
  };

  const fetchCourseData = async () => {
    try {
      const response = await fetch(`${baseUrl}/courses/${documentId}`);
      const data = await response.json();
      setCourseData(data);
    } catch (error) {
      console.error('Erro ao buscar dados do curso:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user?.token) {
      Alert.alert('Erro', 'Para marcar um curso como favorito é necessário que tenha feito o login');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          courseId: documentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao adicionar aos favoritos');
      }

      setIsFavorite(true);
    } catch (error) {
      console.error('Erro ao adicionar aos favoritos:', error);
      Alert.alert('Erro', 'Falha ao adicionar aos favoritos');
    }
  };

  const handleStartCourse = async () => {
    if (!user?.token) {
      Alert.alert('Erro', 'Para marcar um curso como favorito é necessário que tenha feito o login');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/user-courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          courseId: documentId,
          status: 'InProgress',
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao começar curso');
      }

      router.push(`/path?courseId=${documentId}`);
    } catch (error) {
      console.error('Erro ao iniciar curso:', error);
      Alert.alert('Erro', 'Falha ao iniciar o curso');
    }
  };

  // Toggle description expand/collapse
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadUserData();
        await fetchCourseData();
        await checkCourseProgress();
        await fetchCertificates();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados do curso');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [documentId, user?.token]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2EA8FF" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
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

  function handleStartQuiz(content: Quiz, isFinalTest = false) {
    const params: {
      content: string;
      isFinalTest?: string | undefined;
    } = {
      content: JSON.stringify(content),
      isFinalTest: undefined,
    };

    if (isFinalTest) {
      params.isFinalTest = JSON.stringify(true);
    }

    router.push({
      pathname: '/room/quiz',
      params: params,
    });
  }

  function handleOnPathPress() {
    router.push({
      pathname: '/missions',
      params: {
        course: JSON.stringify(courseData),
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
                <TouchableOpacity style={styles.iconButton} onPress={handleFavorite}>
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFavorite ? '#ff0000' : '#FFF'}
                  />
                </TouchableOpacity>
                <View>
                  <TouchableOpacity style={styles.iconButton} onPress={toggleMenu}>
                    <Entypo name="dots-three-horizontal" size={24} color="#fff" />
                  </TouchableOpacity>

                  {menuVisible && (
                    <View style={styles.menuContainer}>
                      <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('certificate')}>
                        <Text style={styles.menuItemText}>Certificado</Text>
                      </TouchableOpacity>

                      {/*<TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('report')}>*/}
                      {/*  <Text style={styles.menuItemText}>Reportar Problema</Text>*/}
                      {/*</TouchableOpacity>*/}
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Level Badge Component */}
            <LevelBadge level={courseData?.level || 'Intermédio'} />
          </View>
        </ImageBackground>

        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{courseData.title}</Text>
          <View style={styles.instructor}>
            <Text style={styles.instructorName}>{courseData.author}</Text>
            <Text style={styles.categoryTag}>• {courseData.subjects[0]?.name || ''}</Text>
            <TouchableOpacity style={styles.pathButton} onPress={handleOnPathPress}>
              <AntDesign name="fork" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Course Description Section */}
          {courseData.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText} numberOfLines={showFullDescription ? undefined : 3}>
                {courseData.description}
              </Text>
              <TouchableOpacity onPress={toggleDescription} style={styles.viewMoreButton}>
                <Text style={styles.viewMoreText}>{showFullDescription ? 'Ver menos' : 'Ver mais'}</Text>
              </TouchableOpacity>
            </View>
          )}

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
                  <TouchableOpacity
                    style={styles.moduleItem}
                    onPress={() => handleStartQuiz(courseData.final_test, true)}
                  >
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

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startButton, updating && styles.startButtonDisabled, isInProgress && styles.continueButton]}
          onPress={handleStartCourse}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={[styles.startButtonText, isInProgress && styles.continueButton]}>
              {isInProgress ? 'Continuar' : 'Iniciar Curso'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  menuContainer: {
    position: 'absolute',
    right: 0,
    top: 45,
    backgroundColor: '#202024',
    borderRadius: 8,
    padding: 8,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#323238',
  },
  menuItemText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 12,
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
    marginRight: 8,
  },
  pathButton: {
    backgroundColor: '#1fa2df',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 6,
  },
  pathButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 16,
    borderRadius: 8,
  },
  descriptionText: {
    color: '#E1E1E6',
    fontSize: 14,
    lineHeight: 22,
  },
  viewMoreButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  viewMoreText: {
    color: '#1fa2df',
    fontSize: 14,
    fontWeight: '500',
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
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 5,
    paddingHorizontal: 24,
    borderRadius: 50,
    position: 'absolute',
    bottom: 5,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#121214',
    marginRight: 8,
  },
  levelDot: {
    width: 15,
    height: 15,
    borderRadius: 10,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
});
