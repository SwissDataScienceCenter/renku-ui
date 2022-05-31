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

import { getUserIdFromToken } from "../authentication";
import { Storage, StorageGetOptions, TypeData } from "../storage";

/**
 * Get data from the Storage by user token
 *
 * @param {string} prefix - the data prefix (StoragePrefix)
 * @param {string} token - jwt token using bearer schema
 * @param {Storage} storage - storage api
 * @param {number} length - number of records, if the value <= 0 it will return all the user's records
 */
export async function getUserData(prefix: string, token: string, storage: Storage, length = 0): Promise<string[]> {
  const userId = getUserIdFromToken(token);
  let data: string[] = [];
  const stop = length - 1; // -1 would bring all records
  const options: StorageGetOptions = {
    type: TypeData.Collections,
    start: 0,
    stop,
  };

  if (userId)
    data = await storage.get(`${prefix}${userId}`, options) as string[];

  return data;
}
