interface KgSearchResultLink {
  rel: string;
  href: string;
}

type KgSearchResultType = "project" | "dataset" | "person" | "workflow";

type KgVisibility = "public" | "internal" | "private";

interface KgSearchResult {
  _links: KgSearchResultLink[];
  creator: string;
  date: string;
  keywords: string[];
  matchingScore: number;
  name: string;
  namespace: string;
  path: string;
  type: KgSearchResultType;
  visibility: KgVisibility;
}

interface ListResponse<T> {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  results: T[];
}

export type { KgSearchResult, ListResponse };
