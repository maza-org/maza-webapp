export interface Module {
  id: string;
  title: string;
}

export interface Subject {
  name: string;
}

export interface ImageFormat {
  url: string;
}

export interface Cover {
  url?: string;
  formats?: {
    thumbnail?: ImageFormat;
  };
}

export interface FinalTest {
  [key: string]: any;
}

export interface CourseData {
  title: string;
  author?: string;
  picture?: ImageFormat;
  cover?: Cover;
  subjects?: Subject[];
  modules?: Module[];
  final_test?: FinalTest;
  subscribed?: number;
  rating_avg?: number;
}