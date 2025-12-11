export interface Certificate {
  id: number;
  documentId: string;
  createdAt: string;
  course: {
    id: number;
    documentId: string;
    title: string;
    author: string;
    rating_avg: number;
    subscribed: number;
  };
}

export interface CertificatesResponse {
  data: Certificate[];
  meta?: any;
}

export interface CertificateItemProps {
  certificate: Certificate;
  onPress: (certificate: Certificate) => void;
}