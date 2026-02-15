import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Content, ContentState } from '@/types/learning';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

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
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const isVideo = content.format === 'Video';
  const isPdf = content.format === 'PDF';
  const isText = content.format === 'Text';
  const isAudio = content.format === 'Audio';
  const isPicture = content.format === 'Picture';
  const isSelected = selectedContent?.id === content.id;
  const isCompleted = content.state === 'Finished';

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        moduleItem: {
          padding: 16,
          backgroundColor: isDark ? '#202024' : colors.cardBackground,
          borderRadius: 15,
          marginBottom: 12,
          borderWidth: isDark ? 0 : 1,
          borderColor: colors.border,
        },
        moduleItemSelected: {
          backgroundColor: isDark ? 'rgba(32, 32, 36, 0.8)' : colors.cardBackground,
          borderColor: colors.primary,
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
          color: colors.text,
          fontSize: 16,
          fontWeight: '500',
          fontFamily: 'ManropeMedium',
        },
        moduleTitle: {
          color: colors.text,
          fontSize: 16,
          fontWeight: '500',
          flex: 1,
          fontFamily: 'ManropeMedium',
        },
        moduleDetails: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        iconContainer: {
          backgroundColor: isDark ? '#2a2d3e' : colors.inputBackground,
          borderRadius: 50,
          padding: 5,
        },
        completedIconContainer: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        moduleTitleCompleted: {
          color: colors.textMuted,
        },
        moduleType: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginStart: 25,
        },
        moduleTypeText: {
          color: colors.textMuted,
          fontSize: 12,
          fontFamily: 'ManropeRegular',
        },
      }),
    [colors, isDark]
  );

  const renderIcon = () => {
    if (isCompleted) {
      return (
        <View style={themedStyles.completedIconContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
        </View>
      );
    }

    if (isVideo) {
      return (
        <View style={themedStyles.iconContainer}>
          <Ionicons name="play" size={20} color={colors.primary} />
        </View>
      );
    }

    if (isPdf) {
      return (
        <View style={themedStyles.iconContainer}>
          <Ionicons name="document-text" size={20} color={colors.primary} />
        </View>
      );
    }

    if (isText) {
      return (
        <View style={themedStyles.iconContainer}>
          <Ionicons name="reader" size={20} color={colors.primary} />
        </View>
      );
    }

    if (isAudio) {
      return (
        <View style={themedStyles.iconContainer}>
          <Ionicons name="volume-medium" size={20} color={colors.primary} />
        </View>
      );
    }

    if (isPicture) {
      return (
        <View style={themedStyles.iconContainer}>
          <Ionicons name="image" size={20} color={colors.primary} />
        </View>
      );
    }

    return null;
  };

  return (
    <TouchableOpacity
      key={content.id}
      style={[themedStyles.moduleItem, isSelected && themedStyles.moduleItemSelected]}
      onPress={() => onPress(content)}
    >
      <View style={themedStyles.moduleContent}>
        <View style={themedStyles.moduleTopRow}>
          <View style={themedStyles.moduleInfo}>
            <Text style={themedStyles.moduleNumber}>{index + 1}.</Text>
            <Text style={[themedStyles.moduleTitle, isCompleted && themedStyles.moduleTitleCompleted]}>
              {content.title}
            </Text>
          </View>
          <View style={themedStyles.moduleDetails}>{renderIcon()}</View>
        </View>
        <View style={themedStyles.moduleType}>
          <Feather
            name={isVideo ? 'video' : isPdf ? 'file' : isAudio ? 'mic' : isPicture ? 'image' : 'file-text'}
            size={14}
            color={colors.textMuted}
          />
          <Text style={themedStyles.moduleTypeText}>
            {isVideo ? 'Video' : isPdf ? 'PDF' : isAudio ? 'Áudio' : isPicture ? 'Imagem' : 'Texto'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ModuleItem;
