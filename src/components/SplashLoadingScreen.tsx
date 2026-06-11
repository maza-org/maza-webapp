import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const APP_VERSION = '4.4.6';

export default function SplashLoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Image
          source={require('../../assets/maza-splash-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.version}>v{APP_VERSION}</Text>
      </View>
      <ActivityIndicator color={colors.white} size="large" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -24 }],
  },
  logo: {
    width: 178,
    height: 238,
  },
  version: {
    marginTop: 18,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  spinner: {
    position: 'absolute',
    bottom: 96,
  },
});
