import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '@/types/job';
import { styles } from '../styles/jobDetails.styles';

interface JobHeaderProps {
  job: Job;
  onShare: () => void;
  onBack: () => void;
}

export const JobHeader: React.FC<JobHeaderProps> = ({ job, onShare, onBack }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        Detalhes da Vaga
      </Text>
      <TouchableOpacity style={styles.shareButton} onPress={onShare}>
        <Ionicons name="share-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};
