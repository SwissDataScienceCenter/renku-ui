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

export interface NewProject {
  config: NewProjectConfig;
  input: NewProjectInput;
  meta: NewProjectMeta;
  templates: NewProjectTemplates;
}

export interface NewProjectConfig {
  custom: boolean;
  repositories: Repository[];
}

export interface Repository {
  name: string;
  ref: string;
  url: string;
}

export interface NewProjectInput {
  userRepo: boolean;
  template: string;
  templatePristine: boolean;
}

export interface NewProjectMeta {
  userTemplates: NewProjectMetaUserTemplates;
  validation: NewProjectMetaValidation;
}

export interface NewProjectMetaUserTemplates {
  fetched: Date | null;
  fetching: boolean | null;
  error: any; //eslint-disable-line @typescript-eslint/no-explicit-any
  url: string;
  ref: string;
  all: NewProjectTemplate[];
}

export interface NewProjectMetaValidation {
  errors: { [key: string]: string | undefined };
  validation: { [key: string]: string | undefined };
}

export interface NewProjectTemplates {
  fetched: Date | null;
  fetching: boolean | null;
  errors: any[]; //eslint-disable-line @typescript-eslint/no-explicit-any
  all: NewProjectTemplate[];
}

export interface NewProjectTemplate {
  id: string;
  description: string;
  icon?: string;
  name: string;
  variables?: { [key: string]: unknown };
  parentRepo?: string;
  parentTemplate?: string;
}

export type RenkuUser = {
  data: {
    name: string;
    email: string;
    organization: string;
  };
};
