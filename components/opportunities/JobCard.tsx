import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useMemo } from 'react';
import { Image } from 'expo-image';
import { Job } from '@/types/job';
import { createThemedStyles } from './styles';
import he from 'he';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface JobCardProps {
  job: Job;
  onPress: (job: Job) => void;
}

export const JobCard = memo(({ job, onPress }: JobCardProps) => {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = useMemo(() => createThemedStyles(colors, isDark), [colors, isDark]);

  const handlePress = useCallback(() => {
    onPress(job);
  }, [job, onPress]);

  const Badge = ({ text, type }: { text: string; type: 'language' | 'new' }) => (
    <View style={[styles.badge, type === 'new' ? styles.newBadge : styles.languageBadge]}>
      <Text style={[type === 'new' ? styles.newBadgeText : styles.languageBadgeText]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );

  const MetaItem = ({ icon, text }: { icon: string; text?: string }) => {
    if (!text) return null;
    return (
      <View style={styles.metaItem}>
        <Ionicons name={icon as any} size={14} color={colors.textMuted} />
        <Text style={styles.metaText} numberOfLines={1}>
          {text}
        </Text>
      </View>
    );
  };

  const CompanyLogo = ({ logo, name = '?' }: { logo?: string; name?: string }) => (
    <View style={styles.companyLogoContainer}>
      {logo ? (
        <Image
          source={{ uri: logo }}
          style={styles.companyLogo}
          contentFit="contain"
          transition={300}
          accessibilityLabel={`Logo da ${name}`}
        />
      ) : (
        <View style={styles.placeholderLogo}>
          <Text style={styles.placeholderText}>{name.charAt(0)}</Text>
        </View>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Vaga: ${job.title} em ${job.company?.name}`}
      accessibilityHint="Toque para ver detalhes da vaga"
      testID={`job-card-${job.id}`}
    >
      <View style={styles.jobHeader}>
        <CompanyLogo logo={job.company?.logo} name={job.company?.name} />
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {he.decode(job.title)}
          </Text>
          <Text style={styles.companyName} numberOfLines={1}>
            {he.decode(job.company?.name)}
          </Text>
          <View style={styles.jobMeta}>
            <MetaItem icon="location-outline" text={job.city?.name} />
            <MetaItem icon="briefcase-outline" text={job.category?.name} />
          </View>
        </View>
      </View>

      {job.meta?.language && <Badge type="language" text={job.meta.language.name} />}

      {job.meta?.new_post && <Badge type="new" text="Novo" />}
    </TouchableOpacity>
  );
});
