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

import { Helmet } from "react-helmet";

import {
  useProjectJsonLdQuery,
  useProjectMetadataQuery,
} from "../projectKg.api";
import { useGetProjectIndexingStatusQuery } from "../projectKg.api";

type ProjectJsonLdProps = {
  projectId: number;
  projectPathWithNamespace: string;
  projectTitle: string;
};

function ProjectPageTitle({
  projectId,
  projectPathWithNamespace,
  projectTitle,
}: ProjectJsonLdProps) {
  const projectIndexingStatus = useGetProjectIndexingStatusQuery(projectId, {
    skip: !projectPathWithNamespace || !projectId,
  });

  const kgProjectQueryParams = {
    projectPath: projectPathWithNamespace,
  };
  const options = { skip: !projectIndexingStatus.data?.activated };
  const { data, isFetching, isLoading } = useProjectJsonLdQuery(
    kgProjectQueryParams,
    options
  );
  const { data: kgData } = useProjectMetadataQuery(
    { ...kgProjectQueryParams, projectId },
    options
  );

  const projectDesc = kgData?.description;
  const pageTitle = projectDesc
    ? `${projectTitle} • Project • ${projectPathWithNamespace} • ${projectDesc}`
    : `${projectTitle} • Project • ${projectPathWithNamespace}`;
  const jsonLd =
    !isFetching && !isLoading && data ? (
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    ) : null;
  return (
    <Helmet key="page-title">
      <title>{pageTitle}</title>
      {jsonLd}
    </Helmet>
  );
}

export default ProjectPageTitle;
