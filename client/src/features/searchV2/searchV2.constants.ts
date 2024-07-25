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

import type { Role } from "../projectsV2/api/projectV2.api";
import type {
  AfterDateValue,
  BeforeDateValue,
  CreationDateFilter,
  RoleFilter,
  SearchEntityType,
  SearchEntityVisibility,
  SearchFilter,
  SearchFilters,
  SortBy,
  SortByValue,
  TypeFilter,
  VisibilityFilter,
} from "./searchV2.types";

export const TERM_SEPARATOR = " ";
export const KEY_VALUE_SEPARATOR = ":";
export const KEY_LESS_THAN_VALUE = "<";
export const KEY_GREATER_THAN_VALUE = ">";
export const VALUES_SEPARATOR = ",";

// Role filter constants

export const ROLE_FILTER_KEY: RoleFilter["key"] = "role";

export const DEFAULT_ROLE_FILTER: RoleFilter = {
  key: "role",
  values: [],
};

export const ROLE_FILTER_ALLOWED_VALUES: Role[] = ["owner", "editor", "viewer"];

// Type filter constants

export const TYPE_FILTER_KEY: TypeFilter["key"] = "type";

export const DEFAULT_TYPE_FILTER: TypeFilter = {
  key: "type",
  values: [],
};

export const TYPE_FILTER_ALLOWED_VALUES: SearchEntityType[] = [
  "group",
  "project",
  "user",
];

// Visibility filter constants

export const VISIBILITY_FILTER_KEY: VisibilityFilter["key"] = "visibility";

export const DEFAULT_VISIBILITY_FILTER: VisibilityFilter = {
  key: "visibility",
  values: [],
};

export const VISIBILITY_FILTER_ALLOWED_VALUES: SearchEntityVisibility[] = [
  "private",
  "public",
];

// Creation date filter constants

export const CREATION_DATE_FILTER_KEY: CreationDateFilter["key"] = "created";

export const DATE_AFTER_LEEWAY = "-1d";
export const DATE_BEFORE_LEEWAY = "+1d";

export const DEFAULT_CREATION_DATE_FILTER: CreationDateFilter = {
  key: "created",
};

export const DATE_FILTER_AFTER_KNOWN_VALUES: AfterDateValue[] = [
  "today-7d",
  "today-31d",
  "today-90d",
];

export const DATE_FILTER_BEFORE_KNOWN_VALUES: BeforeDateValue[] = ["today-90d"];

// Labels for all filters

export const FILTER_KEY_LABELS: {
  [key in keyof SearchFilters]: { label: string };
} = {
  role: { label: "Role" },
  type: { label: "Type" },
  visibility: { label: "Visibility" },
};

export const FILTER_VALUE_LABELS: {
  [key in SearchFilter["values"][number]]: { label: string };
} = {
  owner: { label: "Owner" },
  editor: { label: "Editor" },
  viewer: { label: "Viewer" },

  group: { label: "Group" },
  project: { label: "Project" },
  user: { label: "User" },

  private: { label: "Private" },
  public: { label: "Public" },
};

// Sort by constants

export const SORT_BY_KEY: SortBy["key"] = "sort";

export const DEFAULT_SORT_BY: SortBy = {
  key: "sort",
  value: "score-desc",
};

export const SORT_BY_ALLOWED_VALUES: SortByValue[] = [
  "score-desc",
  "created-desc",
  "created-asc",
  "name-asc",
  "name-desc",
];

export const SORT_BY_LABELS: { [key in SortByValue]: { label: string } } = {
  "score-desc": { label: "Score: best match" },
  "created-desc": { label: "Newest" },
  "created-asc": { label: "Oldest" },
  "name-asc": { label: "Name: alphabetical" },
  "name-desc": { label: "Name: reverse" },
};
