import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import StoryModal from './StoryModal';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: 'Bem-vindo à Maza!',
    description:
      'A plataforma de aprendizagem que vai transformar a sua carreira. Vamos mostrar como criar a sua conta em poucos passos.',
    icon: 'sparkles' as const,
    backgroundColor: '#1fa2df',
  },
  // ... (kept the rest of the slides the same for brevity)
  {
    id: 2,
    title: 'Escolha como se registar',
    description:
      'Pode criar a sua conta usando o seu número de telemóvel ou email. Ambas as opções são rápidas e seguras.',
    icon: 'phone-portrait-outline' as const,
    backgroundColor: '#6366f1',
  },
  {
    id: 3,
    title: 'Verifique a sua identidade',
    description:
      'Vamos enviar um código de verificação para confirmar o seu contacto. Isto ajuda a manter a sua conta segura.',
    icon: 'shield-checkmark-outline' as const,
    backgroundColor: '#8b5cf6',
  },
  {
    id: 4,
    title: 'Complete o seu perfil',
    description:
      'Adicione o seu nome e foto para personalizar a sua experiência. Pode também selecionar os seus interesses.',
    icon: 'person-circle-outline' as const,
    backgroundColor: '#ec4899',
  },
  {
    id: 5,
    title: 'Comece a aprender!',
    description:
      'Após criar a conta, terá acesso a centenas de cursos gratuitos. Acompanhe o seu progresso e obtenha certificados.',
    icon: 'rocket-outline' as const,
    backgroundColor: '#10b981',
  },
];

export default function CreateAccountSection() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const [showStory, setShowStory] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleCreateAccount = () => {
    router.push('/login/create-email');
  };

  const handleDismiss = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?w=800&q=80' }}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
        </View>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={18} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Comece a sua jornada.</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            Crie a sua conta Maza para desbloquear cursos gratuitos, obter certificados e acompanhar o seu progresso.
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateAccount} activeOpacity={0.8}>
              <Text style={styles.createButtonText}>Criar conta gratuita</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.learnButton} onPress={() => setShowStory(true)} activeOpacity={0.7}>
              <Text style={styles.learnButtonText}>Como funciona?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <StoryModal visible={showStory} onClose={() => setShowStory(false)} slides={ONBOARDING_SLIDES} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 14,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'ManropeBold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'ManropeRegular',
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  createButton: {
    backgroundColor: '#1fa2df',
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'ManropeBold',
  },
  learnButton: {
    height: 44,
    justifyContent: 'center',
  },
  learnButtonText: {
    color: '#1fa2df',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'ManropeMedium',
  },
});
