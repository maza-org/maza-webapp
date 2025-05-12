export type Job = {
  id: number;
  filter_id: number;
  apply_through_filter: boolean;
  type: string;
  recommended: boolean;
  url: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  date_iso: string;
  locations: {
    id: number;
    slug: string;
    name: string;
  }[];
  categories: {
    id: number;
    slug: string;
    name: string;
  }[];
  tags: any[];
  expire_date: string;
  expired: boolean;
  address: string;
  company: {
    id: string;
    logo: string;
    url: string;
    name: string;
    slug: string;
    description: string;
  };
  meta: {
    language: {
      id: string;
      name: string;
    };
  };
  ext_apply_url: string;
};
