import React from 'react';
import { Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Job } from '@/types/job';
import { useJobDetails } from '@/hooks/useJobs';
import { JobHeader } from '../components/JobHeader';
import JobContent from '@/app/components/jobs/JobContent';
import JobDetailsHeader from '@/app/components/jobs/JobDetailsHeader';
import JobApplyFooter from '@/app/components/jobs/JobApplyFooter';
import JobLoadingState from '@/app/components/jobs/JobLoadingState';
import JobErrorState from '@/app/components/jobs/JobErrorState';
import { styles } from '../styles/jobDetails.styles';


export default function JobDetails() {
  const { slug } = useLocalSearchParams();
  const {
    data: job,
    isLoading: loading,
    error: queryError,
  }: {
    data: Job | undefined;
    isLoading: boolean;
    error: any;
  } = useJobDetails(slug as string);

  const error = !slug
    ? 'Identificador da vaga não encontrado'
    : queryError instanceof Error
      ? queryError.message
      : typeof queryError === 'string'
        ? queryError
        : null;

  const handleShare = async () => {
    if (!job) return;

    try {
      await Share.share({
        message: `Confira esta vaga: ${job.title} - ${job.url}`,
      });
    } catch (error) {
      console.error('Error sharing job:', error);
    }
  };


  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {job && <JobHeader job={job} onShare={handleShare} onBack={() => router.back()} />}

      {loading ? (
        <JobLoadingState />
      ) : error ? (
        <JobErrorState error={error} />
      ) : job ? (
        <>
          <JobContent job={job}>
            <JobDetailsHeader job={job} />
          </JobContent>
          <JobApplyFooter job={job} />
        </>
      ) : null}
    </SafeAreaView>
  );
}
