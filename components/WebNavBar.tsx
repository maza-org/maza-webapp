import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function WebNavBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];

  return (
    <View style={[styles.navBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.content}>
        {/* Logo Section */}
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={() => navigation.navigate({ name: 'index', merge: true })}
          activeOpacity={0.7}
        >
          <Image 
            source={require('@/assets/images/maza-logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </TouchableOpacity>

        {/* Links Section */}
        <View style={styles.linksContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                // The `merge: true` option makes sure that the params inside the tab screen are preserved
                navigation.navigate({ name: route.name, merge: true });
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.linkButton}
              >
                <Text style={[
                  styles.linkText, 
                  { color: isFocused ? colors.primary : colors.text },
                  isFocused && styles.linkTextFocused
                ]}>
                  {label as string}
                </Text>
                {isFocused && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    height: 70,
    width: '100%',
    borderBottomWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 } : {}),
  },
  content: {
    width: '100%',
    maxWidth: 1200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: '100%',
  },
  logoContainer: {
    marginRight: 40,
  },
  logo: {
    width: 100,
    height: 40,
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  linkButton: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  linkText: {
    fontSize: 16,
    fontFamily: 'ManropeMedium',
  },
  linkTextFocused: {
    fontFamily: 'ManropeBold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});
