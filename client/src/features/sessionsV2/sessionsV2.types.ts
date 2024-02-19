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

export interface SessionEnvironment {
  container_image: string;
  creation_date: string;
  id: string;
  name: string;
  description?: string;
}

export type SessionEnvironmentList = SessionEnvironment[];

export interface SessionV2 {
  creation_date: string;
  description?: string;
  environment_id: string;
  id: string;
  name: string;
  project_id: string;
}

export type SessionV2List = SessionV2[];

export interface AddSessionV2Params {
  description?: string;
  environment_id: string;
  name: string;
  project_id: string;
}

export interface UpdateSessionV2Params {
  description?: string;
  environment_id: string;
  name: string;
  session_id: string;
}

export interface DeleteSessionV2Params {
  sessionId: string;
}
