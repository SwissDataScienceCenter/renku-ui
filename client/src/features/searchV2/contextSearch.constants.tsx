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

import cx from "classnames";
import {
  Binoculars,
  Briefcase,
  Calendar,
  Database,
  Folder2Open,
  Globe,
  Lock,
  People,
  Person,
  PersonFillGear,
  Tag,
} from "react-bootstrap-icons";

import {
  EnumFilter,
  Filter,
  NumberFilter,
  StringFilter,
} from "./contextSearch.types";
import { DATE_AFTER_LEEWAY, DATE_BEFORE_LEEWAY } from "./searchV2.constants";

export const VALUE_SEPARATOR_AND = "+";
export const VALUE_SEPARATOR_OR = ",";

export const DEFAULT_ELEMENTS_LIMIT_IN_FILTERS = 5;

export const FILTER_PAGE: NumberFilter &
  Required<Pick<NumberFilter, "defaultValue" | "minValue">> = {
  name: "page",
  label: "Page",
  type: "number",
  defaultValue: 1,
  minValue: 1,
};

export const FILTER_PER_PAGE: NumberFilter &
  Required<Pick<NumberFilter, "defaultValue" | "minValue" | "maxValue">> = {
  name: "perPage",
  label: "Per page",
  type: "number",
  defaultValue: 10,
  minValue: 1,
  maxValue: 100,
};

export const FILTER_QUERY: StringFilter = {
  name: "q",
  label: "Query",
  type: "string",
  defaultValue: "",
};

export const NAMESPACE_FILTER: StringFilter = {
  name: "namespace",
  label: "Namespace",
  type: "string",
  defaultValue: "",
};

export const DEFAULT_INCLUDE_COUNTS = true;

export const FILTER_CONTENT: EnumFilter = {
  name: "type",
  label: (
    <>
      <Briefcase className={cx("bi", "me-1")} />
      Content
    </>
  ),
  type: "enum",
  allowedValues: [
    {
      value: "Project",
      label: (
        <>
          <Folder2Open className={cx("bi", "me-1")} />
          Project
        </>
      ),
    },
    {
      value: "DataConnector",
      label: (
        <>
          <Database className={cx("bi", "me-1")} />
          Data
        </>
      ),
    },
    {
      value: "User",
      label: (
        <>
          <Person className={cx("bi", "me-1")} />
          User
        </>
      ),
    },
    {
      value: "Group",
      label: (
        <>
          <People className={cx("bi", "me-1")} />
          Group
        </>
      ),
    },
  ],
  allowSelectMany: false,
  defaultValue: "Project",
};

export const FILTER_CONTENT_NAMESPACE: EnumFilter = {
  name: "type",
  label: (
    <>
      <Briefcase className={cx("bi", "me-1")} />
      Content
    </>
  ),
  type: "enum",
  allowedValues: [
    {
      value: "Project",
      label: (
        <>
          <Folder2Open className={cx("bi", "me-1")} />
          Project
        </>
      ),
    },
    {
      value: "DataConnector",
      label: (
        <>
          <Database className={cx("bi", "me-1")} />
          Data
        </>
      ),
    },
  ],
  allowSelectMany: false,
  defaultValue: "Project",
};
export const FILTER_MEMBER: EnumFilter = {
  name: "direct_member",
  label: (
    <>
      <People className={cx("bi", "me-1")} />
      Group member
    </>
  ),
  type: "enum",
  allowedValues: [],
  allowSelectMany: false,
  doNotPassEmpty: true,
  mustQuote: false,
  validFor: ["Project"],
};

export const FILTER_KEYWORD: EnumFilter = {
  name: "keyword",
  label: (
    <>
      <Tag className={cx("bi", "me-1")} />
      Keyword
    </>
  ),
  type: "enum",
  allowedValues: [],
  allowSelectMany: true,
  doNotPassEmpty: true,
  mustQuote: true,
  validFor: ["Project", "DataConnector"],
};

