import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, Linking } from 'react-native';
import { Job } from '@/types/job';
import { createJobDetailsStyles } from '@/app/styles/jobDetails.styles';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface JobApplyFooterProps {
  job: Job;
}

export default function JobApplyFooter({ job }: JobApplyFooterProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = useMemo(() => createJobDetailsStyles(colors, isDark), [colors, isDark]);

  const handleApply = () => {
    const applyUrl = job.ext_apply_url || job.url;
    Linking.openURL(applyUrl).catch((err) => {
      console.error('Error opening apply URL:', err);
      alert('Não foi possível abrir o link de candidatura.');
    });
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
        <Text style={styles.applyButtonText}>Candidatar-se</Text>
      </TouchableOpacity>
    </View>
  );
}
