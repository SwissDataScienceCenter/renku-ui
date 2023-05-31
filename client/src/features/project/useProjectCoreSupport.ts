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

import { useMemo } from "react";
import { useGetCoreVersionsQuery } from "../versions/versionsApi";
import { useGetMigrationStatusQuery } from "./projectCoreApi";

export type CoreSupport =
  | {
      backendAvailable: undefined;
      computed: false;
      versionUrl: undefined;
    }
  | {
      backendAvailable: false;
      computed: true;
      versionUrl: undefined;
    }
  | {
      backendAvailable: true;
      computed: true;
      versionUrl: string;
    };

export const useCoreSupport = ({
  gitUrl,
  branch,
}: {
  gitUrl: string | undefined;
  branch?: string | undefined;
}) => {
  const getMigrationStatusQuery = useGetMigrationStatusQuery(
    { gitUrl: gitUrl ?? "", branch },
    { skip: !gitUrl || !branch }
  );
  const getCoreVersionsQuery = useGetCoreVersionsQuery();

  const { data: migrationStatus } = getMigrationStatusQuery;
  const { data: coreVersions } = getCoreVersionsQuery;

  const coreSupport = useMemo(() => {
    const availableVersions = coreVersions?.metadataVersions;
    // const projectVersion =
    //   migrationStatus?.details?.core_compatibility_status.type === "detail"
    //     ? parseInt(
    //         migrationStatus.details.core_compatibility_status
    //           .project_metadata_version
    //       )
    //     : undefined;
    // Temp version due to renku-core
    const projectVersion =
      migrationStatus?.details?.core_compatibility_status.type !== "error" &&
      typeof migrationStatus?.details?.core_compatibility_status
        .project_metadata_version === "string"
        ? parseInt(
            migrationStatus.details?.core_compatibility_status
              .project_metadata_version
          )
        : undefined;
    return computeBackendData({
      availableVersions,
      projectVersion,
    });
  }, [coreVersions, migrationStatus]);

  return {
    coreSupport,
    getMigrationStatusQuery,
    getCoreVersionsQuery,
  };
};

const computeBackendData = ({
  availableVersions,
  projectVersion,
}: {
  availableVersions: number[] | undefined;
  projectVersion: number | undefined;
}): CoreSupport => {
  if (!availableVersions || typeof projectVersion !== "number")
    return {
      backendAvailable: undefined,
      computed: false,
      versionUrl: undefined,
    };
  if (availableVersions.includes(projectVersion))
    return {
      backendAvailable: true,
      computed: true,
      versionUrl: `/${projectVersion}`,
    };
  return {
    backendAvailable: false,
    computed: true,
    versionUrl: undefined,
  };
};
