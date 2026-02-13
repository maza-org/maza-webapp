export interface CategoryParams {
  name: string | string[];
  id: string | string[];
  type?: string | string[];
}

export interface CategoryType {
  POPULAR: 'popular';
  NEW: 'new';
  SUGGESTED: 'suggested';
  SEARCH: 'search';
}

export interface CourseImage {
  url: string;
  formats?: {
    thumbnail?: {
      url: string;
    };
    small?: {
      url: string;
    };
  };
}

export interface CourseData {
  id: number;
  documentId: string;
  title: string;
  author?: string;
  rating_avg: number;
  subscribed: number;
  publishedAt: string;
  picture?: CourseImage;
}

export interface CoursesApiResponse {
  data: CourseData[];
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
}

export interface CategoryQueryParams {
  type: string;
  name?: string;
  id?: number | string;
  token?: string;
}

export interface CourseCardProps {
  course: CourseData;
  onPress: (course: CourseData) => void;
}

export interface ErrorComponentProps {
  error: string;
  onRetry: () => void;
}

export interface Category {
  id: number;
  name: string;
  courses: number;
  icon: string;
}

export interface CourseSubject {
  id: number;
  documentId: string;
  name: string;
}

export interface CourseForCategories {
  id: number;
  documentId: string;
  title: string;
  author: string | null;
  rating_avg: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  subjects: CourseSubject[];
}

export interface CategoriesApiResponse {
  data: Category[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface CategoryItemProps {
  category: Category;
  onPress: (category: Category) => void;
}

export interface JourneyItemProps {
  journey: Category;
  onPress: (journey: Category) => void;
}
