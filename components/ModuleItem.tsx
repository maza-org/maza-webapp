import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Content, UserCourseContent, ContentState } from '@/types/learning';

// Extended content type that can include state from UserCourseContent
interface ContentWithState extends Content {
  contentId?: number;
  state?: ContentState;
  date?: string | null;
}

interface ModuleItemProps {
  content: ContentWithState;
  index: number;
  selectedContent?: ContentWithState;
  onPress: (content: ContentWithState) => void;
}

const ModuleItem = ({ content, index, selectedContent, onPress }: ModuleItemProps) => {
  const isVideo = content.format !== 'Text';
  const isSelected = selectedContent?.id === content.id;
  const isCompleted = content.state === 'Finished';

  const renderIcon = () => {
    if (isCompleted) {
      return (
        <View style={styles.completedIconContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
        </View>
      );
    }

    if (isVideo) {
      return (
        <View style={styles.iconContainer}>
          <Ionicons name="play" size={20} color="#4db5ff" />
        </View>
      );
    }

    if (content.format === 'Text') {
      return (
        <View style={styles.iconContainer}>
          <Ionicons name="reader" size={20} color="#4db5ff" />
        </View>
      );
    }

    return null;
  };

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
            <Text style={[styles.moduleTitle, isCompleted && styles.moduleTitleCompleted]}>
              {content.title}
            </Text>
          </View>
          <View style={styles.moduleDetails}>
            {renderIcon()}
          </View>
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
  completedIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleTitleCompleted: {
    color: '#A8A8B3',
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
