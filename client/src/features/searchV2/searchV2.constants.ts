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
  SearchDateFilter,
  SearchEntityType,
  SearchEntityVisibility,
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
  "dataconnector", //eslint-disable-line spellcheck/spell-checker
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

export const DEFAULT_DATE_FILTER_VALUE: SearchDateFilter["value"] = {};

export const DATE_AFTER_LEEWAY = "-1d";
export const DATE_BEFORE_LEEWAY = "+1d";

export const CREATION_DATE_FILTER_KEY: CreationDateFilter["key"] = "created";

export const DEFAULT_CREATION_DATE_FILTER: CreationDateFilter = {
  key: "created",
  value: DEFAULT_DATE_FILTER_VALUE,
};

export const DATE_FILTER_AFTER_KNOWN_VALUES: AfterDateValue[] = [
  "today-7d",
  "today-31d",
  "today-90d",
];

export const DATE_FILTER_BEFORE_KNOWN_VALUES: BeforeDateValue[] = ["today-90d"];

// Pagination constants

export const FIRST_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Content type default

export const DEFAULT_CONTENT_TYPE = "Project";
