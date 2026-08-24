import React from 'react';
import {
  Alert,
  Image,
  Linking,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const YOUTH_PORTAL_URL = 'https://www.juventude.mjd.gov.mz/';

type YouthPortalBannerProps = {
  style?: StyleProp<ViewStyle>;
};

export default function YouthPortalBanner({ style }: YouthPortalBannerProps) {
  const { colors: themeColors, isDark } = useTheme();

  const openYouthPortal = async () => {
    try {
      await Linking.openURL(YOUTH_PORTAL_URL);
    } catch {
      Alert.alert('Não foi possível abrir', 'Tente novamente quando tiver ligação à internet.');
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="link"
      accessibilityLabel="Abrir Portal da Juventude"
      activeOpacity={0.82}
      onPress={openYouthPortal}
      style={[
        styles.container,
        {
          backgroundColor: themeColors.card,
          borderColor: isDark ? themeColors.border : '#DCE6EA',
        },
        style,
      ]}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/youth-portal-logo.png')}
          resizeMode="contain"
          style={styles.logo}
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.text }]}>Portal da Juventude</Text>
        <Text style={[styles.description, { color: themeColors.textMuted }]} numberOfLines={2}>
          Serviços e oportunidades para jovens.
        </Text>
      </View>

      <View style={styles.action}>
        <Text style={[styles.actionText, { color: themeColors.primary }]}>Visitar</Text>
        <ExternalLink size={15} color={themeColors.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 76,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  logoContainer: {
    width: 44,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logo: {
    width: 37,
    height: 50,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginLeft: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
