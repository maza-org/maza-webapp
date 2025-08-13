import { Job } from '../types/job';

const API_BASE_URL = 'https://www.emprego.co.mz/wp-api';

export const fetchJobDetails = async (slug: string): Promise<Job> => {
  const endpoint = `${API_BASE_URL}/vacancies?name=${slug}`;

  const headers = {
    accept: 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'en-US,en;q=0.9',
    'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'x-requested-with': 'XMLHttpRequest',
  };

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('Vaga não encontrada');
  }

  return data.results[0];
};

export const searchJobs = async (query: string): Promise<Job[]> => {
  const endpoint = `${API_BASE_URL}/search/?s=${encodeURIComponent(query)}`;

  const headers = {
    accept: 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'en-US,en;q=0.9',
    'x-requested-with': 'XMLHttpRequest',
  };

  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  if (!data.results) return [];

  // Map API response to Job type, adding city/category for JobCard compatibility
  return data.results.map((job: any) => ({
    ...job,
    city: job.locations && job.locations.length > 0 ? job.locations[0] : undefined,
    category: job.categories && job.categories.length > 0 ? job.categories[0] : undefined,
  }));
};
