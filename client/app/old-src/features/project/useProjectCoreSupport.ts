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

import { useContext, useMemo } from "react";
import AppContext from "../../utils/context/appContext";
import { apiVersionForMetadataVersion } from "../../utils/helpers/url";
import type { CoreApiVersionedUrlConfig } from "../../utils/helpers/url";
import { useGetCoreVersionsQuery } from "../versions/versions.api";
import { useGetMigrationStatusQuery } from "./projectCoreApi";

export type CoreSupport =
  | {
      apiVersion: undefined;
      backendAvailable: undefined;
      backendErrorMessage: undefined;
      computed: false;
      metadataVersion: undefined;
      versionUrl: undefined;
    }
  | {
      apiVersion: undefined;
      backendAvailable: false;
      backendErrorMessage: string;
      computed: true;
      metadataVersion: undefined;
      versionUrl: undefined;
    }
  | {
      apiVersion: undefined;
      backendAvailable: false;
      backendErrorMessage: undefined;
      computed: true;
      metadataVersion: undefined;
      versionUrl: undefined;
    }
  | {
      apiVersion: string | undefined;
      backendAvailable: true;
      backendErrorMessage: undefined;
      computed: true;
      metadataVersion: number;
      versionUrl: string;
    };

export const useCoreSupport = ({
  apiVersionOverride,
  gitUrl,
  branch,
}: {
  apiVersionOverride?: string;
  gitUrl: string | undefined;
  branch?: string | undefined;
}) => {
  const { coreApiVersionedUrlConfig } = useContext(AppContext);
  const migrationStatusApiVersion = apiVersionForMetadataVersion(
    coreApiVersionedUrlConfig,
    undefined,
    undefined // do not use the override for getting migration status
  );
  const getMigrationStatusQuery = useGetMigrationStatusQuery(
    {
      apiVersion: migrationStatusApiVersion,
      gitUrl: gitUrl ?? "",
      branch: branch ?? "",
    },
    { skip: !gitUrl || !branch }
  );
  const getCoreVersionsQuery = useGetCoreVersionsQuery();

  const { data: migrationStatus } = getMigrationStatusQuery;
  const { data: coreVersions } = getCoreVersionsQuery;

  const coreSupport = useMemo(() => {
    const availableVersions = coreVersions?.metadataVersions;
    const projectVersion =
      migrationStatus?.details?.core_compatibility_status.type === "detail"
        ? parseInt(
            migrationStatus.details.core_compatibility_status
              .project_metadata_version
          )
        : undefined;
    const backendErrorMessage =
      migrationStatus?.details?.core_compatibility_status.type === "detail"
        ? undefined
        : migrationStatus?.error?.userMessage;
    return computeBackendData({
      apiVersionOverride,
      availableVersions,
      backendErrorMessage,
      coreApiVersionedUrlConfig,
      projectVersion,
    });
  }, [
    apiVersionOverride,
    coreApiVersionedUrlConfig,
    coreVersions,
    migrationStatus,
  ]);

  return {
    coreSupport,
    getMigrationStatusQuery,
    getCoreVersionsQuery,
  };
};

export const computeBackendData = ({
  apiVersionOverride,
  availableVersions,
  backendErrorMessage,
  coreApiVersionedUrlConfig,
  projectVersion,
}: {
  apiVersionOverride: string | undefined;
  availableVersions: number[] | undefined;
  backendErrorMessage: string | undefined;
  coreApiVersionedUrlConfig: CoreApiVersionedUrlConfig;
  projectVersion: number | undefined;
}): CoreSupport => {
  if (backendErrorMessage) {
    return {
      apiVersion: undefined,
      backendAvailable: false,
      backendErrorMessage,
      computed: true,
      metadataVersion: undefined,
      versionUrl: undefined,
    };
  }
  if (!availableVersions || typeof projectVersion !== "number")
    return {
      apiVersion: undefined,
      backendAvailable: undefined,
      backendErrorMessage: undefined,
      computed: false,
      metadataVersion: undefined,
      versionUrl: undefined,
    };
  if (availableVersions.includes(projectVersion))
    return {
      apiVersion: apiVersionForMetadataVersion(
        coreApiVersionedUrlConfig,
        projectVersion,
        apiVersionOverride
      ),
      backendAvailable: true,
      backendErrorMessage: undefined,
      computed: true,
      metadataVersion: projectVersion,
      versionUrl: `/${projectVersion}`,
    };
  return {
    apiVersion: undefined,
    backendAvailable: false,
    backendErrorMessage: undefined,
    computed: true,
    metadataVersion: undefined,
    versionUrl: undefined,
  };
};
