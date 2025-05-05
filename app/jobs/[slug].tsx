import {
  SafeAreaView,
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Linking,
} from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import HTML from 'react-native-render-html';
import { Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;

type Job = {
  id: number;
  filter_id: number;
  apply_through_filter: boolean;
  type: string;
  recommended: boolean;
  url: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  date_iso: string;
  locations: {
    id: number;
    slug: string;
    name: string;
  }[];
  categories: {
    id: number;
    slug: string;
    name: string;
  }[];
  tags: any[];
  expire_date: string;
  expired: boolean;
  address: string;
  company: {
    id: string;
    logo: string;
    url: string;
    name: string;
    slug: string;
    description: string;
  };
  meta: {
    language: {
      id: string;
      name: string;
    };
  };
  ext_apply_url: string;
};

export default function JobDetails() {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { slug } = useLocalSearchParams();

  useEffect(() => {
    if (slug) {
      fetchJobDetails();
    } else {
      setError('Identificador da vaga não encontrado');
      setLoading(false);
    }
  }, [slug]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);

      // API endpoint
      const endpoint = `https://www.emprego.co.mz/wp-api/vacancies?name=${slug}`;

      // Headers based on the curl request
      const headers = {
        accept: 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'en-US,en;q=0.9',
        'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'x-requested-with': 'XMLHttpRequest',
      };

      // Make the API request
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: headers,
        credentials: 'include', // This includes cookies
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setJob(data.results[0]);
      } else {
        setError('Vaga não encontrada');
      }

      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar os detalhes da vaga. Tente novamente mais tarde.');
      setLoading(false);
      console.error('Error fetching job details:', err);
    }
  };

  const handleShare = async () => {
    if (!job) return;

    try {
      await Share.share({
        message: `Confira esta vaga: ${job.title} - ${job.url}`,
      });
    } catch (error) {
      console.error('Error sharing job:', error);
    }
  };

  const handleApply = () => {
    if (!job) return;

    const applyUrl = job.ext_apply_url || job.url;
    Linking.openURL(applyUrl).catch((err) => {
      console.error('Error opening apply URL:', err);
      alert('Não foi possível abrir o link de candidatura.');
    });
  };

  const renderHTMLContent = (htmlContent: string) => {
    const baseStyle = {
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    };

    const tagsStyles = {
      body: { ...baseStyle },
      p: { ...baseStyle, marginBottom: 16, lineHeight: 22, fontSize: 16 },
      h1: { ...baseStyle, fontSize: 24, fontWeight: 'bold', marginVertical: 16 },
      h2: { ...baseStyle, fontSize: 22, fontWeight: 'bold', marginVertical: 14 },
      h3: { ...baseStyle, fontSize: 20, fontWeight: 'bold', marginVertical: 12 },
      h4: { ...baseStyle, fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
      h5: { ...baseStyle, fontSize: 16, fontWeight: 'bold', marginVertical: 8, color: '#2EA8FF' },
      h6: { ...baseStyle, fontSize: 15, fontWeight: 'bold', marginVertical: 6, color: '#2EA8FF' },
      a: { ...baseStyle, color: '#2EA8FF', textDecorationLine: 'underline' },
      ul: { ...baseStyle, marginBottom: 16 },
      ol: { ...baseStyle, marginBottom: 16 },
      li: { ...baseStyle, marginBottom: 8, lineHeight: 22 },
    };

    return (
      <HTML
        source={{ html: htmlContent }}
        contentWidth={windowWidth - 32}
        // @ts-ignore
        tagsStyles={tagsStyles}
        defaultTextProps={{
          style: { color: '#fff' },
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Detalhes da Vaga
        </Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2EA8FF" />
          <Text style={styles.loadingText}>Carregando detalhes da vaga...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchJobDetails}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : job ? (
        <>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.jobHeader}>
              <View style={styles.companyLogoContainer}>
                {job.company && job.company.logo ? (
                  <Image source={{ uri: job.company.logo }} style={styles.companyLogo} resizeMode="contain" />
                ) : (
                  <View style={styles.placeholderLogo}>
                    <Text style={styles.placeholderText}>{job.company?.name?.charAt(0) || '?'}</Text>
                  </View>
                )}
              </View>
              <View style={styles.jobTitleContainer}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.companyName}>{job.company?.name}</Text>
              </View>
            </View>

            <View style={styles.metadataContainer}>
              {job.locations && job.locations.length > 0 && (
                <View style={styles.metadataItem}>
                  <Ionicons name="location-outline" size={18} color="#8F8F8F" />
                  <Text style={styles.metadataText}>{job.locations[0].name}</Text>
                </View>
              )}

              {job.categories && job.categories.length > 0 && (
                <View style={styles.metadataItem}>
                  <Ionicons name="briefcase-outline" size={18} color="#8F8F8F" />
                  <Text style={styles.metadataText}>{job.categories[0].name}</Text>
                </View>
              )}

              {job.date && (
                <View style={styles.metadataItem}>
                  <Ionicons name="calendar-outline" size={18} color="#8F8F8F" />
                  <Text style={styles.metadataText}>Publicado em: {job.date}</Text>
                </View>
              )}

              {job.expire_date && (
                <View style={styles.metadataItem}>
                  <Ionicons name="time-outline" size={18} color="#8F8F8F" />
                  <Text style={styles.metadataText}>Expira em: {job.expire_date}</Text>
                </View>
              )}

              {job.meta?.language && (
                <View style={styles.languageBadge}>
                  <Text style={styles.languageBadgeText}>{job.meta.language.name}</Text>
                </View>
              )}
            </View>

            {job.excerpt && (
              <View style={styles.excerptContainer}>
                <Text style={styles.excerptText}>{job.excerpt}</Text>
              </View>
            )}

            <View style={styles.contentContainer}>
              <Text style={styles.sectionTitle}>Descrição da Vaga</Text>
              {job.content && renderHTMLContent(job.content)}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Candidatar-se</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
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
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#121214',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29292E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29292E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8F8F8F',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#8F8F8F',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2EA8FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  jobHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  companyLogoContainer: {
    width: 64,
    height: 64,
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#29292E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyLogo: {
    width: '100%',
    height: '100%',
  },
  placeholderLogo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#29292E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  jobTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    color: '#2EA8FF',
  },
  metadataContainer: {
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    margin: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'relative',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  languageBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#3A3A3C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  languageBadgeText: {
    fontSize: 12,
    color: '#fff',
    textTransform: 'uppercase',
  },
  excerptContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  excerptText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#121214',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  applyButton: {
    paddingVertical: 16,
    justifyContent: 'center',
    backgroundColor: '#1fa2df',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
