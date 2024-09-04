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

import { useEffect } from "react";
import {
  generatePath,
  useNavigate,
  useParams,
} from "react-router-dom-v5-compat";

import { Loader } from "../../../components/Loader";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { useGetProjectsByProjectIdQuery } from "../api/projectsV2.api";
import ProjectNotFound from "../notFound/ProjectNotFound";

export default function ProjectV2ShowByProjectId() {
  const { id: projectId } = useParams<{
    id: string | undefined;
  }>();

  const navigate = useNavigate();

  const {
    data: project,
    isLoading,
    error,
  } = useGetProjectsByProjectIdQuery({
    projectId: projectId ?? "",
  });

  useEffect(() => {
    if (project && project.namespace && project.slug) {
      navigate(
        generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
          namespace: project.namespace,
          slug: project.slug,
        }),
        { replace: true }
      );
    }
  }, [navigate, project]);

  if (isLoading) return <Loader className="align-self-center" />;

  return <ProjectNotFound error={error} />;
}
