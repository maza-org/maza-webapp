import React from 'react';
import { View, TouchableOpacity, Text, Linking } from 'react-native';
import { Job } from '@/types/job';
import { styles } from '@/app/styles/jobDetails.styles';

interface JobApplyFooterProps {
  job: Job;
}

export default function JobApplyFooter({ job }: JobApplyFooterProps) {
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
