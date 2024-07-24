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

import type { SearchEntity } from "./api/searchV2Api.api.ts";

export interface SearchV2StateV2 {
  filters: SearchFilters;
  initialQuery: string;
  page: number;
  perPage: number;
  query: string;
  searchBarQuery: string;
  sortBy: SortBy;
}

export type SearchOption = SearchFilter | SortBy;

export interface SearchFilters {
  type: TypeFilter;
}

export type SearchFilter = TypeFilter;

export interface TypeFilter {
  key: "type";
  /** Note: `values` should be interpreted as a set */
  values: SearchEntityType[];
}

export type SearchEntityType = Lowercase<SearchEntity["type"]>;

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
  filters: SearchFilters;
  searchBarQuery: string;
  sortBy: SortBy;
}

export interface InterpretedTerm {
  term: string;
  interpretation: SearchOption | null;
}

// interface TypeFilterInterpretation {
//   key: "type";
//   values: FilterOptions["type"];
// }

// export interface SortingOption {
//   key: string;
//   label: string;
// }

// export interface FilterOptions {
//   type: Set<SearchEntityType>;
// }

// export interface TypeFilterOption {
//   key: SearchEntityType;
//   label: string;
// }

// export type SearchEntityType = Lowercase<SearchEntity["type"]>;

// export interface DateFilter {
//   option: DateFilterTypes;
//   from?: string;
//   to?: string;
// }
// export interface SearchV2State {
//   filters: {
//     role: Role[];
//     type: ("project" | "user")[];
//     visibility: ("private" | "public")[];
//     created: DateFilter;
//     createdBy: string;
//   };
//   search: {
//     history: {
//       search: string;
//       query: string;
//     }[];
//     lastSearch: string | null;
//     outdated: boolean;
//     page: number;
//     perPage: number;
//     query: string;
//     totalPages: number;
//     totalResults: number;
//   };
//   sorting: SortingItem;
// }

// export interface SearchV2Totals {
//   pages: number;
//   results: number;
// }

// export interface ToggleFilterPayload {
//   filter: keyof SearchV2State["filters"];
//   value: string;
// }

// export interface SearchV2FilterOptions {
//   checked: boolean;
//   key: string;
//   value: string;
// }

// export interface SortingItem {
//   friendlyName: string;
//   sortingString: string;
// }

// export interface SortingItems {
//   [key: string]: SortingItem;
// }

// export interface DateFilterItem {
//   friendlyName: string;
//   getDateString:
//     | ((filter: string, from?: string, to?: string) => string)
//     | (() => string);
// }
// export interface DateFilterItems {
//   [key: string]: DateFilterItem;
// }

export interface SetInitialQueryParams {
  filters: SearchFilters;
  query: string;
  searchBarQuery: string;
  sortBy: SortBy;
}
