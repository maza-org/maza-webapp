import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import useUser from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';
import { Subject, Certificate } from '@/app/types/profile';
import { useCertificates, useDeleteInterest, useLogout, useProfileRefresh } from '@/app/hooks/useProfileQueries';
import ProfileHeader from '@/app/components/profile/ProfileHeader';
import ProfileImageSection from '@/app/components/profile/ProfileImageSection';
import ProfileInfoItem from '@/app/components/profile/ProfileInfoItem';
import InterestsSection from '@/app/components/profile/InterestsSection';
import CertificatesSection from '@/app/components/profile/CertificatesSection';
import ProfileErrorState from '@/app/components/profile/ProfileErrorState';
import { formatDate } from '@/util/util';
import Button from '@/components/Button';

export default function ProfileScreen() {
  const { data: user, isLoading, error } = useUser();
  const { toast, config, hideToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [deletingInterestId, setDeletingInterestId] = useState<number | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: certificates = [], isLoading: isLoadingCertificates, refetch: refetchCertificates } = useCertificates();
  const deleteInterestMutation = useDeleteInterest();
  const logoutMutation = useLogout();
  const profileRefreshMutation = useProfileRefresh();

  useFocusEffect(
    useCallback(() => {
      const refreshProfileData = async () => {
        try {
          await profileRefreshMutation.mutateAsync();
          await refetchCertificates();
        } catch (error) {
          console.error('Error refreshing profile data:', error);
        }
      };

      refreshProfileData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  React.useEffect(() => {
    if (user?.profile_image?.formats?.thumbnail?.url) {
      setProfileImage(user.profile_image.formats.thumbnail.url);
    }
  }, [user?.profile_image?.formats?.thumbnail?.url]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const handleChangePassword = () => {
    router.push('/user/change-password');
  };

  const handleDeleteInterest = async (subject: Subject) => {
    Alert.alert('Confirmar', 'Tem certeza que deseja remover este interesse?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          setDeletingInterestId(subject.id);
          try {
            await deleteInterestMutation.mutateAsync(subject);
          } finally {
            setDeletingInterestId(null);
          }
        },
      },
    ]);
  };

  const viewCertificateDetails = (certificate: Certificate) => {
    router.push({
      pathname: '/user/certificate',
      params: { certificateId: certificate.documentId },
    });
  };

  if (isLoading || profileRefreshMutation.isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1fa2df" />
      </View>
    );
  }

  if (error || !user) {
    return <ProfileErrorState onButtonPress={() => router.push('/login')} />;
  }

  function handleAddInterest() {
    router.push({
      pathname: '/start/customize',
      params: {
        interests: user?.interests ? JSON.stringify(user?.interests) : undefined,
      },
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
        duration={config.duration}
        position={config.position}
        showIcon={config.showIcon}
      />
      <ScrollView style={styles.scrollView}>
        <ProfileHeader />

        <ProfileImageSection
          profileImage={profileImage}
          isUploadingImage={isUploadingImage}
          fullname={user.fullname}
          username={user?.username}
          documentId={user.documentId}
        />

        <View style={styles.infoSection}>
          <ProfileInfoItem icon="phone" label="Número de Telemóvel" value={user.phone} />

          <ProfileInfoItem icon="mail" label="Email" value={user.email || 'Campo não preenchido'} />

          <ProfileInfoItem icon="credit-card" label="BI Nacional" value={user.nationalID || 'Campo não preenchido'} />

          <ProfileInfoItem
            icon="calendar"
            label="Data de Nascimento"
            value={user.dateOfBirth ? formatDate(user?.dateOfBirth) : 'Campo não preenchido'}
          />

          <ProfileInfoItem icon="user" label="Género" value={user.gender || 'Campo não preenchido'} />

          <ProfileInfoItem icon="map-pin" label="Província" value={user.province || 'Campo não preenchido'} />

          <ProfileInfoItem icon="map" label="Distrito" value={user.district || 'Campo não preenchido'} />

          <ProfileInfoItem icon="briefcase" label="Ocupação" value={user.occupation || 'Campo não preenchido'} />

          <ProfileInfoItem
            icon="book"
            label="Instituição Académica"
            value={user.academicInstitution || 'Campo não preenchido'}
          />

          <ProfileInfoItem icon="award" label="Nível Académico" value={user.academicLevel || 'Campo não preenchido'} />

          <ProfileInfoItem icon="tag" label="ID Yoma" value={user.yoma_id || 'Não conectado'} />

          <InterestsSection
            interests={user.interests || []}
            isEditing={isEditing}
            deletingInterestId={deletingInterestId}
            onToggleEditing={() => setIsEditing(!isEditing)}
            onDeleteInterest={handleDeleteInterest}
            onAddInterest={handleAddInterest}
          />

          <CertificatesSection
            certificates={certificates}
            isLoadingCertificates={isLoadingCertificates}
            onViewCertificate={viewCertificateDetails}
            onViewAll={() => router.push('/user/certificates')}
          />

          <Button
            text="Alterar Senha"
            handle={handleChangePassword}
            variant="outline"
            icon={<Feather name="lock" size={20} color="#1fa2df" />}
          />

          <Text style={styles.versionLabel}>Versão 1.0.0</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#FFF" />
          <Text style={styles.logoutButtonText}>Terminar Sessão</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121214',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  infoSection: {
    padding: 24,
    gap: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 0,
    borderTopWidth: 1,
    paddingVertical: 0,
    borderTopColor: '#323238',
    gap: 12,
    alignItems: 'center',
  },
  versionLabel: {
    color: '#A8A8B3',
    fontSize: 12,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#202024',
    padding: 16,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
