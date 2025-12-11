import React from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';

interface ProfileImageSectionProps {
  profileImage: string | null;
  isUploadingImage: boolean;
  fullname: string;
  username?: string;
  documentId: string;
}

export default function ProfileImageSection({
  profileImage,
  isUploadingImage,
  fullname,
  username,
  documentId,
}: ProfileImageSectionProps) {
  const getInitials = () => {
    return fullname.charAt(0).toUpperCase();
  };

  return (
    <View style={styles.profileSection}>
      <View style={styles.profileImageContainer}>
        {isUploadingImage ? (
          <View style={styles.profileImagePlaceholder}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : profileImage ? (
          <View style={styles.profileImageWrapper}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          </View>
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImagePlaceholderText}>{getInitials()}</Text>
          </View>
        )}
      </View>

      <Text style={styles.fullname}>{fullname}</Text>
      <Text style={styles.usernameText}>@{username || 'Utilizador não definido'}</Text>
      <Text style={styles.documentId}>ID: {documentId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    alignItems: 'center',
    padding: 24,
    marginTop: -50,
  },
  profileImageContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3A3A3D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#121214',
  },
  profileImagePlaceholderText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#121214',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  fullname: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  usernameText: {
    fontSize: 16,
    color: '#A8A8B3',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  documentId: {
    color: '#555',
    fontSize: 12,
    marginTop: 4,
  },
});