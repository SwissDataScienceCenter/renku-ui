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

import EntityHeader from "../../../components/entityHeader/EntityHeader";
import type { EntityHeaderProps } from "../../../components/entityHeader/EntityHeader";
import { useGetProjectIndexingStatusQuery } from "../projectKgApi";
import { ProjectStatusIcon } from "./migrations/ProjectStatusIcon";
import { useProjectMetadataQuery } from "../../project/projectKgApi";
import { ImagesLinks } from "../Project";
import { getEntityImageUrl } from "../../../utils/helpers/HelperFunctions";

type ProjectEntityHeaderProps = EntityHeaderProps & {
  branch: string;
  projectId: number;
};

export function ProjectEntityHeader(props: ProjectEntityHeaderProps) {
  const { branch, devAccess, fullPath, gitUrl, projectId, visibility } = props;

  const projectIndexingStatus = useGetProjectIndexingStatusQuery(projectId, {
    skip: !fullPath || !projectId,
  });

  const projectMetadataQuery = useProjectMetadataQuery(
    { projectPath: fullPath, projectId },
    { skip: !fullPath || !projectId || !projectIndexingStatus.data?.activated }
  );

  // overwrite description when available from KG
  const descriptionKg: EntityHeaderProps["description"] = {
    isLoading:
      projectMetadataQuery.isLoading || projectIndexingStatus.isLoading,
    value: projectMetadataQuery.data?.description ?? "",
    unavailable: !projectIndexingStatus.data?.activated
      ? "requires indexing to be activated"
      : undefined,
  };

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

  const entityImage = getEntityImageUrl(
    projectMetadataQuery?.data?.images as unknown as ImagesLinks[]
  );

  return (
    <EntityHeader
      {...props}
      description={descriptionKg}
      statusButton={statusButton}
      visibility={projectMetadataQuery.data?.visibility || visibility}
      tagList={projectMetadataQuery.data?.keywords ?? []}
      imageUrl={entityImage}
    />
  );
}
