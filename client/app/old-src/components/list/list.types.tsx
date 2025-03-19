/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import type { EntityType } from "../../features/kgSearch/KgSearch.types";
import type { EntityCreator } from "../entities/Creators";
import type { Visibilities } from "../visibility/Visibility";

export interface Creator {
  name: string;
}

export enum ListDisplayType {
  Card,
  Bar,
}

export interface ListElementProps {
  creators: EntityCreator[];
  defaultBranch?: string;
  description: string;
  gitUrl?: string;
  id?: string;
  imageUrl?: string;
  itemType: EntityType;
  labelCaption: string;
  mediaContent?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  path?: string;
  slug: string;
  tagList: string[];
  timeCaption: string;
  title: string;
  type?: ListDisplayType;
  url: string;
  visibility: Visibilities;
  animated?: boolean;
  fromLanding?: boolean;
}

export interface VisibilityIconProps {
  visibility?: Visibilities;
}

export interface EntityIconProps {
  entityType?: EntityType;
}

export interface EntityButtonProps {
  entityType?: EntityType;
  handler?: Function; // eslint-disable-line @typescript-eslint/ban-types
}
