/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DateTime } from "luxon";

import type { Role } from "../projectsV2/api/projectV2.api";
import type { SearchEntity, Visibility } from "./api/searchV2Api.api";

export interface SearchV2State {
  // Free text query (URL param "q")
  query: string;

  // Filters (flat, matching URL params)
  contentType: string;
  visibility: string;
  role: string;
  keywords: string;
  directMember: string;
  created: string;

  // Pagination
  page: number;
  perPage: number;

  // Context
  namespace?: string;
  includeCounts: boolean;

  // Tracks which filter keys were typed in the search bar.
  // Only these filters are reflected back in the search bar text
  // when their value changes via the sidebar.
  searchBarFilterKeys: string[];
}

export interface InitFromUrlParams {
  query: string;
  contentType: string;
  visibility: string;
  role: string;
  keywords: string;
  directMember: string;
  created: string;
  page: number;
  perPage: number;
}

export interface ApplyParsedSearchParams {
  query: string;
  contentType?: string;
  visibility?: string;
  role?: string;
  created?: string;
}

export type SearchOption = SearchFilter | SearchDateFilter;

export interface SearchDateFilters {
  created: CreationDateFilter;
}

export type SearchDateFilter = CreationDateFilter;

type SearchDateFilterBase<K extends string> = {
  key: K;
  value: {
    after?: AfterDateValue;
    before?: BeforeDateValue;
  };
};

export type CreationDateFilter = SearchDateFilterBase<"created">;

export type AfterDateValue =
  | "today-7d"
  | "today-31d"
  | "today-90d"
  | { date: DateTime };

export type BeforeDateValue = "today-90d" | { date: DateTime };

export interface SearchFilters {
  role: RoleFilter;
  type: TypeFilter;
  visibility: VisibilityFilter;
}

export type SearchFilter = RoleFilter | TypeFilter | VisibilityFilter;

type SearchFilterBase<K extends string, V> = {
  key: K;
  /** Note: `values` should be interpreted as a set */
  values: V[];
};

export type RoleFilter = SearchFilterBase<"role", Role>;

export type TypeFilter = SearchFilterBase<"type", SearchEntityType>;

export type SearchEntityType = Lowercase<SearchEntity["type"]>;

export type VisibilityFilter = SearchFilterBase<
  "visibility",
  SearchEntityVisibility
>;

export type SearchEntityVisibility = Lowercase<Visibility>;

export interface SortBy {
  key: "sort";
  value: SortByValue;
}

export type SortByValue =
  | "score-desc"
  | "created-desc"
  | "created-asc"
  | "name-asc"
  | "name-desc";

// Types related to parsing a search query
export interface ParseSearchQueryResult {
  canonicalQuery: string;
  dateFilters: SearchDateFilters;
  filters: SearchFilters;
  searchBarQuery: string;
}

export interface InterpretedTerm {
  term: string;
  interpretation: SearchOption | null;
}
