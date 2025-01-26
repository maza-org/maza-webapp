import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Content } from '@/app/room/lessons';

interface ModuleItemProps {
  content: Content;
  index: number;
  selectedContent?: Content;
  onPress: (content: Content) => void;
}

const ModuleItem = ({ content, index, selectedContent, onPress }: ModuleItemProps) => {
  const isVideo = content.format !== 'Text';
  const isSelected = selectedContent?.id === content.id;

  return (
    <TouchableOpacity
      key={content.id}
      style={[styles.moduleItem, isSelected && styles.moduleItemSelected]}
      onPress={() => onPress(content)}
    >
      <View style={styles.moduleContent}>
        <View style={styles.moduleTopRow}>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleNumber}>{index + 1}.</Text>
            <Text style={styles.moduleTitle}>{content.title}</Text>
          </View>
          {isVideo ? (
            <View style={styles.moduleDetails}>
              <View style={styles.iconContainer}>
                <Ionicons name="play" size={20} color="#4db5ff" />
              </View>
            </View>
          ) : (
            content.format === 'Text' && (
              <View style={styles.moduleDetails}>
                <View style={styles.iconContainer}>
                  <Ionicons name="reader" size={20} color="#4db5ff" />
                </View>
              </View>
            )
          )}
        </View>
        <View style={styles.moduleType}>
          <Feather name={isVideo ? 'video' : 'file-text'} size={14} color="#A8A8B3" />
          <Text style={styles.moduleTypeText}>{isVideo ? 'Video' : 'Texto'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  moduleItem: {
    padding: 16,
    backgroundColor: '#202024',
    borderRadius: 15,
    marginBottom: 12,
  },
  moduleItemSelected: {
    backgroundColor: 'rgba(32, 32, 36, 0.8)',
    borderColor: '#00B37E',
    borderWidth: 1,
  },
  moduleContent: {
    gap: 12,
  },
  moduleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  moduleNumber: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  moduleTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  moduleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#2a2d3e',
    borderRadius: 50,
    padding: 5,
  },
  moduleType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginStart: 25,
  },
  moduleTypeText: {
    color: '#A8A8B3',
    fontSize: 12,
  },
});

export default ModuleItem;
