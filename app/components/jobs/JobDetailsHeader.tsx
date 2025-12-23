import React from 'react';
import { View, Text, Image } from 'react-native';
import { Job } from '@/types/job';
import { JobMetadata } from '@/app/components/JobMetadata';
import { styles } from '@/app/styles/jobDetails.styles';

interface JobDetailsHeaderProps {
  job: Job;
}

export default function JobDetailsHeader({ job }: JobDetailsHeaderProps) {
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
