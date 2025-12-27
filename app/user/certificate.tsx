import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Share, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { WebView } from 'react-native-webview';
import { baseUrl } from '@/services/api';

interface User {
  token: string;
  [key: string]: any;
}

interface DownloadResult {
  uri: string;
  status: number;
  [key: string]: any;
}

export default function Certificate() {
  const { certificateId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const isWeb = Platform.OS === 'web';
  const [error, setError] = useState<string | null>(null);

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
        console.error('Erro ao carregar dados do certificado:', error);
        Alert.alert('Erro', 'Falha ao carregar dados do certificado');
        setError('Falha ao carregar dados do certificado');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [certificateId]);

  const fetchCertificateUrl = async (token: string, id: string | string[]) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/certificates/${id}`, {
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

        // For web platform, we'll use the URL directly without downloading
        if (isWeb) {
          setPdfUri(data.url);
          setLoading(false);
        } else {
          // For mobile platforms, download the PDF
          await downloadPdf(data.url, id);
        }
      } else {
        console.error('Failed to get certificate URL:', data);
        Alert.alert('Erro', data.message || 'Falha ao obter o URL do certificado');
        setError(data.message || 'Falha ao obter o URL do certificado');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching certificate URL:', error);
      Alert.alert('Erro', 'Falha ao carregar o certificado');
      setError('Falha ao carregar o certificado');
      setLoading(false);
    }
  };

  const downloadPdf = async (url: string, id: string | string[]) => {
    // Skip downloading for web
    if (isWeb) {
      return;
    }

    try {
      // Create a file path for the PDF in the cache directory
      const pdfFilePath = `${FileSystem.cacheDirectory}certificate_${id}.pdf`;

      // Download the PDF directly to the file system
      const downloadResult = await FileSystem.downloadAsync(url, pdfFilePath);

      if (downloadResult.status === 200) {
        // Be consistent with URI handling for Android
        // Store the URI without the 'file://' prefix
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

  const handleDownloadCertificate = async () => {
    // For web, open in a new tab
    if (isWeb && pdfUri) {
      window.open(pdfUri, '_blank');
      return;
    }

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

        // Clean the URI - ensure consistent handling
        let cleanUri = pdfUri;
        if (cleanUri.startsWith('file://')) {
          cleanUri = cleanUri.substring(7);
        }

        // Create destination file path
        const fileUri = `${FileSystem.documentDirectory}certificado_mazas_${certificateId}.pdf`;

        // Copy the file to document directory
        await FileSystem.copyAsync({
          from: cleanUri,
          to: fileUri,
        });

        // Save to MediaLibrary
        const asset = await MediaLibrary.createAssetAsync(fileUri);

        // Try to find or create the album
        try {
          const album = await MediaLibrary.getAlbumAsync('Mazas Certificates');
          if (album) {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          } else {
            await MediaLibrary.createAlbumAsync('Mazas Certificates', asset, false);
          }
          Alert.alert('Sucesso', 'Certificado salvo na galeria');
        } catch (error) {
          console.error('Error saving to album:', error);
          Alert.alert('Aviso', 'Certificado salvo, mas não foi possível organizá-lo no álbum');
        }
      }
    } catch (error) {
      console.error('Error saving certificate:', error);
      Alert.alert('Erro', 'Falha ao salvar certificado: ' + error?.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleShareCertificate = async () => {
    try {
      if (!pdfUri) {
        Alert.alert('Erro', 'PDF do certificado não disponível');
        return;
      }

      // For web, open in a new tab
      if (isWeb) {
        window.open(pdfUri, '_blank');
        return;
      }

      // Share the PDF file for mobile
      const result = await Share.share({
        url: pdfUri,
        message: `Meu certificado de conclusão da Mazas Digital Learning Platform`,
      });
    } catch (error) {
      console.error('Error sharing certificate:', error);
      Alert.alert('Erro', 'Falha ao compartilhar certificado');
    }
  };

  const renderWebView = () => {
    // For web platform, render the PDF directly in an iframe
    if (isWeb) {
      return (
        <iframe
          src={pdfUri}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Certificate PDF"
        />
      );
    }

    if (Platform.OS === 'android') {
      // Ensure the URI has the file:// prefix for WebView
      const fileUrl = pdfUri.startsWith('file://') ? pdfUri : `file://${pdfUri}`;

      return (
        <WebView
          source={{ uri: fileUrl }}
          style={styles.pdfView}
          originWhitelist={['*', 'file://*']}
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          mixedContentMode="always"
          domStorageEnabled={true}
          javaScriptEnabled={true}
          scalesPageToFit={true}
          renderError={(errorName) => (
            <View style={styles.errorWebView}>
              <Text style={styles.errorTitle}>Erro ao carregar PDF</Text>
              <Text style={styles.errorText}>{errorName}</Text>
              <Text style={styles.errorText}>URL: {fileUrl}</Text>
            </View>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
          }}
        />
      );
    } else {
      return (
        <WebView
          source={{ uri: pdfUri }}
          style={styles.pdfView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          scalesPageToFit={true}
        />
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Certificado</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2EA8FF" />
          <Text style={styles.loadingText}>Carregando certificado...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Certificado</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pdfUri) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Certificado</Text>
      </View>

      <View style={styles.pdfContainer}>{renderWebView()}</View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.downloadButton, downloadingPdf && styles.disabledButton]}
          onPress={handleDownloadCertificate}
          disabled={downloadingPdf || !pdfUri}
        >
          {downloadingPdf && !isWeb ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.downloadButtonText}>{isWeb ? 'Abrir PDF' : 'Download'}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={handleShareCertificate} disabled={!pdfUri}>
          <Ionicons name="share-social-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.shareButtonText}>{isWeb ? 'Abrir em nova aba' : 'Partilhar'}</Text>
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
  errorWebView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
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
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
});
