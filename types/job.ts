interface City {
  id: number;
  slug: string;
  name: string;
}

interface Category {
  id: number;
  slug: string;
  name: string;
}

interface Company {
  id: string;
  logo: string;
  url: string;
  slug: string;
  name: string;
}

interface Language {
  id: string;
  name: string;
}

interface Meta {
  training: string;
  recommended: boolean;
  new_post: boolean;
  language: Language;
}

interface Location {
  id: number;
  slug: string;
  name: string;
}

interface Category {
  id: number;
  slug: string;
  name: string;
}

export declare interface Job {
  id: number;
  url: string;
  ext_apply_url: string;
  excerpt: string;
  content: string;
  slug: string;
  title: string;
  city: City;
  category: Category;
  tags: any[];
  filter_id: number;
  is_from_anonymous_company: boolean;
  company: Company;
  meta: Meta;
  date: string;
  expire_date: string;
  locations: Location[];
  categories: Category[];
}
