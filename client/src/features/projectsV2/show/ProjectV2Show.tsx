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
import { Link, Navigate, useParams } from "react-router-dom-v5-compat";
import { Label } from "reactstrap";

import { Loader } from "../../../components/Loader";
import { Url } from "../../../utils/helpers/url";

import type { Project } from "../api/projectV2.api";
import {
  isErrorResponse,
  useGetProjectsByProjectIdQuery,
} from "../api/projectV2.enhanced-api";

function ProjectV2Description({ description }: Pick<Project, "description">) {
  const desc =
    description == null
      ? "(no description)"
      : description.length < 1
      ? "(no description)"
      : description;
  return <div className="fs-5">{desc}</div>;
}

function ProjectV2Repositories({
  repositories,
}: Pick<Project, "repositories">) {
  if (repositories == null || repositories.length < 1)
    return <div className="mb-3">(no repositories)</div>;
  return (
    <div>
      {repositories?.map((repo, i) => (
        <div key={i}>{repo}</div>
      ))}
    </div>
  );
}

interface ProjectV2DisplayProps {
  project: Pick<Project, "description" | "repositories">;
}
export function ProjectV2DescriptionAndRepositories({
  project,
}: ProjectV2DisplayProps) {
  return (
    <>
      <div className="mb-3">
        <Label>Description</Label>
        <ProjectV2Description description={project.description} />
      </div>
      <div className="mb-3">
        <Label>Repositories</Label>
        <ProjectV2Repositories repositories={project.repositories} />
      </div>
    </>
  );
}

export function ProjectV2ShowByProjectId() {
  const { id: projectId } = useParams<{
    id: string | undefined;
    namespace: string | undefined;
    slug: string | undefined;
  }>();
  const { data, isLoading, error } = useGetProjectsByProjectIdQuery({
    projectId: projectId ?? "",
  });
  if (isLoading) return <Loader />;
  if (error) {
    if (isErrorResponse(error)) {
      return (
        <div>
          Project does not exist, or you are not authorized to access it.{" "}
          <Link to={Url.get(Url.pages.projectV2.list)}>Return to list</Link>
        </div>
      );
    }
    return <div>Could not retrieve project</div>;
  }
  if (data == null) return <div>Could not retrieve project</div>;
  return (
    <Navigate
      to={Url.get(Url.pages.projectV2.show, {
        namespace: data.namespace,
        slug: data.slug,
      })}
      replace
    />
  );
}
