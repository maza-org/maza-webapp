import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Opportunities from '../opportunities';
import { useJobsData } from '@/hooks/useJobsData';
import { router } from 'expo-router';

// Mock the hooks and modules
jest.mock('@/hooks/useJobsData');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  Ionicons: 'Ionicons',
}));

describe('Opportunities', () => {
  const mockJobs = [
    {
      id: 1,
      slug: 'job-1',
      title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Remote',
      type: 'Full-time',
      description: 'Job description',
    },
    {
      id: 2,
      slug: 'job-2',
      title: 'Product Manager',
      company: 'Product Inc',
      location: 'New York',
      type: 'Full-time',
      description: 'Job description',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    (useJobsData as jest.Mock).mockReturnValue({
      jobs: [],
      isLoading: true,
      isRefreshing: false,
      error: null,
      fetchJobs: jest.fn(),
      refreshJobs: jest.fn(),
    });

    const { getByTestId } = render(<Opportunities />);
    expect(getByTestId('title-skeleton')).toBeTruthy();
  });

  it('renders error state correctly', () => {
    const errorMessage = 'Failed to fetch jobs';
    (useJobsData as jest.Mock).mockReturnValue({
      jobs: [],
      isLoading: false,
      isRefreshing: false,
      error: errorMessage,
      fetchJobs: jest.fn(),
      refreshJobs: jest.fn(),
    });

    const { getByText } = render(<Opportunities />);
    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('renders empty state correctly', () => {
    (useJobsData as jest.Mock).mockReturnValue({
      jobs: [],
      isLoading: false,
      isRefreshing: false,
      error: null,
      fetchJobs: jest.fn(),
      refreshJobs: jest.fn(),
    });

    const { getByText } = render(<Opportunities />);
    expect(getByText('Nenhuma oportunidade encontrada')).toBeTruthy();
  });

  it('renders jobs list correctly', () => {
    (useJobsData as jest.Mock).mockReturnValue({
      jobs: mockJobs,
      isLoading: false,
      isRefreshing: false,
      error: null,
      fetchJobs: jest.fn(),
      refreshJobs: jest.fn(),
    });

    const { getByTestId } = render(<Opportunities />);
    const list = getByTestId('job-list');
    expect(list).toBeTruthy();
  });

  it('navigates to job detail when job card is pressed', () => {
    (useJobsData as jest.Mock).mockReturnValue({
      jobs: mockJobs,
      isLoading: false,
      isRefreshing: false,
      error: null,
      fetchJobs: jest.fn(),
      refreshJobs: jest.fn(),
    });

    const { getByTestId } = render(<Opportunities />);
    const list = getByTestId('job-list');

    // Find the first job card by its accessibility label
    const jobCard = getByTestId('job-card-1');
    fireEvent.press(jobCard);

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/jobs/[slug]',
      params: { slug: 'job-1' },
    });
  });

  it('refreshes jobs list when pull-to-refresh is triggered', async () => {
    const refreshJobs = jest.fn();
    (useJobsData as jest.Mock).mockReturnValue({
      jobs: mockJobs,
      isLoading: false,
      isRefreshing: false,
      error: null,
      fetchJobs: jest.fn(),
      refreshJobs,
    });

    const { getByTestId } = render(<Opportunities />);
    const list = getByTestId('job-list');

    // Simulate pull-to-refresh
    fireEvent.scroll(list, {
      nativeEvent: {
        contentOffset: { y: -100 },
        contentSize: { height: 1000 },
        layoutMeasurement: { height: 500 },
      },
    });

    // Trigger the refresh control
    const refreshControl = list.props.refreshControl;
    refreshControl.props.onRefresh();

    await waitFor(() => {
      expect(refreshJobs).toHaveBeenCalled();
    });
  });

  it('handles error boundary correctly', () => {
    // Mock an error to trigger the error boundary
    (useJobsData as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });

    const { getByText } = render(<Opportunities />);
    expect(getByText('Ocorreu um erro inesperado. Por favor, tente novamente.')).toBeTruthy();
  });
});
