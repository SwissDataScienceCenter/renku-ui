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

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { GetTemplatesParams, RepositoriesParams } from "./templates.types";
import { TemplateVariable } from "../project/editNew/NewProject.types";

type GetTemplatesResponse = {
  data?: {
    result?: { templates: TemplateResponse[] };
    error?: { userMessage?: string; reason: string };
  };
};
interface TemplateResponse {
  description: string;
  folder: string;
  name: string;
  variables?: Record<string, TemplateVariable>;
  icon: string;
  ssh_supported: boolean;
}

export interface Templates {
  parentRepo: string;
  parentTemplate: string;
  id: string;
  name: string;
  description: string;
  variables?: Record<string, TemplateVariable>;
  icon: string;
  isSSHSupported: boolean;
}
export const templatesApi = createApi({
  reducerPath: "templates",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/renku" }),
  endpoints: (builder) => ({
    getTemplatesRepositories: builder.query<Templates[], GetTemplatesParams>({
      async queryFn({ repositories }, _queryApi, _extraOptions, fetchWithBQ) {
        return fetchTemplatesRepositories({ fetchWithBQ, repositories });
      },
    }),
  }),
  refetchOnMountOrArgChange: 3,
});

type PromiseInfo = {
  promise: ReturnType<ReturnType<typeof fetchBaseQuery>>;
  sourceName: string;
};
interface FetchTemplatesRepositoriesArgs {
  fetchWithBQ: (
    arg: string | FetchArgs
  ) => ReturnType<ReturnType<typeof fetchBaseQuery>>;
  repositories: RepositoriesParams[];
}
async function fetchTemplatesRepositories({
  fetchWithBQ,
  repositories,
}: FetchTemplatesRepositoriesArgs) {
  if (repositories.length > 0) {
    const templateRequests: PromiseInfo[] = [];
    for (const repository of repositories) {
      templateRequests.push({
        promise: fetchWithBQ(
          `/templates.read_manifest?url=${encodeURIComponent(
            repository.url
          )}&ref=${encodeURIComponent(repository.ref)}`
        ),
        sourceName: repository.name,
      });
    }

    try {
      const resultAllTemplatesData = await Promise.allSettled(
        templateRequests.map(({ promise }) => promise)
      );
      const templatesList: Templates[] = [];

      resultAllTemplatesData.forEach((templateData, index) => {
        const response =
          templateData.status === "fulfilled" &&
          (templateData?.value as GetTemplatesResponse);
        if (response && !response?.data?.error) {
          const templates = response.data?.result
            ?.templates as TemplateResponse[];
          const sourceName = templateRequests[index].sourceName;
          templates.map((template) => {
            templatesList.push({
              parentRepo: sourceName,
              parentTemplate: template.folder,
              id: `${sourceName}/${template.folder}`,
              name: template.name,
              description: template.description,
              variables: template.variables,
              icon: template.icon,
              isSSHSupported: template.ssh_supported,
            });
          });
        } else if (response && response.data?.error) {
          return {
            error: response.data.error as unknown as FetchBaseQueryError,
          };
        }
      });

      return { data: templatesList };
    } catch (e) {
      return { error: e as FetchBaseQueryError };
    }
  } else {
    return { data: [] };
  }
}

export const { useGetTemplatesRepositoriesQuery } = templatesApi;
