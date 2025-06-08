import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback } from 'react';
import { Image } from 'expo-image';
import { Job } from '@/types/job';
import { styles } from './styles';
import he from 'he';

interface BadgeProps {
  text: string;
  type: 'language' | 'new';
}

const Badge = memo(({ text, type }: BadgeProps) => (
  <View style={[styles.badge, type === 'new' ? styles.newBadge : styles.languageBadge]}>
    <Text style={[type === 'new' ? styles.newBadgeText : styles.languageBadgeText]} numberOfLines={1}>
      {text}
    </Text>
  </View>
));

interface MetaItemProps {
  icon: string;
  text?: string;
}

const MetaItem = memo(({ icon, text }: MetaItemProps) => {
  if (!text) return null;

  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon as any} size={14} color="#8F8F8F" />
      <Text style={styles.metaText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
});

interface CompanyLogoProps {
  logo?: string;
  name?: string;
}

const CompanyLogo = memo(({ logo, name = '?' }: CompanyLogoProps) => (
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
));

interface JobCardProps {
  job: Job;
  onPress: (job: Job) => void;
}

export const JobCard = memo(({ job, onPress }: JobCardProps) => {
  const handlePress = useCallback(() => {
    onPress(job);
  }, [job, onPress]);

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
