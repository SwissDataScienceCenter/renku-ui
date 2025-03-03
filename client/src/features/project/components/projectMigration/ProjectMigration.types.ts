/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
  LegacySlug,
  ProjectName,
  Slug,
  Visibility,
} from "../../../projectsV2/api/projectV2.api.ts";

export interface ProjectMigrationForm {
  name: ProjectName;
  namespace: Slug;
  slug: LegacySlug;
  visibility: Visibility;
}

export interface ProjectMetadata {
  accessLevel: number;
  defaultBranch: string;
  externalUrl: string;
  httpUrl: string;
  id: string;
  namespace: string;
  path: string;
  pathWithNamespace: string;
  visibility: string;
  description: string;
  title: string;
  tagList: string[];
}
