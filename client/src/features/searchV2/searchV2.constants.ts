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
 * limitations under the License
 */

import type {
  FilterOptions,
  SearchEntityType,
  SortingOption,
  TypeFilterOption,
} from "./searchV2.types";

export const TERM_SEPARATOR = " ";
export const KEY_VALUE_SEPARATOR = ":";
export const VALUES_SEPARATOR = ",";

export const TYPE_FILTER_KEY = "type";

export const SORT_KEY = "sort";

export const DEFAULT_TYPE_FILTER_OPTION: FilterOptions["type"] = {
  group: false,
  project: false,
  user: false,
};

export const TYPE_FILTER_OPTIONS: TypeFilterOption[] = [
  { key: "project", label: "Project" },
  { key: "group", label: "Group" },
  { key: "user", label: "User" },
];

export const TYPE_FILTER_ALLOWED_VALUES: Set<string> = TYPE_FILTER_OPTIONS.map(
  ({ key }) => key
).reduce((set, key) => set.add(key), new Set<string>());

export const DEFAULT_SORTING_OPTION: SortingOption = {
  key: "score-desc",
  label: "Score: best match",
};

export const SORTING_OPTIONS: SortingOption[] = [
  DEFAULT_SORTING_OPTION,
  { key: "created-desc", label: "Newest" },
  {
    key: "created-asc",
    label: "Oldest",
  },
  {
    key: "name-asc",
    label: "Name: alphabetical",
  },
  {
    key: "name-desc",
    label: "Name: reverse",
  },
];
