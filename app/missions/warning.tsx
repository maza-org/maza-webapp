import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';

export default function Warning() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Message box at the top */}
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>Aumente o volume para{'\n'}ter a melhor experiência.</Text>
        </View>

        {/* Globe character with phone */}
        <View style={styles.characterContainer}>
          <Image
            source={{ uri: 'https://res.cloudinary.com/dsthrsoyj/image/upload/v1746082610/maza/globe_qtnqpy.webp' }}
            style={styles.characterImage}
          />
        </View>

        {/* Chapter info at bottom */}
        <View style={styles.chapterContainer}>
          <Text style={styles.chapterLabel}>Capítulo 1</Text>
          <Text style={styles.chapterTitle}>Mudanças Climáticas</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 80,
    paddingBottom: 100,
  },
  messageBox: {
    borderWidth: 1,
    borderColor: '#1fa2df',
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 30,
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterImage: {
    width: 230,
    height: 230,
    resizeMode: 'contain',
  },
  chapterContainer: {
    alignItems: 'center',
  },
  chapterLabel: {
    color: '#A8A8B3',
    fontSize: 18,
    marginBottom: 5,
  },
  chapterTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
