/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
import { ACCESS_LEVELS } from "../../api-client";

interface ProjectMetadata {
  id: string | number;
  name: string;
  path_with_namespace: string;
  description: string;
  tag_list?: string[];
  star_count: number;
  owner: Record<string, string | number>
  last_activity_at: string;
  access_level: number;
  http_url_to_repo: string;
  namespace: Record<string, string | number | null>;
  path: string;
  avatar_url: string;
  visibility: string;
}

function formatProjectMetadata(project: any): ProjectMetadata {
  let accessLevel = 0;
  // check permissions from v4 API
  if (project?.permissions) {
    if (project?.permissions?.project_access)
      accessLevel = Math.max(accessLevel, project.permissions.project_access.access_level);
    if (project?.permissions?.group_access)
      accessLevel = Math.max(accessLevel, project.permissions.group_access.access_level);
  }
  // check permissions from GraphQL -- // ? REF: https://docs.gitlab.com/ee/user/permissions.html
  else if (project?.userPermissions) {
    if (project.userPermissions.removeProject)
      accessLevel = Math.max(accessLevel, ACCESS_LEVELS.OWNER);
    else if (project.userPermissions.adminProject)
      accessLevel = Math.max(accessLevel, ACCESS_LEVELS.MAINTAINER);
    else if (project.userPermissions.pushCode)
      accessLevel = Math.max(accessLevel, ACCESS_LEVELS.DEVELOPER);
  }

  // Project id can be a number e.g. 1234 or a string with the format: gid://gitlab/Project/1234
  const projectFullId = typeof (project.id) === "number" ? [] : project.id.split("/");
  const projectId = projectFullId.length > 1 ? projectFullId[projectFullId.length - 1] : project.id;

  return {
    id: projectId,
    name: project.name,
    path_with_namespace: project.path_with_namespace ?? project?.fullPath,
    description: project.description,
    tag_list: project.tag_list,
    star_count: project.star_count,
    owner: project.owner,
    last_activity_at: project.last_activity_at,
    access_level: accessLevel,
    http_url_to_repo: project.http_url_to_repo ? project.http_url_to_repo : project.httpUrlToRepo,
    namespace: project.namespace,
    path: project.path,
    avatar_url: project.avatar_url,
    visibility: project.visibility
  };
}

export { formatProjectMetadata };
export type { ProjectMetadata };

