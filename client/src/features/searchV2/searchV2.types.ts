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

import type { DateFilterTypes } from "../../components/dateFilter/DateFilter.tsx";
import type { Role } from "../projectsV2/api/projectV2.api";
import type { SearchEntity } from "./api/searchV2Api.api.ts";

export interface SearchV2StateV2 {
  initialQuery: string | null;
  query: string | null;
  page: number;
  perPage: number;
  searchBarQuery: string | null;
  sort: SortingOption;
  filters: FilterOptions;
}

export interface SortingOption {
  key: string;
  label: string;
}

export interface FilterOptions {
  type: Set<SearchEntityType>;
}

export interface TypeFilterOption {
  key: SearchEntityType;
  label: string;
}

export type SearchEntityType = Lowercase<SearchEntity["type"]>;

export interface DateFilter {
  option: DateFilterTypes;
  from?: string;
  to?: string;
}
export interface SearchV2State {
  filters: {
    role: Role[];
    type: ("project" | "user")[];
    visibility: ("private" | "public")[];
    created: DateFilter;
    createdBy: string;
  };
  search: {
    history: {
      search: string;
      query: string;
    }[];
    lastSearch: string | null;
    outdated: boolean;
    page: number;
    perPage: number;
    query: string;
    totalPages: number;
    totalResults: number;
  };
  sorting: SortingItem;
}

export interface SearchV2Totals {
  pages: number;
  results: number;
}

export interface ToggleFilterPayload {
  filter: keyof SearchV2State["filters"];
  value: string;
}

export interface SearchV2FilterOptions {
  checked: boolean;
  key: string;
  value: string;
}

export interface SortingItem {
  friendlyName: string;
  sortingString: string;
}

export interface SortingItems {
  [key: string]: SortingItem;
}

export interface DateFilterItem {
  friendlyName: string;
  getDateString:
    | ((filter: string, from?: string, to?: string) => string)
    | (() => string);
}
export interface DateFilterItems {
  [key: string]: DateFilterItem;
}

export type SetInitialQueryParams =
  | {
      query: string;
      searchBarQuery: string;
      sort: SortingOption;
      filters: SearchV2StateV2["filters"];
    }
  | {
      query: null;
    };
