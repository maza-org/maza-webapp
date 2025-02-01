import {
  StyleSheet,
  Pressable,
  Animated,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useState, useRef, useEffect } from 'react';
import DailyScoreChart from '@/components/Daybar';
import Search from '@/components/Search';
import CourseItem from '@/components/CourseItem';
import FavoriteCoursesGrid from '@/components/FavoriteCoursesGrid';
import CoursesInProgress from '@/components/CourseInProgress';
import useUser from '@/hooks/useUser';

// RadioButton Component
const RadioButton = ({
  label,
  selected,
  onPress,
  animatedBg,
  animatedText,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  animatedBg: string;
  animatedText: string;
}) => (
  <Pressable style={[styles.radioButton, selected && { backgroundColor: animatedBg }]} onPress={onPress}>
    <Animated.Text
      style={[
        styles.radioButtonText,
        {
          color: animatedText,
        },
      ]}
    >
      {label}
    </Animated.Text>
  </Pressable>
);

// Floating Filter Button Component
const FloatingFilterButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable style={styles.floatingButton} onPress={onPress}>
    <Feather name="filter" size={16} color="#fff" style={styles.filterIcon} />
    <Text style={styles.filterText}>Filtrar</Text>
  </Pressable>
);

// CompletedCourses Component
const CompletedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompletedCourses();
  }, []);

  const fetchCompletedCourses = async () => {
    try {
      const response = await fetch('https://maza-strapi-backend.onrender.com/api/user-courses?status=Completed', {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzM3MTM0NjgzLCJleHAiOjE3Mzk3MjY2ODN9.vtnxuCe_Q2q2LiBvpZrMOINV0wZbqCUL5jcM4eUj7W8',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch completed courses');
      }

      const data = await response.json();
      setCourses(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8257E5" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-circle" size={48} color="#FF4444" />
        <Text style={styles.errorText}>Oops! Something went wrong</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCompletedCourses}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="book" size={48} color="#8F8F8F" />
        <Text style={styles.emptyText}>No completed courses yet</Text>
        <Text style={styles.emptySubtext}>Complete your first course to see it here</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.courseList}>
      {courses.map((courseData) => (
        <CourseItem
          key={courseData.id}
          title={courseData.course.title}
          instructor={courseData.course.author}
          progress={100}
          rating={courseData.course.rating_avg}
        />
      ))}
    </ScrollView>
  );
};

