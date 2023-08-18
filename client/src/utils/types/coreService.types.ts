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

export interface CoreVersionUrl {
  versionUrl?: string;
}

export interface CoreRepositoryParams {
  gitUrl: string; // this usually maps to git_url
  branch?: string;
}

export interface CoreErrorContent {
  code: number;
  devMessage: string;
  devReference?: string;
  sentry?: string;
  userMessage: string;
  userReference?: string;
}

export interface CoreErrorResponse {
  error: CoreErrorContent;
}

export interface CoreResponse {
  error?: CoreErrorContent;
  // ? we should avoid `any`, but this is meant to be re-defined when extending the interface
  result?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
