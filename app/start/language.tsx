import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageItemProps {
  language: Language;
  isSelected: boolean;
  onSelect: (code: string) => void;
}

function LanguageItem({ language, isSelected, onSelect }: LanguageItemProps): JSX.Element {
  return (
    <TouchableOpacity style={styles.languageItem} onPress={() => onSelect(language.code)} activeOpacity={0.7}>
      <View style={styles.languageInfo}>
        <Image source={{ uri: language.flag }} style={styles.flag} />
        <Text style={styles.languageName}>{language.name}</Text>
      </View>
      <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
        {isSelected && <View style={styles.radioButtonInner} />}
      </View>
    </TouchableOpacity>
  );
}

export default function Language() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const languages: Language[] = [
    {
      code: 'af',
      name: 'Africâner',
      flag: 'https://flagcdn.com/w40/za.png',
    },
    {
      code: 'ar',
      name: 'Árabe',
      flag: 'https://flagcdn.com/w40/sa.png',
    },
    {
      code: 'bs',
      name: 'Bósnio',
      flag: 'https://flagcdn.com/w40/ba.png',
    },
    {
      code: 'zh',
      name: 'Chinês (Mandarim)',
      flag: 'https://flagcdn.com/w40/cn.png',
    },
    {
      code: 'nl',
      name: 'Holandês',
      flag: 'https://flagcdn.com/w40/nl.png',
    },
    {
      code: 'en',
      name: 'Inglês',
      flag: 'https://flagcdn.com/w40/gb.png',
    },
    {
      code: 'fr',
      name: 'Francês',
      flag: 'https://flagcdn.com/w40/fr.png',
    },
    {
      code: 'de',
      name: 'Alemão',
      flag: 'https://flagcdn.com/w40/de.png',
    },
    {
      code: 'hi',
      name: 'Hindi',
      flag: 'https://flagcdn.com/w40/in.png',
    },
  ];

  const handleLanguageSelect = (code: string): void => {
    setSelectedLanguage(code);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Escolha{'\n'}o seu idioma</Text>
            <Text style={styles.subtitle}>Escolha o seu idioma preferido</Text>
          </View>

          <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
            {languages.map((language) => (
              <LanguageItem
                key={language.code}
                language={language}
                isSelected={selectedLanguage === language.code}
                onSelect={handleLanguageSelect}
              />
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#A8A8B3',
    lineHeight: 24,
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#323238',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#323238',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#00B37E',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22ACE3',
  },
});
