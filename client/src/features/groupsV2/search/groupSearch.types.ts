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

import { SearchEntity } from "~/features/searchV2/api/searchV2Api.generated-api";

interface FilterValue {
  value: string;
  label: string;
}

type FilterType = "string" | "enum" | "number";

interface BaseFilter {
  name: string;
  label: string;
  type: FilterType;
}

export interface StringFilter extends BaseFilter {
  type: "string";
  defaultValue?: string;
}

export interface EnumFilter extends BaseFilter {
  type: "enum";
  allowedValues: FilterValue[];
  defaultValue?: string;
  doNotPassEmpty?: boolean;
}

export interface NumberFilter extends BaseFilter {
  type: "number";
  maxValues?: number;
  minValues?: number;
  defaultValue?: number;
}

export type Filter = StringFilter | EnumFilter | NumberFilter;
export type GroupSearchEntity = Exclude<
  SearchEntity,
  { type: "Group" | "User" }
>;
