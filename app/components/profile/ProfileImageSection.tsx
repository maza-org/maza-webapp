import React from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

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
    const displayName = username || fullname;
    return displayName.charAt(0).toUpperCase();
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
      {username && (
        <View style={styles.usernameBadge}>
          <View style={styles.usernameIconContainer}>
            <Feather name="at-sign" size={14} color="#1fa2df" />
          </View>
          <Text style={styles.usernameBadgeText}>{username}</Text>
        </View>
      )}
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
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1fa2df',
    marginBottom: 4,
    textAlign: 'center',
  },
  fullnameSecondary: {
    fontSize: 16,
    color: '#A8A8B3',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  usernameBadge: {
    backgroundColor: 'rgba(31, 162, 223, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(31, 162, 223, 0.2)',
    marginBottom: 8,
    marginTop: 4,
  },
  usernameIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 162, 223, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usernameBadgeText: {
    color: '#1fa2df',
    fontSize: 14,
    fontWeight: '500',
  },
  documentId: {
    color: '#555',
    fontSize: 12,
    marginTop: 4,
  },
});
