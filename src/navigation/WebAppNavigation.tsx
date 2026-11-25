import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useIsWideWeb } from '../utils/webViewport';

const destinations = [
  { name: 'Início', icon: 'home-outline' },
  { name: 'Cursos', icon: 'library-outline' },
  { name: 'Oportunidades', icon: 'briefcase-outline' },
  { name: 'Conquistas', icon: 'trophy-outline' },
  { name: 'Perfil', icon: 'person-outline' },
] as const;

export default function WebAppNavigation({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const wide = useIsWideWeb(900);
  return <View testID="web-app-navigation" style={[styles.bar, { backgroundColor: colors.card, borderColor: colors.border }]}>
    {wide ? <Image source={require('../../assets/maza-logo-azul.png')} resizeMode="contain" accessibilityLabel="MAZA" style={styles.logo} /> : null}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.links}>
      {destinations.map(item => <TouchableOpacity
        key={item.name}
        accessibilityRole="button"
        accessibilityLabel={`Ir para ${item.name}`}
        {...({ title: item.name } as any)}
        onPress={() => navigation.navigate('Main', { screen: item.name }, { pop: true })}
        style={styles.link}
      >
        <Ionicons name={item.icon} size={21} color={colors.primary} />
        {wide ? <Text style={[styles.label, { color: colors.text }]}>{item.name}</Text> : null}
      </TouchableOpacity>)}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingHorizontal: 12, paddingVertical: 6, gap: 20 },
  logo: { width: 106, height: 39, marginHorizontal: 8 },
  links: { alignItems: 'center', gap: 6, flexGrow: 1 },
  link: { minWidth: 44, minHeight: 44, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 4 },
  label: { fontSize: 14, fontWeight: '600' },
});
