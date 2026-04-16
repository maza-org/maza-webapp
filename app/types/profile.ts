export interface Subject {
  id: number;
  documentId: string;
  name: string;
}

export interface Course {
  id: number;
  documentId: string;
  title: string;
  author: string | null;
  rating_avg: number;
  subscribed: number;
}

export interface Certificate {
  id: number;
  documentId: string;
  createdAt: string;
  course: Course | null;
}

export interface ProfileImageProps {
  profileImage: string | null;
  isUploadingImage: boolean;
  userFullname: string;
  onPress: () => void;
}

export interface InterestsSectionProps {
  interests: Subject[];
  isEditing: boolean;
  deletingInterestId: number | null;
  onDeleteInterest: (subject: Subject) => void;
  onAddInterest: () => void;
}

export interface CertificatesSectionProps {
  certificates: Certificate[];
  isLoadingCertificates: boolean;
  onViewCertificate: (certificate: Certificate) => void;
  onViewAll: () => void;
}
