import { ScrollView, StyleSheet, SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { Content } from '@/app/room/lessons';
import { useState } from 'react';

export default function TextViewer() {
  const { content } = useLocalSearchParams();
  const _content = JSON.parse(content as string) as Content;
  const [hasReachedBottom, setHasReachedBottom] = useState(false);

  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 20;

    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom && !hasReachedBottom) {
      setHasReachedBottom(true);
      console.log('Reached bottom of content');
      // Add your logic here when bottom is reached
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {_content.title}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} onScroll={handleScroll} scrollEventThrottle={400}>
        <Markdown style={markdownStyles}>{_content.description || ''}</Markdown>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#323238',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40, // Same width as backButton for alignment
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
});

const markdownStyles = {
  body: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 16,
    color: '#fff',
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 12,
    color: '#fff',
  },
  strong: {
    color: '#1fa2df',
    fontWeight: '600',
  },
  paragraph: {
    marginVertical: 8,
    color: '#A8A8B3',
  },
  list: {
    marginLeft: 20,
  },
  listItem: {
    marginVertical: 4,
    color: '#A8A8B3',
  },
  listUnorderedItemIcon: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1fa2df',
  },
  hr: {
    backgroundColor: '#323238',
    height: 1,
    marginVertical: 16,
  },
  link: {
    color: '#1fa2df',
  },
  blockquote: {
    backgroundColor: '#202024',
    borderLeftColor: '#1fa2df',
    borderLeftWidth: 4,
    padding: 8,
    marginVertical: 8,
  },
  blockquoteText: {
    color: '#A8A8B3',
  },
  code_inline: {
    backgroundColor: '#202024',
    color: '#1fa2df',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  code_block: {
    backgroundColor: '#202024',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
};
