import React from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Linking,
  Dimensions,
} from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams, router } from 'expo-router';
import HTML, { MixedStyleDeclaration } from 'react-native-render-html';
import { Job } from '@/types/job';
import { useJobDetails } from '@/hooks/useJobs';
import { JobHeader } from '../components/JobHeader';
import { JobMetadata } from '../components/JobMetadata';
import { styles } from '../styles/jobDetails.styles';

const windowWidth = Dimensions.get('window').width;

export default function JobDetails() {
  const { slug } = useLocalSearchParams();
  const {
    data: job,
    isLoading: loading,
    error: queryError,
  }: {
    data: Job | undefined;
    isLoading: boolean;
    error: any;
  } = useJobDetails(slug as string);

  const error = !slug
    ? 'Identificador da vaga não encontrado'
    : queryError instanceof Error
      ? queryError.message
      : typeof queryError === 'string'
        ? queryError
        : null;

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
    const baseStyle: MixedStyleDeclaration = {
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    };

    const tagsStyles: Record<string, MixedStyleDeclaration> = {
      body: { ...baseStyle },
      p: { ...baseStyle, marginBottom: 16, lineHeight: 22, fontSize: 16 },
      h1: { ...baseStyle, fontSize: 24, fontWeight: '700', marginVertical: 16 },
      h2: { ...baseStyle, fontSize: 22, fontWeight: '700', marginVertical: 14 },
      h3: { ...baseStyle, fontSize: 20, fontWeight: '700', marginVertical: 12 },
      h4: { ...baseStyle, fontSize: 18, fontWeight: '700', marginVertical: 10 },
      h5: { ...baseStyle, fontSize: 16, fontWeight: '700', marginVertical: 8, color: '#2EA8FF' },
      h6: { ...baseStyle, fontSize: 15, fontWeight: '700', marginVertical: 6, color: '#2EA8FF' },
      a: { ...baseStyle, color: '#2EA8FF', textDecorationLine: 'underline' },
      ul: { ...baseStyle, marginBottom: 16 },
      ol: { ...baseStyle, marginBottom: 16 },
      li: { ...baseStyle, marginBottom: 8, lineHeight: 22 },
    };

    return (
      <HTML
        source={{ html: htmlContent }}
        contentWidth={windowWidth - 32}
        tagsStyles={tagsStyles}
        defaultTextProps={{
          style: { color: '#fff' },
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {job && <JobHeader job={job} onShare={handleShare} onBack={() => router.back()} />}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2EA8FF" />
          <Text style={styles.loadingText}>Carregando detalhes da vaga...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.reload()}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : job ? (
        <>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.jobHeader}>
              <View style={styles.companyLogoContainer}>
                {job.company?.logo ? (
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

            <JobMetadata job={job} />

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
