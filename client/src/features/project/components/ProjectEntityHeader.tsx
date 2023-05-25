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

import * as React from "react";

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
  const { fullPath } = props;

  const projectIndexingStatus = useGetProjectIndexingStatusQuery(
    props.projectId,
    {
      skip: !fullPath || !props.projectId,
    }
  );

  useProjectMetadataQuery(
    { projectPath: fullPath },
    { skip: !fullPath || !projectIndexingStatus.data?.activated }
  );

  const statusButton = (
    <ProjectStatusIcon
      branch={props.branch}
      gitUrl={props.gitUrl ?? ""}
      isMaintainer={props.devAccess}
      projectId={props.projectId}
      projectNamespace=""
      projectPath={props.fullPath ?? ""}
    />
  );

  return <EntityHeader {...props} statusButton={statusButton} />;
}
