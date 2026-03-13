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

import { ReactNode } from "react";

import type { SearchEntity } from "~/features/searchV2/api/searchV2Api.api";

export type GroupSearchEntity = Exclude<
  SearchEntity,
  { type: "Group" | "User" }
>;

interface FilterValue {
  label: ReactNode;
  quantity?: number;
  value: string;
  id?: string;
}

type FilterType = "enum" | "number" | "string";

interface BaseFilter {
  buildQueryTerms?: (key: string, value: string | number) => string[];
  doNotPassEmpty?: boolean;
  label: ReactNode;
  mustQuote?: boolean;
  name: string;
  type: FilterType;
  validFor?: SearchEntity["type"][];
}

interface StringFilter extends BaseFilter {
  defaultValue?: string;
  type: "string";
}

export interface EnumFilter extends BaseFilter {
  allowedValues: FilterValue[];
  allowSelectMany?: boolean;
  defaultValue?: string;
  type: "enum";
  valueSeparator?: string;
}

interface NumberFilter extends BaseFilter {
  defaultValue?: number;
  maxValue?: number;
  minValue?: number;
  type: "number";
}

type Filter_ = StringFilter | EnumFilter | NumberFilter;

export type Filter<T extends Filter_["type"] = Filter_["type"]> = Extract<
  Filter_ & { type: T },
  Filter_
>;
