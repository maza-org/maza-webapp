import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export default function Certificate() {
  const { certificateId } = useLocalSearchParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [certificateImageUri, setCertificateImageUri] = useState(null);
  const [signatureImageUri, setSignatureImageUri] = useState(null);
  const [downloadingImage, setDownloadingImage] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user data
        const userData = await AsyncStorage.getItem('@user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);

          // Fetch certificate details
          if (certificateId) {
            await fetchCertificateDetails(parsedUser.token, certificateId as string);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Erro', 'Falha ao carregar dados do certificado');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [certificateId]);

  const fetchCertificateDetails = async (token: string, id: string) => {
    try {
      // Using populate=* to get all related data including images
      const response = await fetch(`https://api.mazas.org/api/certificates/${id}?populate=*`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.status);
      console.log(JSON.stringify(response, null, 2));

      if (response.ok) {
        const data = await response.json();
        console.log('Certificate data:', JSON.stringify(data.data));
        setCertificate(data.data);

        // Download certificate image if available
        if (data.data.image?.url) {
          await downloadImageToCacheDirectory(
            `https://api.mazas.org${data.data.image.url}`,
            token,
            'certificate.jpg',
            setCertificateImageUri
          );
        }

        // Download signature image if available
        if (data.data.signature?.url) {
          await downloadImageToCacheDirectory(
            `https://api.mazas.org${data.data.signature.url}`,
            token,
            'signature.jpg',
            setSignatureImageUri
          );
        }
      } else {
        console.log('Certificate fetch failed with status:', response.status);
        throw new Error('Failed to fetch certificate details');
      }
    } catch (error) {
      console.error('Error fetching certificate details:', error);
      Alert.alert('Erro', 'Falha ao carregar detalhes do certificado');
    }
  };

  const downloadImageToCacheDirectory = async (url, token, filename, setUriFunction) => {
    try {
      // Create a temporary file path
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      // Download the file to local filesystem
      const downloadResult = await FileSystem.downloadAsync(url, fileUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (downloadResult.status === 200) {
        setUriFunction(downloadResult.uri);
        return downloadResult.uri;
      } else {
        console.error('Failed to download image, status:', downloadResult.status);
        return null;
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      return null;
    }
  };

  const handleShareCertificate = async () => {
    try {
      const result = await Share.share({
        message: `Certificado de conclusão do curso ${certificate?.course?.title} da Mazas Digital Learning Platform`,
        url: `https://mazas.org/certificates/${certificateId}`,
      });
    } catch (error) {
      Alert.alert('Erro', 'Falha ao compartilhar certificado');
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      // Request permissions first (for Android)
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Não temos permissão para salvar o certificado');
          return;
        }
      }

      if (!certificateImageUri) {
        Alert.alert('Erro', 'Imagem do certificado não disponível');
        return;
      }

      setDownloadingImage(true);

      // Save the image to the photo gallery
      const asset = await MediaLibrary.createAssetAsync(certificateImageUri);

      // Create an album and add the image to it
      const album = await MediaLibrary.getAlbumAsync('Mazas Certificates');
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync('Mazas Certificates', asset, false);
      }

      Alert.alert('Sucesso', 'Certificado salvo na galeria');
    } catch (error) {
      console.error('Error saving certificate to gallery:', error);
      Alert.alert('Erro', 'Falha ao salvar certificado na galeria');
    } finally {
      setDownloadingImage(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Certificado</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0CA5E9" />
        </View>
      </SafeAreaView>
    );
  }

  if (!certificate) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Certificado</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="document-text-outline" size={64} color="#6B7280" />
          <Text style={styles.errorTitle}>Certificado não encontrado</Text>
          <Text style={styles.errorText}>Não foi possível encontrar o certificado solicitado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Format date
  const issueDate = new Date(certificate.createdAt);
  const formattedDate = issueDate.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Certificado</Text>
      </View>
      <ScrollView>
        <View style={styles.certificateContainer}>
          <View style={styles.certificateContent}>
            <Image source={require('@/assets/images/maza-logo.png')} style={styles.logo} />

            <Text style={styles.certificateLabel}>CERTIFICADO DE CONCLUSÃO</Text>

            <Text style={styles.courseName}>{certificate.course.title}</Text>

            <View style={styles.instructorSection}>
              <Text style={styles.instructorLabel}>Instrutores</Text>
              <Text style={styles.instructorName}>{certificate.course.author}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.gradeSection}>
              {/* Use the downloaded certificate image or fallback */}
              {certificateImageUri ? (
                <Image source={{ uri: certificateImageUri }} style={styles.gradeImage} />
              ) : (
                <View style={[styles.gradeImage, styles.imagePlaceholder]}>
                  <ActivityIndicator size="small" color="#0CA5E9" />
                </View>
              )}

              <Text style={styles.studentName}>{user?.fullname}</Text>

              <View style={styles.certificateDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Data</Text>
                  <Text style={styles.detailValue}>
                    {new Date(certificate.createdAt).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Duração</Text>
                  <Text style={styles.detailValue}>6 Horas</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID</Text>
                  <Text style={styles.detailValue}>{certificate.documentId}</Text>
                </View>
              </View>

              <View style={styles.signatureSection}>
                {/* Use the downloaded signature image or fallback */}
                {signatureImageUri ? (
                  <Image source={{ uri: signatureImageUri }} style={styles.signatureImage} />
                ) : (
                  <View style={[styles.signatureImage, styles.imagePlaceholder]}>
                    <ActivityIndicator size="small" color="#0CA5E9" />
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.verifyText}>Verificar em mazas.org/certificados/{certificate.documentId}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.downloadButton, downloadingImage && styles.disabledButton]}
          onPress={handleDownloadCertificate}
          disabled={downloadingImage || !certificateImageUri}
        >
          {downloadingImage ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.downloadButtonText}>Download</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={handleShareCertificate}>
          <Text style={styles.shareButtonText}>Partilhar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
    marginBottom: 30,
    marginTop: 24,
  },
  backButton: {
    padding: 8,
    borderStyle: 'solid',
    borderColor: '#b3b3b3',
    borderWidth: 0.5,
    borderRadius: 50,
    marginEnd: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  certificateContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  certificateContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  certificateLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  courseName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  instructorLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
    marginBottom: 24,
  },
  gradeSection: {
    width: '100%',
    backgroundColor: '#F3F4FF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  gradeImage: {
    width: 300,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  imagePlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  certificateDetails: {
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  signatureSection: {
    alignItems: 'center',
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
  signatureImage: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
  organizationName: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  verifyText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#0CA5E9',
    borderRadius: 36,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#6B7280',
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#252525',
    borderRadius: 36,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
