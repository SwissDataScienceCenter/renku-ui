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

import { UserV2 } from "../userV2/userV2.types";
import { DateFilterTypes } from "../../components/dateFilter/DateFilter.tsx";

export type EntityType = "Project" | "User";

export interface SearchApiParams {
  searchString: string;
  page: number;
  perPage: number;
}

export interface SearchApiResponse {
  items: SearchResult[];
  pagingInfo: {
    page: {
      limit: number;
      offset: number;
    };
    totalResult: number;
    totalPages: number;
    prevPage: number;
    nextPage: number;
  };
}

export type SearchResult = ProjectSearchResult | UserSearchResult;
export interface ProjectSearchResult {
  createdBy: UserV2;
  creationDate: Date;
  description: string;
  id: string;
  members: UserV2[];
  name: string;
  repositories: string[];
  slug: string;
  type: "Project";
  visibility: string;
}

export interface UserSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  type: "User";
  email: string;
}

export interface DateFilter {
  option: DateFilterTypes;
  from?: string;
  to?: string;
}
export interface SearchV2State {
  filters: {
    role: ("owner" | "member")[];
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
