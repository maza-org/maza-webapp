import React, { useMemo } from 'react';
import { View, Text, Image } from 'react-native';
import { Job } from '@/types/job';
import { JobMetadata } from '@/app/components/JobMetadata';
import { createJobDetailsStyles } from '@/app/styles/jobDetails.styles';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface JobDetailsHeaderProps {
  job: Job;
}

export default function JobDetailsHeader({ job }: JobDetailsHeaderProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const styles = useMemo(() => createJobDetailsStyles(colors, isDark), [colors, isDark]);

  return (
    <>
      <View style={styles.jobHeader}>
        <View style={styles.companyLogoContainer}>
          {job.company?.logo ? (
            <Image source={{ uri: job.company.logo }} style={styles.companyLogo} resizeMode="contain" />
          ) : (
            <View style={styles.placeholderLogo}>
              <Text style={styles.placeholderText}>{job.company?.name?.charAt(0) || '?'}</Text>
            </View>
          )}
        </View>
        <View style={styles.jobTitleContainer}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.companyName}>{job.company?.name}</Text>
        </View>
      </View>

      <JobMetadata job={job} />
    </>
  );
}
