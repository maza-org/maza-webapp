import React from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { ProfileImageProps } from '../types/profile';

export const ProfileImage: React.FC<ProfileImageProps> = ({ profileImage, isUploadingImage, userFullname }) => {
  return (
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
          <Text style={styles.profileImagePlaceholderText}>{userFullname?.charAt(0)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
});
