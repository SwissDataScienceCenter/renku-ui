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
 * limitations under the License
 */

import { skipToken } from "@reduxjs/toolkit/query";
import { useMemo } from "react";

import type { Project } from "~/features/projectsV2/api/projectV2.api";
import { useGetProjectsByProjectIdsQuery } from "~/features/projectsV2/api/projectV2.enhanced-api";
import type { SessionStartDataConnectorConfiguration } from "~/features/sessionsV2/startSessionOptionsV2.types";
import type {
  ApiPagination,
  PaginatedResponse,
} from "~/utils/types/pagination.types";
import type { DataConnectorRead } from "../api/data-connectors.api";
import { useGetDataConnectorsByDataConnectorIdProjectLinksQuery } from "../api/data-connectors.enhanced-api";

export interface DataConnectorConfiguration
  extends Omit<SessionStartDataConnectorConfiguration, "cloudStorage"> {
  dataConnector: DataConnectorRead;
}

interface UseDataSourceConfigurationArgs {
  dataConnector: DataConnectorRead | undefined;
  page: number;
  perPage: number;
}

export default function useDataConnectorProjects({
  dataConnector,
  page,
  perPage,
}: UseDataSourceConfigurationArgs) {
  const { currentData: projectLinksPaginated, isFetching: isFetchingLinks } =
    useGetDataConnectorsByDataConnectorIdProjectLinksQuery(
      dataConnector
        ? {
            dataConnectorId: dataConnector.id,
            params: { page, per_page: perPage },
          }
        : skipToken
    );

  const { currentData: projectsMap, isFetching: isFetchingProjects } =
    useGetProjectsByProjectIdsQuery({
      projectIds: projectLinksPaginated?.data.map((pl) => pl.project_id) ?? [],
    });
  const projectsPaginated = useMemo(() => {
    if (projectLinksPaginated == null || projectsMap == null) {
      return undefined;
    }
    return {
      data: projectLinksPaginated.data
        .map(({ project_id }) => projectsMap[project_id])
        .filter((p) => p != null),
      pagination: projectLinksPaginated.pagination,
    } satisfies ProjectsPaginated;
  }, [projectLinksPaginated, projectsMap]);

  if (isFetchingLinks || isFetchingProjects || projectsPaginated == null) {
    return {
      projectsPaginated,
      isFetching: true as const,
    };
  }

  return {
    projectsPaginated,
    isFetching: false as const,
  };
}

type ProjectsPaginated = PaginatedResponse<Project, ApiPagination>;
