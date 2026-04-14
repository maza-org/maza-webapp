export interface Certificate {
  id: number;
  documentId: string;
  createdAt: string;
  course: {
    id: number;
    documentId: string;
    title: string;
    author: string | null;
    rating_avg: number;
    subscribed: number;
  } | null;
}

export interface CertificatesResponse {
  data: Certificate[];
  meta?: any;
}

export interface CertificateItemProps {
  certificate: Certificate;
  onPress: (certificate: Certificate) => void;
}
