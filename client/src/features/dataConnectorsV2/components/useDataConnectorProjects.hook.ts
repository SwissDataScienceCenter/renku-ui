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

import type { DataConnectorRead } from "../api/data-connectors.api";
import { useGetDataConnectorsByDataConnectorIdProjectLinksQuery } from "../api/data-connectors.enhanced-api";
import { useGetProjectsByProjectIdsQuery } from "../../projectsV2/api/projectV2.enhanced-api";

import type { SessionStartCloudStorageConfiguration } from "../../sessionsV2/startSessionOptionsV2.types";

export interface DataConnectorConfiguration
  extends Omit<SessionStartCloudStorageConfiguration, "cloudStorage"> {
  dataConnector: DataConnectorRead;
}

interface UseDataSourceConfigurationArgs {
  dataConnector: DataConnectorRead | undefined;
}

export default function useDataConnectorProjects({
  dataConnector,
}: UseDataSourceConfigurationArgs) {
  const { data: projectLinks, isLoading: isLoadingLinks } =
    useGetDataConnectorsByDataConnectorIdProjectLinksQuery(
      dataConnector
        ? {
            dataConnectorId: dataConnector.id,
          }
        : skipToken
    );
  const { data: projectsMap, isLoading: isLoadingProjects } =
    useGetProjectsByProjectIdsQuery({
      projectIds: projectLinks?.map((pl) => pl.project_id) ?? [],
    });
  const projects = useMemo(() => {
    return (
      projectLinks
        ?.map((pl) => projectsMap?.[pl.project_id])
        .filter((p) => p != null) ?? []
    );
  }, [projectLinks, projectsMap]);

  const projectMapLength = Object.keys(projectsMap ?? {}).length;

  return {
    projects,
    isLoading:
      isLoadingLinks ||
      isLoadingProjects ||
      projectMapLength < (projectLinks?.length ?? 0),
  };
}
