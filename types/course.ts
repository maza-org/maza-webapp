export interface Course {
  title: string;
  id: number;
  documentId: string;
  author: string | null;
  rating_avg: number;
  subjects: {
    id: number;
    documentId: string;
    name: string;
  }[];
  picture: Picture;
}

export interface ApiResponse {
  data: Course[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface Picture {
  id: number;
  documentId: string;
  url: string;
  ext: string;
  width: number;
  height: number;
  formats: {
    large?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    thumbnail?: ImageFormat;
  };
}

export interface ImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: null | string;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}
