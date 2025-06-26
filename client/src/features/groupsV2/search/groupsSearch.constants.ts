/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import {
  EnumFilter,
  Filter,
  NumberFilter,
  StringFilter,
} from "./groupSearch.types";

export const VALUE_SEPARATOR_AND = "+";

export const FILTER_PAGE: NumberFilter = {
  name: "page",
  label: "Page",
  type: "number",
  defaultValue: 1,
  minValues: 1,
};

export const FILTER_PER_PAGE: NumberFilter = {
  name: "perPage",
  label: "Per page",
  type: "number",
  defaultValue: 10,
  minValues: 1,
  maxValues: 100,
};

export const FILTER_QUERY: StringFilter = {
  name: "q",
  label: "Query",
  type: "string",
  defaultValue: "",
};

export const FILTER_CONTENT: EnumFilter = {
  name: "type",
  label: "Content",
  type: "enum",
  allowedValues: [
    { value: "Project", label: "Project" },
    { value: "DataConnector", label: "Data Connector" },
  ],
  allowSelectMany: false,
  defaultValue: "Project",
};

export const FILTER_MEMBER: StringFilter = {
  name: "member",
  label: "Group member",
  type: "string",
};

export const FILTER_KEYWORD: EnumFilter = {
  name: "keyword",
  label: "Keyword",
  type: "enum",
  allowedValues: [],
  allowSelectMany: true,
  doNotPassEmpty: true,
};

export const FILTER_VISIBILITY: EnumFilter = {
  name: "visibility",
  label: "Visibility",
  type: "enum",
  allowedValues: [
    { value: "", label: "Any" },
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ],
  allowSelectMany: false,
  doNotPassEmpty: true,
};

export const COMMON_FILTERS: Filter[] = [
  FILTER_CONTENT,
  FILTER_PAGE,
  FILTER_PER_PAGE,
  FILTER_QUERY,
];

export const PROJECT_FILTERS: Filter[] = [
  FILTER_MEMBER,
  FILTER_KEYWORD,
  FILTER_VISIBILITY,
];

export const DATACONNECTORS_FILTERS: Filter[] = [
  FILTER_KEYWORD,
  FILTER_VISIBILITY,
];

export const SELECTABLE_FILTERS: Filter[] = [
  FILTER_CONTENT,
  FILTER_MEMBER,
  FILTER_KEYWORD,
  FILTER_VISIBILITY,
];
