export interface WindowsApp {
  id: string | number;
  slug?: string;
  title: string;
  description: string;
  category: string;
  downloads: string;
  rating: string;
  lastUpdated: string;
  image: string;
  developer: string;
  license: string;
  stars: string;
  tags: string[];
  logo?: string | null;
  repositoryUrl?: string;
}

export type SortOption =
  | "popular"
  | "newest"
  | "rating"
  | "atoz"
  | "ztoa"
  | "downloads";
