import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '@/types/job';
import { createJobDetailsStyles } from '../styles/jobDetails.styles';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface JobMetadataProps {
  job: Job;
}

export const JobMetadata: React.FC<JobMetadataProps> = ({ job }) => {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = useMemo(() => createJobDetailsStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={styles.metadataContainer}>
      {job.locations && job.locations.length > 0 && (
        <View style={styles.metadataItem}>
          <Ionicons name="location-outline" size={18} color={colors.textMuted} />
          <Text style={styles.metadataText}>{job.locations[0].name}</Text>
        </View>
      )}

      {job.categories && job.categories.length > 0 && (
        <View style={styles.metadataItem}>
          <Ionicons name="briefcase-outline" size={18} color={colors.textMuted} />
          <Text style={styles.metadataText}>{job.categories[0].name}</Text>
        </View>
      )}

      {job.date && (
        <View style={styles.metadataItem}>
          <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
          <Text style={styles.metadataText}>Publicado em: {job.date}</Text>
        </View>
      )}

      {job.expire_date && (
        <View style={styles.metadataItem}>
          <Ionicons name="time-outline" size={18} color={colors.textMuted} />
          <Text style={styles.metadataText}>Expira em: {job.expire_date}</Text>
        </View>
      )}

      {job.meta?.language && (
        <View style={styles.languageBadge}>
          <Text style={styles.languageBadgeText}>{job.meta.language.name}</Text>
        </View>
      )}
    </View>
  );
};
