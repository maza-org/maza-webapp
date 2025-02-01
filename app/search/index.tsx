import { StyleSheet, TextInput, Pressable, Image, ImageSourcePropType, SafeAreaView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface SearchTagProps {
  label: string;
  onRemove: () => void;
}

interface CategoryButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

interface MentorCardProps {
  image: ImageSourcePropType;
  name: string;
  title: string;
  rating: number;
  reviews: string;
}

interface RecentSearch {
  id: string;
  label: string;
}

interface Category {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

interface Mentor {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviews: string;
}

const SearchTag = ({ label, onRemove }: SearchTagProps) => (
  <View style={styles.searchTag}>
    <Text style={styles.searchTagText}>{label}</Text>
    <Pressable onPress={onRemove}>
      <Ionicons name="close" size={16} color="#fff" />
    </Pressable>
  </View>
);

const CategoryButton = ({ icon, label }: CategoryButtonProps) => (
  <Pressable style={styles.categoryButton}>
    <Ionicons name={icon} size={20} color="#00B7FF" />
    <Text style={styles.categoryButtonText}>{label}</Text>
  </Pressable>
);

const MentorCard = ({ image, name, title, rating, reviews }: MentorCardProps) => (
  <Pressable style={styles.mentorCard}>
    <Image source={image} style={styles.mentorImage} />
    <View style={styles.mentorInfo}>
      <Text style={styles.mentorName}>{name}</Text>
      <Text style={styles.mentorTitle}>{title}</Text>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={styles.ratingText}>{rating}</Text>
        <Text style={styles.reviewsText}>({reviews} reviews)</Text>
      </View>
    </View>
  </Pressable>
);

export default function Search(): JSX.Element {
  const handleBackPress = () => {
    router.back();
  };
  const recentSearches: RecentSearch[] = [
    { id: '1', label: 'Business' },
    { id: '2', label: 'development' },
    { id: '3', label: 'technology' },
    { id: '4', label: 'UI/UX Designer' },
  ];

  const categories: Category[] = [
    { id: '1', icon: 'brush', label: 'Design' },
    { id: '2', icon: 'laptop', label: 'Tecnologia' },
    { id: '3', icon: 'heart', label: 'Saúde e Bem-estar' },
    { id: '4', icon: 'cash', label: 'Finanças' },
  ];

  const mentors: Mentor[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      title: 'Leadership',
      rating: 4.8,
      reviews: '1.8k',
    },
    {
      id: '2',
      name: 'Michael Chen',
      title: 'Data Science',
      rating: 4.3,
      reviews: '800',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Pesquisar</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Pesquisar cursos" placeholderTextColor="#666" />
        <Ionicons name="search" size={20} color="#666" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Últimas pesquisas</Text>
        <View style={styles.tagsContainer}>
          {recentSearches.map((search) => (
            <SearchTag key={search.id} label={search.label} onRemove={() => {}} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pesquisar por categoria</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <CategoryButton key={category.id} icon={category.icon} label={category.label} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    padding: 16,
    paddingStart: 16,
    paddingEnd: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    marginRight: 16,
    borderStyle: 'solid',
    borderColor: '#b3b3b3',
    borderWidth: 0.5,
    padding: 8,
    borderRadius: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
    marginRight: 8,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8F8F8F',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: 'transparent',
  },
  searchTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#29292E',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchTagText: {
    color: '#fff',
    fontSize: 14,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: 'transparent',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202024',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  mentorsContainer: {
    gap: 12,
    backgroundColor: 'transparent',
  },
  mentorCard: {
    flexDirection: 'row',
    backgroundColor: '#202024',
    borderRadius: 8,
    padding: 12,
  },
  mentorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  mentorInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mentorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  mentorTitle: {
    fontSize: 14,
    color: '#8F8F8F',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  ratingText: {
    fontSize: 14,
    color: '#fff',
  },
  reviewsText: {
    fontSize: 14,
    color: '#8F8F8F',
  },
});
