/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import { DateFilterTypes } from "../../components/dateFilter/DateFilter";
import { SortingOptions } from "../../components/sortingEntities/SortingEntities";
import { TypeEntitySelection } from "../../components/typeEntityFilter/TypeEntityFilter";
import { UserRoles } from "../../components/userRolesFilter/userRolesFilter.types";
import { Visibilities } from "../../components/visibility/Visibility";
import { VisibilitiesFilter } from "../../components/visibilityFilter/VisibilityFilter";
import {
  AbstractKgPaginatedResponse,
  AbstractKgPaginatedQueryArgs,
} from "../../utils/types/pagination.types";

export interface KgSearchResultLink {
  rel: string;
  href: string;
}

export type KgUserRole = "owner" | "maintainer" | "reader";

export enum EntityType {
  Project = "project",
  Dataset = "dataset",
}

export interface KgSearchResult {
  _links: KgSearchResultLink[];
  creators: string[];
  creator: string;
  description: string;
  date: string;
  keywords: string[];
  matchingScore: number;
  name: string;
  namespace: string;
  path: string;
  slug: string;
  type: EntityType;
  visibility: Visibilities;
  images: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface ListResponse<T> extends AbstractKgPaginatedResponse {
  results: T[];
}

export interface KgSearchState extends Required<AbstractKgPaginatedQueryArgs> {
  phrase: string;
  role: UserRoles;
  since: string;
  sort: SortingOptions;
  type: TypeEntitySelection;
  typeDate: DateFilterTypes;
  until: string;
  visibility: VisibilitiesFilter;
}
