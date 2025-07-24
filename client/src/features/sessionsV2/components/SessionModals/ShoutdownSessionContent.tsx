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

import { skipToken } from "@reduxjs/toolkit/query/react";
import { useMemo } from "react";
import { useGetProjectsByProjectIdDataConnectorLinksQuery } from "~/features/dataConnectorsV2/api/data-connectors.api";
import { useGetDataConnectorsListByDataConnectorIdsQuery } from "~/features/dataConnectorsV2/api/data-connectors.enhanced-api";
import { getRepositoryName } from "~/features/ProjectPageV2/ProjectPageContent/CodeRepositories/repositories.utils";
import { useGetProjectsByProjectIdQuery } from "~/features/projectsV2/api/projectV2.enhanced-api";

interface ShutdownSessionContentProps {
  sessionProjectId?: string;
}
export default function ShutdownSessionContent({
  sessionProjectId,
}: ShutdownSessionContentProps) {
  // fetch data connectors and code repositories metadata
  const projectMetadata = useGetProjectsByProjectIdQuery(
    sessionProjectId
      ? {
          projectId: sessionProjectId,
        }
      : skipToken
  );

  const dataConnectorLinksMetadata =
    useGetProjectsByProjectIdDataConnectorLinksQuery(
      sessionProjectId
        ? {
            projectId: sessionProjectId,
          }
        : skipToken
    );
  const dataConnectorIds = useMemo(
    () =>
      dataConnectorLinksMetadata.data?.map((link) => link.data_connector_id),
    [dataConnectorLinksMetadata.data]
  );

  const dataConnectorMetadata = useGetDataConnectorsListByDataConnectorIdsQuery(
    dataConnectorIds ? { dataConnectorIds } : skipToken
  );
  const dataConnectorsObjects = useMemo(
    () => Object.values(dataConnectorMetadata.data ?? {}),
    [dataConnectorMetadata.data]
  );

  // store code repositories and data connectors names
  const codeRepositories = useMemo(() => {
    return projectMetadata.data?.repositories
      ? projectMetadata.data?.repositories?.map((repoUrl) =>
          getRepositoryName(repoUrl)
        )
      : [];
  }, [projectMetadata.data]);
  const dataConnectors = useMemo(() => {
    return dataConnectorsObjects
      .filter((dc) => dc.id && !dc.storage.readonly)
      .map((dc) => dc.storage.target_path);
  }, [dataConnectorsObjects]);

  if (!sessionProjectId) {
    return (
      <>
        <p className="mb-1">Are you sure you want to shut down this session?</p>
        <span className="fw-bold">
          All files will be permanently deleted unless you save them to an
          external system first.
        </span>{" "}
        You can download files to your local machine, if available in your
        session interface.
      </>
    );
  }
  return (
    <>
      {/* // ! TODO: Add the image */}
      <p>Are you sure you want to permanently shut down this session?</p>
      <p>
        <span className="fw-bold">
          All files will be permanently deleted unless you save them to an
          external system first.
        </span>{" "}
        To preserve your work
        {dataConnectors.length <= 0 && codeRepositories.length <= 0
          ? ", consider adding writable data connectors or code repositories to your project."
          : ":"}
      </p>
      {dataConnectors.length > 0 || codeRepositories.length > 0 ? (
        <ul>
          {codeRepositories.length > 0 && (
            <li>
              Save code changes to your connected repositories:{" "}
              <span className="fst-italic">{codeRepositories.join(", ")}</span>
            </li>
          )}
          {dataConnectors.length > 0 && (
            <li>
              Save files to your connected writeable data connectors:{" "}
              <span className="fst-italic">{dataConnectors.join(", ")}</span>
            </li>
          )}
          <li>
            Download files to your local machine, if available in your session
            interface.
          </li>
        </ul>
      ) : (
        <p>
          You can still download files to your local machine, if available in
          your session interface.
        </p>
      )}

      {/* // ! TODO Add collapsible section for:
        - *How do I know I won't lose any files?*
          - **Commit and push code changes:** Run `git commit` and `git push` in all repositories with unsaved changes
          - **Move data files to external storage:** Copy files to <list DCs>
          - **Check your workspace is clear:** Ensure no important files remain in `/home/jovyan/work/`.
      */}
    </>
  );
}
