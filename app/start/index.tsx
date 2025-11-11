import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Status Bar Content */}
      <View style={styles.statusBarContent}>
        <Text style={styles.timeText}>9:41</Text>
        <View style={styles.statusIcons}>
          <View style={styles.statusIcon} />
          <View style={styles.statusIcon} />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Background Decorations */}
        <View style={styles.yellowAccent} />
        <View style={styles.dotsContainer}>
          {[...Array(4)].map((_, i) => (
            <View key={i} style={styles.dot} />
          ))}
        </View>

        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <Image source={require('@/assets/images/profile.png')} style={styles.profileImage} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Eu Sou</Text>
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={styles.title}>Vamos Começar</Text>
          <Text style={styles.subtitle}>
            Desbloqueie seu potencial com mentoria personalizada de profissionais directamente no MAZA
          </Text>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Button
            text={'Entrar'}
            handle={() => {
              router.push('/login');
            }}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Não possui uma conta? </Text>
            <TouchableOpacity onPress={() => router.push('/login/create')}>
              <Text style={styles.registerLink}>Registrar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Indicator */}
        <View style={styles.bottomIndicator} />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2EA8FF" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  statusBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    padding: 16,
  },
  logo: {
    backgroundColor: '#22ACE3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    position: 'relative',
  },
  yellowAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 96,
    height: 96,
    backgroundColor: '#FFD700',
    borderBottomLeftRadius: 96,
    opacity: 0.5,
  },
  dotsContainer: {
    position: 'absolute',
    top: 160,
    right: 32,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22ACE3',
  },
  imageContainer: {
    width: width * 0.7,
    aspectRatio: 1,
    alignSelf: 'center',
    marginVertical: 32,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  badge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#22ACE3',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  textContent: {
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#A8A8B3',
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#22ACE3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#A8A8B3',
    fontSize: 16,
  },
  registerLink: {
    color: '#22ACE3',
    fontSize: 16,
  },
  bottomIndicator: {
    width: 32,
    height: 4,
    backgroundColor: '#323238',
    borderRadius: 2,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 16,
  },
});
