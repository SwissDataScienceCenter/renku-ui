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

import { cleanGitUrl } from "./ProjectFunctions";
interface DatasetImages {
  content_url: string;
}
export interface IDataset {
  identifier?: string;
  images?: DatasetImages[];
  mediaContent?: string | null;
}
/**
 * Add the URL for the marquee image to the dataset if is an image git url. Modifies the dataset object.
 * @param {string} gitUrl
 * @param {Dataset} dataset
 */
export function addMarqueeImageToDataset(gitUrl: string, dataset: IDataset) {
  const urlRoot = cleanGitUrl(gitUrl) + "/-/raw/master";
  let mediaUrl = dataset?.images?.[0]?.content_url ?? null;
  if (mediaUrl !== null && mediaUrl.startsWith(".renku/dataset_images/"))
    mediaUrl = `${urlRoot}/${mediaUrl}`;

  dataset.mediaContent = mediaUrl;
  return dataset;
}

/**
 * Remove dashes from the dataset identifier
 * @param {Dataset} dataset
 */
export function cleanDatasetId(dataset: IDataset) {
  if (dataset.identifier)
    dataset.identifier = dataset.identifier.replace(/-/g, "");
  return dataset;
}
