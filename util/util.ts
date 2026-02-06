import { User } from '@/types/user';
import { baseUrl } from '@/services/api';

export const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';
export const validateMozambiquePhone = (phoneNumber: string) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const number = cleaned.startsWith('258') ? cleaned.slice(3) : cleaned;
  if (number.length !== 9) {
    return {
      isValid: false,
      error: 'O número deve ter 9 dígitos',
    };
  }
  const validPrefixes = ['82', '83', '84', '85', '86', '87'];
  const prefix = number.slice(0, 2);

  if (!validPrefixes.includes(prefix)) {
    return {
      isValid: false,
      error: 'O número deve começar com 82, 83, 84, 85, 86 ou 87',
    };
  }

  return {
    isValid: true,
    formattedNumber: `+258${number}`,
  };
};

export const getMediaUrl = (path: string | undefined | null) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('//')) {
    return path;
  }
  // Remove /api from the end of baseUrl if present to get the root URL
  const rootUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
  return `${rootUrl}${path}`;
};

export const formatDate = (date: string) => {
  if (!date) return '';

  return new Date(date).toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};
