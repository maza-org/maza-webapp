export interface SearchResult {
  id: number;
  title: string;
  documentId: string;
  author: string;
  rating_avg: number;
  subscribed: number;
  subjects: Array<{
    id: number;
    name: string;
  }>;
  picture?: {
    formats?: {
      thumbnail?: {
        url: string;
      };
    };
  };
}

export interface SearchResponse {
  data: SearchResult[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface SearchTagProps {
  label: string;
  onRemove: () => void;
}

export interface CategoryButtonProps {
  icon: string;
  label: string;
  category: Category;
  handlePressCategory: (category: Category) => void;
}

export interface Category {
  id: number;
  icon: string;
  label: string;
}

export interface CourseItemProps {
  item: SearchResult;
  onPress: () => void;
}
