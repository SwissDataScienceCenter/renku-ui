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

import { EntityType, KgSearchResult, KgSearchResultLink } from "../../features/kgSearch";
import { ListElementProps } from "../components/list/List.d";
import { Url } from "./url";

const getDatasetIdentifier = (links: KgSearchResultLink[]) => {
  const details = links.filter(link => link.rel === "details");
  return details.length > 0 ? details[0].href.split("/", -1).at(-1) : "";
};

const getDatasetUrl = (links: KgSearchResultLink[]) => {
  const datasetIdentifier = getDatasetIdentifier(links) ?? "";
  return `${Url.pages.datasets.base}/${encodeURIComponent(datasetIdentifier)}`;
};

const getProjectUrl = (path: string) => {
  const projectBase = Url.pages.projects.base.get();
  return `${projectBase}/${path}`;
};

export const mapSearchResultToEntity =
  (entity: KgSearchResult, history: any): ListElementProps => {
    const url = entity.type === EntityType.Dataset ?
      getDatasetUrl(entity._links) :
      getProjectUrl(entity.path);
    const handler = () => {
      const handlerUrl = entity.type === EntityType.Dataset ?
        `${url}/add` : `${url}/sessions/new?autostart=1`;
      history.push(handlerUrl);
    };

    return {
      url,
      title: entity.name,
      description: entity.description,
      tagList: entity.keywords,
      timeCaption: entity.date,
      labelCaption: "Creation",
      creators: entity.creator,
      itemType: entity.type,
      slug: entity.type === EntityType.Project ? entity.namespace : "",
      visibility: entity.visibility,
      handler
    };
  };