// Main Screen Component
export default function MeusCursosScreen() {
  const [selectedFilter, setSelectedFilter] = useState('inProgress');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const animationValue = useRef(new Animated.Value(0)).current;
  const buttonWidth = 100; // Approximate width of each button
  const { data: user } = useUser();
  console.log(JSON.stringify(user, null, 2));

  const getAnimatedPosition = () => {
    switch (selectedFilter) {
      case 'inProgress':
        return 0;
      case 'favorites':
        return buttonWidth;
      case 'completed':
        return buttonWidth * 2;
      default:
        return 0;
    }
  };

  useEffect(() => {
    Animated.spring(animationValue, {
      toValue: getAnimatedPosition(),
      useNativeDriver: false,
      friction: 20,
      tension: 150,
    }).start();
  }, [selectedFilter]);

  const animatedBg = animationValue.interpolate({
    inputRange: [0, buttonWidth, buttonWidth * 2],
    outputRange: ['#29292E', '#29292E', '#29292E'],
  });

  const animatedText = (buttonIndex: number) => {
    return animationValue.interpolate({
      inputRange: [buttonWidth * (buttonIndex - 0.5), buttonWidth * buttonIndex, buttonWidth * (buttonIndex + 0.5)],
      outputRange: ['#666', '#fff', '#666'],
      extrapolate: 'clamp',
    });
  };

  const handleFilterApply = (filters) => {
    console.log('Applied filters:', filters);
  };

  // Filter Modal Component
  const FilterModal = ({ visible, onClose, onApply }) => {
    const [selectedLevel, setSelectedLevel] = useState('Intermédio');
    const [selectedRating, setSelectedRating] = useState('4-5');

    return (
      <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar Cursos</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#8F8F8F" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Nível</Text>
              <View style={styles.filterOptionsRow}>
                <TouchableOpacity
                  style={[styles.filterOption, selectedLevel === 'Iniciante' && styles.filterOptionSelected]}
                  onPress={() => setSelectedLevel('Iniciante')}
                >
                  <Text
                    style={[styles.filterOptionText, selectedLevel === 'Iniciante' && styles.filterOptionTextSelected]}
                  >
                    Iniciante
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, selectedLevel === 'Intermédio' && styles.filterOptionSelected]}
                  onPress={() => setSelectedLevel('Intermédio')}
                >
                  <Text
                    style={[styles.filterOptionText, selectedLevel === 'Intermédio' && styles.filterOptionTextSelected]}
                  >
                    Intermédio
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, selectedLevel === 'Avançado' && styles.filterOptionSelected]}
                  onPress={() => setSelectedLevel('Avançado')}
                >
                  <Text
                    style={[styles.filterOptionText, selectedLevel === 'Avançado' && styles.filterOptionTextSelected]}
                  >
                    Avançado
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.filterOptionsRow}>
                <TouchableOpacity
                  style={[styles.filterOption, selectedLevel === 'MAZA' && styles.filterOptionSelected]}
                  onPress={() => setSelectedLevel('MAZA')}
                >
                  <Text style={[styles.filterOptionText, selectedLevel === 'MAZA' && styles.filterOptionTextSelected]}>
                    MAZA
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Avaliação</Text>
              <View style={styles.filterOptionsRow}>
                {['0-1', '1-2', '2-3'].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[styles.filterOption, selectedRating === rating && styles.filterOptionSelected]}
                    onPress={() => setSelectedRating(rating)}
                  >
                    <Ionicons
                      name="star"
                      size={16}
                      color={selectedRating === rating ? '#8257E5' : '#8F8F8F'}
                      style={styles.ratingIcon}
                    />
                    <Text
                      style={[styles.filterOptionText, selectedRating === rating && styles.filterOptionTextSelected]}
                    >
                      {rating}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.filterOptionsRow}>
                {['3-4', '4-5'].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[styles.filterOption, selectedRating === rating && styles.filterOptionSelected]}
                    onPress={() => setSelectedRating(rating)}
                  >
                    <Ionicons
                      name="star"
                      size={16}
                      color={selectedRating === rating ? '#8257E5' : '#8F8F8F'}
                      style={styles.ratingIcon}
                    />
                    <Text
                      style={[styles.filterOptionText, selectedRating === rating && styles.filterOptionTextSelected]}
                    >
                      {rating}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                onApply({ level: selectedLevel, rating: selectedRating });
                onClose();
              }}
            >
              <Text style={styles.applyButtonText}>Aplicar Filtro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Cursos</Text>
      </View>

      <Search />

      <View style={styles.radioGroup}>
        <Animated.View
          style={[
            styles.animatedSelection,
            {
              transform: [
                {
                  translateX: animationValue,
                },
              ],
            },
          ]}
        />
        <RadioButton
          label="Em andam..."
          selected={selectedFilter === 'inProgress'}
          onPress={() => setSelectedFilter('inProgress')}
          animatedText={animatedText(0)}
        />
        <RadioButton
          label="Favoritos"
          selected={selectedFilter === 'favorites'}
          onPress={() => setSelectedFilter('favorites')}
          animatedText={animatedText(1)}
        />
        <RadioButton
          label="Terminados"
          selected={selectedFilter === 'completed'}
          onPress={() => setSelectedFilter('completed')}
          animatedText={animatedText(2)}
        />
      </View>

      {selectedFilter === 'favorites' && <FavoriteCoursesGrid />}
      {selectedFilter === 'completed' && <CompletedCourses />}
      {selectedFilter === 'inProgress' && <CoursesInProgress />}

      <FloatingFilterButton onPress={() => setFilterModalVisible(true)} />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: '#121214',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 0,
  },
  maximizeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29292E',
    borderRadius: 6,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29292E',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#202024',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#202024',
    borderRadius: 999,
    padding: 4,
    position: 'relative',
  },
  radioButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: 'center',
    zIndex: 1,
  },
  animatedSelection: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    width: '33%',
    backgroundColor: '#29292E',
    borderRadius: 999,
    zIndex: 0,
  },
  radioButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#29292E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  filterIcon: {
    marginRight: 8,
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#29292E',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#29292E',
  },
  filterSection: {
    marginBottom: 24,
    backgroundColor: '#29292E',
  },
  filterSectionTitle: {
    fontSize: 16,
    color: '#8F8F8F',
    marginBottom: 16,
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    backgroundColor: '#29292E',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#29292E',
    gap: 4,
  },
  filterOptionSelected: {
    backgroundColor: 'rgba(130, 87, 229, 0.1)',
  },
  filterOptionText: {
    color: '#666',
    fontSize: 14,
  },
  filterOptionTextSelected: {
    color: '#8257E5',
  },
  applyButton: {
    backgroundColor: '#2EA8FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  courseList: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#121214',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#8F8F8F',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8F8F8F',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#8257E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
