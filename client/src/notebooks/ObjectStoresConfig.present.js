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

import { isURL } from "../utils/helpers/HelperFunctions";

/**
 * Check if the endpoint is valid.
 * @param {object} cloudStoreConfig
 */
export function isCloudStorageEndpointValid(cloudStoreConfig) {
  if (cloudStoreConfig["endpoint"].length < 1) return false;
  if (!isURL(cloudStoreConfig["endpoint"])) return false;
  return true;
}

/**
 * Check if the bucket is valid.
 * @param {object} cloudStoreConfig
 */
export function isCloudStorageBucketValid(cloudStoreConfig) {
  const bucketPattern = new RegExp(
    "^([a-z]|\\d)([a-z]|\\d|\\.|-){1,61}([a-z]|\\d)$",
    "gsm"
  );
  const bucket = cloudStoreConfig["bucket"];
  if (bucket.length < 1) return false;
  return bucketPattern.test(bucket);
}
