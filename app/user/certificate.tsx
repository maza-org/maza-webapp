import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
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
import * as DocumentPicker from 'expo-document-picker';
import { WebView } from 'react-native-webview';

export default function Certificate() {
  const { certificateId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [pdfUri, setPdfUri] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user data
        const userData = await AsyncStorage.getItem('@user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);

          // Fetch certificate URL
          if (certificateId) {
            await fetchCertificateUrl(parsedUser.token, certificateId);
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

  const fetchCertificateUrl = async (token, id) => {
    try {
      setLoading(true);

      // Fetch the certificate URL from the new endpoint
      const response = await fetch(`https://maza-strapi-backend.onrender.com/api/certificates/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.url) {
        setCertificateUrl(data.url);

        // Download the PDF using the URL
        await downloadPdf(data.url, id);
      } else {
        console.error('Failed to get certificate URL:', data);
        Alert.alert('Erro', data.message || 'Falha ao obter o URL do certificado');
      }
    } catch (error) {
      console.error('Error fetching certificate URL:', error);
      Alert.alert('Erro', 'Falha ao carregar o certificado');
    }
  };

  const downloadPdf = async (url, id) => {
    try {
      // Create a file path for the PDF in the cache directory
      const pdfFilePath = `${FileSystem.cacheDirectory}certificate_${id}.pdf`;

      // Download the PDF directly to the file system
      const downloadResult = await FileSystem.downloadAsync(url, pdfFilePath);

      if (downloadResult.status === 200) {
        setPdfUri(downloadResult.uri);
      } else {
        console.error('Failed to download PDF, status:', downloadResult.status);
        Alert.alert('Erro', 'Falha ao baixar o certificado');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Erro', 'Falha ao baixar o certificado');
    } finally {
      setLoading(false);
    }
  };

  const handleShareCertificate = async () => {
    try {
      if (!pdfUri) {
        Alert.alert('Erro', 'PDF do certificado não disponível');
        return;
      }

      // Share the PDF file
      const result = await Share.share({
        url: Platform.OS === 'ios' ? pdfUri : `file://${pdfUri}`,
        message: `Meu certificado de conclusão da Mazas Digital Learning Platform`,
      });
    } catch (error) {
      console.error('Error sharing certificate:', error);
      Alert.alert('Erro', 'Falha ao compartilhar certificado');
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      if (!pdfUri) {
        Alert.alert('Erro', 'PDF do certificado não disponível');
        return;
      }

      setDownloadingPdf(true);

      // For iOS, save directly to the Files app with a proper filename
      if (Platform.OS === 'ios') {
        // Create a more descriptive filename
        const filename = `certificado_mazas_${certificateId}.pdf`;

        // Copy to a temporary location with the descriptive filename
        const tempFile = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.copyAsync({
          from: pdfUri,
          to: tempFile,
        });

        // Share the file with the Files app
        await Share.share({
          url: tempFile,
          title: filename,
        });
      }
      // For Android, save to the Downloads directory
      else {
        // Request storage permissions for Android
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Não temos permissão para salvar o certificado');
          return;
        }

        // For Android 10+ (API level 29+), we'll check if we can use the Downloads directory
        const fileUri = `${FileSystem.documentDirectory}certificado_mazas_${certificateId}.pdf`;

        // Copy the file to document directory first
        await FileSystem.copyAsync({
          from: pdfUri,
          to: fileUri,
        });

        // Save to MediaLibrary (this works on most Android versions)
        const asset = await MediaLibrary.createAssetAsync(fileUri);

        // Create an album and add the PDF to it
        const album = await MediaLibrary.getAlbumAsync('Mazas Certificates');
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        } else {
          await MediaLibrary.createAlbumAsync('Mazas Certificates', asset, false);
        }

        Alert.alert('Sucesso', 'Certificado salvo na galeria');
      }
    } catch (error) {
      console.error('Error saving certificate:', error);
      Alert.alert('Erro', 'Falha ao salvar certificado: ' + error.message);
    } finally {
      setDownloadingPdf(false);
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

  if (!pdfUri) {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Certificado</Text>
      </View>

      <View style={styles.pdfContainer}>
        <WebView
          source={{ uri: pdfUri }}
          style={styles.pdfView}
          javaScriptEnabled={false}
          domStorageEnabled={true}
          originWhitelist={['*']}
          scalesPageToFit={true}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.downloadButton, downloadingPdf && styles.disabledButton]}
          onPress={handleDownloadCertificate}
          disabled={downloadingPdf || !pdfUri}
        >
          {downloadingPdf ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.downloadButtonText}>Download</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={handleShareCertificate} disabled={!pdfUri}>
          <Ionicons name="share-social-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
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
    marginBottom: 16,
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
  pdfContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  pdfView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  buttonIcon: {
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
    flexDirection: 'row',
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
