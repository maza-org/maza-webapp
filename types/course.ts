import exp from 'node:constants';

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

export interface ImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

export interface Image {
  id: number;
  documentId: string;
  url: string;
  ext: string;
  width: number;
  height: number;
  formats: {
    [key: string]: ImageFormat;
  };
}

export interface Course {
  id: number;
  documentId: string;
  title: string;
  author: string | null;
  rating_avg: number;
  subscribed: number;
  description: string | null;
  level: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  subjects: Subject[];
  picture: Image;
  cover: Image;
}

export interface Subject {
  id: number;
  documentId: string;
  name: string;
}

interface PictureFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: null;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

interface PictureFormats {
  small?: PictureFormat;
  medium?: PictureFormat;
  thumbnail?: PictureFormat;
}

export interface Picture {
  id: number;
  documentId: string;
  url: string;
  ext: string;
  width: number;
  height: number;
  formats: PictureFormats;
}
