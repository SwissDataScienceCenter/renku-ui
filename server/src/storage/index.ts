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

export interface StorageSaveOptions {
  type: TypeData,
  limit?: number, // to trim current set of ordered values only apply to the collections
  score?: number, // to order values, only apply to the collections
}

export interface StorageGetOptions {
  type: TypeData,
  start?: number, // performs an index range query, represent zero-based indexes, only apply to the collections
  stop?: number, // performs an index range query, represent zero-based indexes, only apply to the collections
}

export interface SaveCollectionOptions {
  limit?: number, // to trim current set of ordered values
  score?: number, // to order values
}

/* eslint-disable no-unused-vars */
export enum TypeData { String, Collections}
export enum StoragePrefix {
  LAST_PROJECTS = "LPROJECT_",
  LAST_SEARCHES = "LSEARCH_"
}
/* eslint-enable no-unused-vars */

interface Storage {

  ready: boolean;

  getStatus(): string;

  get(path: string, options?: StorageGetOptions): Promise<string | string[]>;

  save(path: string, value: string, options?: StorageSaveOptions): Promise<boolean>;

  delete(path: string): Promise<number>;

  shutdown(): void;
}

export { Storage };
