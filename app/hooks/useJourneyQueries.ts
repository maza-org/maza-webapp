import { useQuery } from '@tanstack/react-query';
import JourneyService from '@/app/services/JourneyService';

export const useGetJourneys = () => {
  return useQuery({
    queryKey: ['journeys'],
    queryFn: () => JourneyService.getJourneys(),
  });
};

export const useGetJourney = (id: string | number) => {
  return useQuery({
    queryKey: ['journey', id],
    queryFn: () => JourneyService.getJourneyById(String(id)),
    enabled: !!id,
  });
};

export const useGetJourneyCourses = (journeyId: string | number) => {
  return useQuery({
    queryKey: ['journey', journeyId, 'courses'],
    queryFn: () => JourneyService.getJourneyCourses(String(journeyId)),
    enabled: !!journeyId,
  });
};
