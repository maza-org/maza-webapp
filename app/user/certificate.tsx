import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { baseUrl } from '@/services/api';
import Pdf from 'react-native-pdf';

export default function Certificate() {
  const { certificateId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);

  const [pdfSource, setPdfSource] = useState<{ uri: string; cache: boolean } | null>(null);
  const [localFilePath, setLocalFilePath] = useState<string | null>(null);

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const isWeb = Platform.OS === 'web';
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [certificateId]);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user');
      if (userData && certificateId) {
        const parsedUser = JSON.parse(userData);
        await fetchCertificateUrl(parsedUser.token, certificateId);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Falha ao carregar dados');
      setLoading(false);
    }
  };

  const fetchCertificateUrl = async (token: string, id: string | string[]) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/certificates/${id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();

      if (data.success && data.url) {
        if (isWeb) {
          setPdfSource({ uri: data.url, cache: false });
          setLoading(false);
        } else {
          await downloadToCache(data.url, id);
        }
      } else {
        throw new Error(data.message || 'URL inválida');
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Erro ao carregar');
      setLoading(false);
    }
  };

  const downloadToCache = async (remoteUrl: string, id: string | string[]) => {
    try {
      const filename = `Certificado_${id}.pdf`;
      const cacheFile = new File(Paths.cache, filename);

      if (!cacheFile.exists) {
        await File.downloadFileAsync(remoteUrl, cacheFile);
      }

      setLocalFilePath(cacheFile.uri);
      setPdfSource({ uri: cacheFile.uri, cache: true });
    } catch (e) {
      console.error(e);
      setError('Falha ao baixar PDF para visualização');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDevice = async () => {
    if (isWeb && pdfSource) {
      window.open(pdfSource.uri, '_blank');
      return;
    }

    if (!localFilePath) {
      Alert.alert('Erro', 'Arquivo não está pronto para salvar.');
      return;
    }

    setDownloadingPdf(true);

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(localFilePath, {
          mimeType: 'application/pdf',
          dialogTitle: 'Guardar Certificado',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo.');
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível salvar o arquivo.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const renderPdfContent = () => {
    if (isWeb) {
      return (
        <iframe src={pdfSource?.uri} style={{ width: '100%', height: '100%', border: 'none' }} title="Certificate" />
      );
    }
    return (
      <Pdf
        source={pdfSource}
        style={styles.pdf}
        trustAllCerts={false}
        onLoadComplete={(numberOfPages) => {
          console.log(`Number of pages: ${numberOfPages}`);
        }}
        onError={(error) => {
          console.log(error);
          setError('Erro ao renderizar o PDF');
        }}
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2EA8FF" />
          <Text style={styles.textWhite}>Carregando certificado...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !pdfSource) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={64} color="#6B7280" />
          <Text style={styles.errorText}>{error || 'Certificado indisponível'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header />

      <View style={styles.pdfContainer}>{renderPdfContent()}</View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, downloadingPdf && styles.btnDisabled]}
          onPress={handleSaveToDevice}
          disabled={downloadingPdf}
        >
          {downloadingPdf ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.btnText}>{isWeb ? 'Abrir PDF' : 'Guardar'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const Header = () => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
      <Ionicons name="chevron-back-sharp" size={24} color="#fff" />
    </TouchableOpacity>
    <Text style={styles.title}>Certificado</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backBtn: {
    padding: 8,
    borderColor: '#b3b3b3',
    borderWidth: 0.5,
    borderRadius: 50,
    marginRight: 16,
  },
  title: { fontSize: 22, fontWeight: '600', color: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textWhite: { color: '#FFF', marginTop: 16 },
  errorText: { color: '#FFF', marginTop: 16, fontSize: 16 },

  pdfContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width - 32,
    height: '100%',
    backgroundColor: '#f5f5f5',
  },

  footer: { padding: 16, paddingBottom: 24 },
  btn: {
    height: 56,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimary: { backgroundColor: '#0CA5E9' },
  btnDisabled: { backgroundColor: '#4B5563' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
