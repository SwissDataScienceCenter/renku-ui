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

import React from "react";

import { useProjectMetadataQuery } from "../../projects/projectsKgApi";
import EntityHeader from "../../../components/entityHeader/EntityHeader";
import type { EntityHeaderProps } from "../../../components/entityHeader/EntityHeader";
import { useGetProjectIndexingStatusQuery } from "../projectKgApi";
import { ProjectStatusIcon } from "./migrations/ProjectStatusIcon";

type ProjectEntityHeaderProps = EntityHeaderProps & {
  branch: string;
  projectId: number;
};

export function ProjectEntityHeader(props: ProjectEntityHeaderProps) {
  const { branch, description, devAccess, fullPath, gitUrl, projectId } = props;

  const projectIndexingStatus = useGetProjectIndexingStatusQuery(projectId, {
    skip: !fullPath || !projectId,
  });

  const { data, isLoading } = useProjectMetadataQuery(
    { projectPath: fullPath },
    { skip: !fullPath || !projectIndexingStatus.data?.activated }
  );

  // overwrite description when available from KG
  const descriptionKg: EntityHeaderProps["description"] = {
    isLoading,
    value: data?.description || "",
  };
  if (!isLoading && !data?.description && description?.value) {
    descriptionKg.isLoading = false;
    descriptionKg.value = description.value;
  }
  const statusButton = (
    <ProjectStatusIcon
      branch={branch}
      gitUrl={gitUrl ?? ""}
      isMaintainer={devAccess}
      projectId={projectId}
      projectNamespace=""
      projectPath={fullPath ?? ""}
    />
  );

  return (
    <EntityHeader
      {...props}
      description={descriptionKg}
      statusButton={statusButton}
    />
  );
}
