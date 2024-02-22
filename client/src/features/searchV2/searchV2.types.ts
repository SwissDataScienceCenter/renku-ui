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

// TODO: move this into a better place -- for V2 users or common resources
export interface UserV2 {
  id: string;
}

export interface SearchResult {
  createdBy: UserV2;
  creationDate: Date;
  description: string;
  id: string;
  members: UserV2[];
  name: string;
  repositories: string[];
  slug: string;
  visibility: string;
}

export interface SearchV2State {
  filters: {
    role: ("creator" | "member" | "none")[];
    type: ("project" | "user")[];
    visibility: ("private" | "public")[];
  };
  search: {
    history: string[];
    lastSearch: string | null;
    query: string;
  };
  sorting: SortingItem;
}

export interface ToggleFilterPayload {
  filter: keyof SearchV2State["filters"];
  value: SearchV2State["filters"][keyof SearchV2State["filters"]][number];
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
