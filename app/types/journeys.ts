export interface Root {
  data: Journey[];
  meta: Meta;
}

export interface Journey {
  id: number;
  documentId: string;
  name: string;
  categories: any[];
  courses: any[];
  icon?: string;
}

export interface Meta {
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}
