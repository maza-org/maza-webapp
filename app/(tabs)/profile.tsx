import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import useUser from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';
import { Subject, Certificate } from '@/app/types/profile';
import { useCertificates, useDeleteInterest, useLogout, useProfileRefresh } from '@/app/hooks/useProfileQueries';
import Constants from 'expo-constants';
import ProfileHeader from '@/app/components/profile/ProfileHeader';
import ProfileImageSection from '@/app/components/profile/ProfileImageSection';
import ProfileInfoItem from '@/app/components/profile/ProfileInfoItem';
import InterestsSection from '@/app/components/profile/InterestsSection';
import CertificatesSection from '@/app/components/profile/CertificatesSection';
import ProfileErrorState from '@/app/components/profile/ProfileErrorState';
import { formatDate } from '@/util/util';
import Button from '@/components/Button';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function ProfileScreen() {
  const { data: user, isLoading, error } = useUser();
  const { toast, config, hideToast } = useToast();
  const { isDark, themeMode, setThemeMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [deletingInterestId, setDeletingInterestId] = useState<number | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: certificates = [], isLoading: isLoadingCertificates, refetch: refetchCertificates } = useCertificates();
  const deleteInterestMutation = useDeleteInterest();
  const logoutMutation = useLogout();
  const profileRefreshMutation = useProfileRefresh();

  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        loadingContainer: {
          flex: 1,
          backgroundColor: colors.background,
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
          borderTopColor: colors.border,
          gap: 12,
          alignItems: 'center',
        },
        versionLabel: {
          color: colors.textMuted,
          fontSize: 12,
          textAlign: 'center',
        },
        logoutButton: {
          backgroundColor: colors.logoutButton,
          padding: 16,
          borderRadius: 50,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
        },
        logoutButtonText: {
          color: colors.text,
          fontSize: 16,
          fontWeight: '600',
        },
        themeSection: {
          gap: 16,
          marginBottom: 12,
        },
        themeSectionHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 0,
        },
        themeSectionLabel: {
          color: colors.text,
          fontSize: 16,
          fontWeight: '600',
        },
        themeOptions: {
          flexDirection: 'row',
          backgroundColor: colors.buttonBackground,
          padding: 4,
          borderRadius: 100,
        },
        themeOption: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 12,
          borderRadius: 100,
        },
        themeOptionActive: {
          backgroundColor: colors.cardBackground,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        },
        themeOptionText: {
          color: colors.textSecondary,
          fontSize: 14,
          fontWeight: '500',
        },
        themeOptionTextActive: {
          color: colors.text,
          fontWeight: '600',
        },
      }),
    [colors]
  );

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
      <View style={themedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
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

  function handleCustomizeSurvey() {
    router.push({
      pathname: '/onboarding/survey',
      params: { fromProfile: 'true' },
    });
  }

  return (
    <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
        duration={config.duration}
        position={config.position}
        showIcon={config.showIcon}
      />
      <ScrollView style={themedStyles.scrollView}>
        <ProfileHeader />

        <ProfileImageSection
          profileImage={profileImage}
          isUploadingImage={isUploadingImage}
          fullname={user.fullname}
          username={user?.username}
          documentId={user.documentId}
        />

        <View style={themedStyles.infoSection}>
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
            onToggleEditing={handleAddInterest}
            onDeleteInterest={handleDeleteInterest}
            onAddInterest={handleAddInterest}
          />

          <Button
            text="Personalizar Experiência"
            handle={handleCustomizeSurvey}
            variant="outline"
            icon={<Feather name="sliders" size={20} color={colors.primary} />}
          />

          <CertificatesSection
            certificates={certificates}
            isLoadingCertificates={isLoadingCertificates}
            onViewCertificate={viewCertificateDetails}
            onViewAll={() => router.push('/user/certificates')}
          />

          <View style={themedStyles.themeSection}>
            <View style={themedStyles.themeSectionHeader}>
              <Feather name={isDark ? 'moon' : 'sun'} size={20} color={colors.primary} />
              <Text style={themedStyles.themeSectionLabel}>Aparência</Text>
            </View>
            <View style={themedStyles.themeOptions}>
              <TouchableOpacity
                style={[themedStyles.themeOption, themeMode === 'light' && themedStyles.themeOptionActive]}
                onPress={() => setThemeMode('light')}
                activeOpacity={0.7}
              >
                <Feather name="sun" size={18} color={themeMode === 'light' ? colors.text : colors.textSecondary} />
                <Text style={themeMode === 'light' ? themedStyles.themeOptionTextActive : themedStyles.themeOptionText}>
                  Claro
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[themedStyles.themeOption, themeMode === 'dark' && themedStyles.themeOptionActive]}
                onPress={() => setThemeMode('dark')}
                activeOpacity={0.7}
              >
                <Feather name="moon" size={18} color={themeMode === 'dark' ? colors.text : colors.textSecondary} />
                <Text style={themeMode === 'dark' ? themedStyles.themeOptionTextActive : themedStyles.themeOptionText}>
                  Escuro
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[themedStyles.themeOption, themeMode === 'system' && themedStyles.themeOptionActive]}
                onPress={() => setThemeMode('system')}
                activeOpacity={0.7}
              >
                <Feather
                  name="smartphone"
                  size={18}
                  color={themeMode === 'system' ? colors.text : colors.textSecondary}
                />
                <Text
                  style={themeMode === 'system' ? themedStyles.themeOptionTextActive : themedStyles.themeOptionText}
                >
                  Sistema
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button
            text="Alterar Senha"
            handle={handleChangePassword}
            variant="outline"
            icon={<Feather name="lock" size={20} color={colors.primary} />}
          />

          <Text style={themedStyles.versionLabel}>Versão {Constants.expoConfig?.version ?? '3.5.0'}</Text>
        </View>
      </ScrollView>

      <View style={themedStyles.footer}>
        <TouchableOpacity style={themedStyles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={colors.text} />
          <Text style={themedStyles.logoutButtonText}>Terminar Sessão</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
