import React, { useMemo } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '@/types/job';
import { createJobDetailsStyles } from '../styles/jobDetails.styles';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface JobHeaderProps {
  job: Job;
  onShare: () => void;
  onBack: () => void;
}

export const JobHeader: React.FC<JobHeaderProps> = ({ job, onShare, onBack }) => {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = useMemo(() => createJobDetailsStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        Detalhes da Vaga
      </Text>
      <TouchableOpacity style={styles.shareButton} onPress={onShare}>
        <Ionicons name="share-outline" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};
