import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export default function Certificate() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Certificado</Text>
        <View style={styles.headerSpace} />
      </View>

      {/* Certificate Container */}
      <View style={styles.certificateWrapper}>
        <View style={styles.certificateContainer}>
          {/* Logo */}
          <Image source={{ uri: 'https://placeholder.com/800x400' }} style={styles.logo} resizeMode="contain" />

          <Text style={styles.certificateType}>CERTIFICADO DE CONCLUSÃO</Text>

          <Text style={styles.courseName}>Entrepreneurship and New{'\n'}Venture Creation</Text>

          <Text style={styles.instructorLabel}>Instrutores</Text>
          <Text style={styles.instructorName}>Sarah Adams</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              <Feather name="star" size={24} color="#31A7D9" />
              <Feather name="star" size={24} color="#31A7D9" />
              <Feather name="star" size={24} color="#31A7D9" />
            </View>
            <Text style={styles.ratingText}>Excelente!</Text>
          </View>

          <View style={styles.studentInfoContainer}>
            <Text style={styles.studentName}>João Carlos Antonio</Text>

            <View style={styles.certificateDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Data</Text>
                <Text style={styles.detailValue}>6 Set 2024</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Duração</Text>
                <Text style={styles.detailValue}>5,6 Horas</Text>
              </View>
            </View>

            <Image source={{ uri: 'https://placeholder.com/800x400' }} style={styles.signature} resizeMode="contain" />
            <Text style={styles.signatureLabel}>MAZA</Text>
          </View>

          <Text style={styles.verifyText}>Verify at eduline.org/verify/123534331</Text>
        </View>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.downloadButton}>
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Partilhar</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerSpace: {
    width: 40,
  },
  certificateWrapper: {
    flex: 1,
    padding: 16,
  },
  certificateContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  certificateType: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  courseName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000',
  },
  instructorLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  instructorName: {
    color: '#000',
    fontSize: 16,
    marginBottom: 24,
  },
  ratingContainer: {
    alignItems: 'center',
    backgroundColor: '#F8F9FE',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  ratingText: {
    color: '#31A7D9',
    fontSize: 18,
    fontWeight: '600',
  },
  studentInfoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  certificateDetails: {
    width: '100%',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#666',
    fontSize: 14,
  },
  detailValue: {
    color: '#000',
    fontSize: 14,
  },
  signature: {
    width: 120,
    height: 60,
    marginBottom: 8,
  },
  signatureLabel: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  verifyText: {
    color: '#666',
    fontSize: 12,
    marginTop: 24,
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#31A7D9',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#31A7D9',
  },
  shareButtonText: {
    color: '#31A7D9',
    fontSize: 16,
    fontWeight: '600',
  },
});
