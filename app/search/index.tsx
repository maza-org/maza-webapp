import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Course } from '@/types/course';

interface SearchResult {
  id: number;
  title: string;
  documentId: string;
  author: string;
  rating_avg: number;
  subscribed: number;
  subjects: Array<{
    id: number;
    name: string;
  }>;
  picture?: {
    formats?: {
      thumbnail?: {
        url: string;
      };
    };
  };
}

interface SearchResponse {
  data: SearchResult[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

const SearchTag = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <View style={styles.searchTag}>
    <Text style={styles.searchTagText}>{label}</Text>
    <Pressable onPress={onRemove}>
      <Ionicons name="close" size={16} color="#fff" />
    </Pressable>
  </View>
);

const CategoryButton = ({
  icon,
  label,
  category,
  handlePressCategory,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  category: { id: number; icon: string; label: string };
  handlePressCategory: (category: { id: number; label: string }) => void;
}) => (
  <TouchableOpacity
    style={styles.categoryButton}
    onPress={() => {
      handlePressCategory(category);
    }}
  >
    <Ionicons name={icon} size={20} color="#1fa2df" />
    <Text style={styles.categoryButtonText}>{label}</Text>
  </TouchableOpacity>
);

const CourseItem = ({ item, onPress }: { item: SearchResult; onPress: () => void }) => (
  <TouchableOpacity style={styles.courseResult} onPress={onPress}>
    <Image source={{ uri: item?.picture?.formats?.thumbnail?.url }} style={styles.courseImage} />
    <View style={styles.courseInfo}>
      <Text style={styles.courseCategory}>{item.subjects?.[0]?.name || item.author}</Text>
      <Text style={styles.courseTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <View style={styles.courseDetails}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating_avg ? item.rating_avg.toFixed(1) : 'N/A'}</Text>
        </View>
        <Text style={styles.subscriberText}>{item.subscribed} Inscritos</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultCount, setResultCount] = useState<number | null>(null);

  const handleBackPress = () => {
    router.back();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setResultCount(null);
  };

  const handleSearch = async (keyword: string) => {
    if (!keyword) {
      setResults([]);
      setResultCount(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/courses?keyword=${encodeURIComponent(keyword)}`);
      const data: SearchResponse = await response.json();
      setResults(data.data);
      setResultCount(data.meta.pagination.total);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 43, icon: 'brush', label: 'Design' },
    { id: 71, icon: 'laptop', label: 'Tecnologia' },
    { id: 69, icon: 'heart', label: 'Saúde e Bem-estar' },
    { id: 45, icon: 'cash', label: 'Finanças' },
  ];

  function handleOpenCourse(course: Course) {
    router.push({
      pathname: '/room/lessons',
      params: {
        documentId: course.documentId,
      },
    });
  }

  const renderItem = ({ item }: { item: SearchResult }) => (
    <CourseItem item={item} onPress={() => handleOpenCourse(item)} />
  );

  function handleCategoryPress(category: { id: number; label: string }) {
    router.push({
      pathname: '/categories/[id]',
      params: {
        id: category.id,
        name: category.label,
      },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Pesquisar</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar cursos"
          placeholderTextColor="#666"
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
            handleSearch(text);
          }}
        />
        {searchTerm ? (
          <Pressable onPress={handleClearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </Pressable>
        ) : (
          <Ionicons name="search" size={20} color="#666" />
        )}
      </View>

      {!searchTerm && (
        <>
          {/*<View style={styles.section}>*/}
          {/*  <Text style={styles.sectionTitle}>Últimas pesquisas</Text>*/}
          {/*  <View style={styles.tagsContainer}>*/}
          {/*    {recentSearches.map((search) => (*/}
          {/*      <SearchTag key={search.id} label={search.label} onRemove={() => {}} />*/}
          {/*    ))}*/}
          {/*  </View>*/}
          {/*</View>*/}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pesquisar por categoria</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <CategoryButton
                  key={category.id}
                  icon={category.icon as keyof typeof Ionicons.glyphMap}
                  label={category.label}
                  category={category}
                  handlePressCategory={handleCategoryPress}
                />
              ))}
            </View>
          </View>
        </>
      )}

      {searchTerm && resultCount !== null && (
        <>
          <Text style={styles.resultCount}>
            {resultCount} Resultados para "{searchTerm}"
          </Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8257E5" />
            </View>
          ) : (
            <FlatList
              data={results}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    padding: 25,
    paddingStart: 25,
    paddingEnd: 25,
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
    borderColor: '#333',
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
  clearButton: {
    padding: 4,
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
  resultCount: {
    fontSize: 16,
    color: '#8F8F8F',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121214',
  },
  flatListContent: {
    paddingTop: 8,
  },
  courseResult: {
    flexDirection: 'row',
    backgroundColor: '#29292E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  courseImage: {
    width: 64,
    height: 64,
    borderRadius: 6,
    marginRight: 16,
    backgroundColor: '#202024',
  },
  courseInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  courseCategory: {
    color: '#1fa2df',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  courseTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  courseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 12,
    marginLeft: 4,
  },
  subscriberText: {
    color: '#8F8F8F',
    fontSize: 11,
  },
});
