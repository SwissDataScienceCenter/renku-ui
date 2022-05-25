import { Visibilities } from "../../utils/components/visibility/Visibility";
import { Creator } from "../../utils/components/list/List.d";

interface KgSearchResultLink {
  rel: string;
  href: string;
}

type KgAuthor = "user" | "all" ;

// These are used by the TS compiler does not realize it.
/* eslint-disable no-unused-vars */
export enum EntityType {
  Project = "project",
  Dataset = "dataset",
}
/* eslint-enable no-unused-vars */

interface KgSearchResult {
  _links: KgSearchResultLink[];
  creator: Creator[];
  description: string;
  date: string;
  keywords: string[];
  matchingScore: number;
  name: string;
  namespace: string;
  path: string;
  type: EntityType;
  visibility: Visibilities;
}

interface ListResponse<T> {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  results: T[];
}

export const TOTAL_RESULT_PER_PAGE = 20;

export type { ListResponse, KgAuthor, KgSearchResult, KgSearchResultLink };
