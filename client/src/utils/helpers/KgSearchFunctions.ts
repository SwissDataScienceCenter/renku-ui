/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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
  EntityType,
  KgSearchResult,
  KgSearchResultLink,
} from "../../features/kgSearch";
import { ListElementProps } from "../../components/list/list.types";
import { Url } from "./url";
import { DateFilterTypes } from "../../components/dateFilter/DateFilter";
import { isEqual } from "lodash";
import { getEntityImageUrl } from "./HelperFunctions";
import {
  DatasetKg,
  KgMetadataResponse,
} from "../../features/project/project.types";
import { Visibilities } from "../../components/visibility/Visibility";
import type { UserRoles } from "../../components/userRolesFilter/userRolesFilter.types";

const getDatasetIdentifier = (links: KgSearchResultLink[]): string => {
  try {
    const details = links.filter((link) => link.rel === "details");
    return details.length > 0
      ? details[0].href.split("/", -1).at(-1) ?? ""
      : "";
  } catch {
    return "";
  }
};

const getDatasetUrl = (links: KgSearchResultLink[]) => {
  const datasetIdentifier = getDatasetIdentifier(links) ?? "";
  return `${Url.pages.datasets.base}/${encodeURIComponent(datasetIdentifier)}`;
};

const getProjectUrl = (path: string) => {
  const projectBase = Url.pages.projects.base.get();
  return `${projectBase}/${path}`;
};

export const mapSearchResultToEntity = (
  entity: KgSearchResult
): ListElementProps => {
  const url =
    entity.type === EntityType.Dataset
      ? getDatasetUrl(entity._links)
      : getProjectUrl(entity.path);

  const creators =
    entity.type === EntityType.Dataset
      ? entity.creators?.map((c: string) => {
          return { name: c };
        })
      : [{ name: entity.creator }];

  const id =
    entity.type === EntityType.Dataset
      ? getDatasetIdentifier(entity._links)
      : entity.path;

  return {
    creators,
    description: entity.description,
    id,
    imageUrl: getEntityImageUrl(entity.images),
    itemType: entity.type,
    labelCaption: "Created",
    path: EntityType.Project ? entity.path : "",
    slug: entity.type === EntityType.Project ? entity.namespace : "",
    tagList: entity.keywords,
    timeCaption: entity.date,
    title: entity.name,
    url,
    visibility: entity.visibility,
  };
};

export const mapMetadataKgResultToEntity = (
  entity: KgMetadataResponse
): ListElementProps => {
  const url = getProjectUrl(entity.path);
  const creators = [{ name: entity.created.creator.name }];
  const id = entity.path;

  return {
    creators,
    description: entity.description,
    id,
    imageUrl: getEntityImageUrl(entity.images),
    itemType: EntityType.Project,
    labelCaption: "Created",
    path: entity.path,
    slug: entity.path,
    tagList: entity.keywords,
    timeCaption: entity.created.dateCreated,
    title: entity.name,
    url,
    visibility: entity.visibility,
  };
};

export const mapDatasetKgResultToEntity = (
  entity: DatasetKg
): ListElementProps => {
  const creators = [{ name: entity.published.creator[0].name }];
  const id = entity.identifier;

  return {
    creators,
    description: entity.description,
    id,
    imageUrl: entity.images ? getEntityImageUrl(entity.images) : undefined,
    itemType: EntityType.Dataset,
    labelCaption: "Created",
    slug: entity.slug ?? "",
    tagList: entity.keywords,
    timeCaption: entity.created,
    title: entity.name,
    url: `datasets/${entity.project?.dataset?.identifier}`,
    visibility: entity.project?.visibility || Visibilities.Public,
  };
};

export interface FiltersProperties {
  type: {
    project: boolean;
    dataset: boolean;
  };
  role: UserRoles;
  visibility: {
    private: boolean;
    public: boolean;
    internal: boolean;
  };
  since: string;
  until: string;
  typeDate: DateFilterTypes;
}

export function hasInitialFilterValues(filters: FiltersProperties) {
  const filterInitialState: FiltersProperties = {
    type: {
      project: true,
      dataset: true,
    },
    role: { owner: false, maintainer: false, reader: false },
    visibility: {
      private: false,
      public: false,
      internal: false,
    },
    since: "",
    until: "",
    typeDate: DateFilterTypes.all,
  };

  return isEqual(filterInitialState, filters);
}