export const FILTER_VISIBILITY: EnumFilter = {
  name: "visibility",
  label: (
    <>
      <Binoculars className={cx("bi", "me-1")} />
      Visibility
    </>
  ),
  type: "enum",
  allowedValues: [
    { value: "", label: "Any visibility" },
    {
      value: "public",
      label: (
        <>
          <Globe className={cx("bi", "me-1")} />
          Public
        </>
      ),
    },
    {
      value: "private",
      label: (
        <>
          <Lock className={cx("bi", "me-1")} />
          Private
        </>
      ),
    },
  ],
  allowSelectMany: false,
  doNotPassEmpty: true,
  validFor: ["Project", "DataConnector"],
};

export const FILTER_MY_ROLE: EnumFilter = {
  name: "role",
  label: (
    <>
      <PersonFillGear className={cx("bi", "me-1")} />
      My Role
    </>
  ),
  type: "enum",
  allowedValues: [
    {
      value: "owner",
      label: <>Owner</>,
    },
    {
      value: "editor",
      label: <>Editor</>,
    },
    {
      value: "viewer",
      label: <>Viewer</>,
    },
  ],
  allowSelectMany: true,
  doNotPassEmpty: false,
  validFor: ["Project", "Group"],
  valueSeparator: VALUE_SEPARATOR_OR,
};

export const DATE_FILTER_CUSTOM_SEPARATOR = ",";

function isKnownDateToken(value: string): boolean {
  return value.startsWith("today-");
}

export const FILTER_DATE: EnumFilter = {
  name: "created",
  label: (
    <>
      <Calendar className={cx("bi", "me-1")} />
      Creation date
    </>
  ),
  type: "enum",
  allowedValues: [
    {
      value: "",
      label: <>All</>,
    },
    {
      value: ">today-7d",
      label: <>Last week</>,
    },
    {
      value: ">today-31d",
      label: <>Last month</>,
    },
    {
      value: ">today-90d",
      label: <>Last 90 days</>,
    },
    {
      value: "<today-90d",
      label: <>Older than 90 days</>,
    },
  ],
  allowSelectMany: false,
  doNotPassEmpty: true,
  validFor: ["Project", "DataConnector"],
  buildQueryTerms: (key: string, value: string | number): string[] => {
    if (typeof value !== "string" || !value) return [];
    const parts = value.split(DATE_FILTER_CUSTOM_SEPARATOR).filter(Boolean);
    return parts.map((part) => {
      const operator = part.charAt(0); // '>' or '<'
      const dateValue = part.slice(1);
      if (isKnownDateToken(dateValue)) {
        return `${key}${part}`;
      }
      // Custom date — add leeway for inclusive range
      const leeway = operator === ">" ? DATE_AFTER_LEEWAY : DATE_BEFORE_LEEWAY;
      return `${key}${operator}${dateValue}${leeway}`;
    });
  },
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
  FILTER_MY_ROLE,
  FILTER_DATE,
];

export const DATACONNECTORS_FILTERS: Filter[] = [
  FILTER_KEYWORD,
  FILTER_VISIBILITY,
  FILTER_DATE,
];

export const SELECTABLE_FILTERS: Filter[] = [
  FILTER_CONTENT,
  FILTER_MEMBER,
  FILTER_KEYWORD,
  FILTER_VISIBILITY,
  FILTER_MY_ROLE,
  FILTER_DATE,
];

export const ALL_FILTERS: Filter[] = [
  FILTER_PAGE,
  FILTER_PER_PAGE,
  FILTER_QUERY,
  FILTER_CONTENT,
  FILTER_MEMBER,
  FILTER_KEYWORD,
  FILTER_VISIBILITY,
  FILTER_MY_ROLE,
  FILTER_DATE,
];

export const SEARCH_DEBOUNCE_SECONDS = 1;
