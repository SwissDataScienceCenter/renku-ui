/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

export interface AddSessionEnvironmentParams {
  container_image: string;
  name: string;
  default_url?: string;
  description?: string;
}

export interface UpdateSessionEnvironmentParams {
  environmentId: string;
  container_image?: string;
  default_url?: string;
  description?: string;
  name?: string;
}

export interface DeleteSessionEnvironmentParams {
  environmentId: string;
}
