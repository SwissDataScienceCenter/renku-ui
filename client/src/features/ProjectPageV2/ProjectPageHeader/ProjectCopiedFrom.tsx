/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { generatePath, Link } from "react-router";

import { Loader } from "~/components/Loader";
import {
  useGetNamespacesByNamespaceSlugQuery,
  useGetProjectsByProjectIdQuery,
} from "~/features/projectsV2/api/projectV2.enhanced-api";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import type { Project } from "../../projectsV2/api/projectV2.api";

export function ProjectCopiedFrom({ project }: { project: Project }) {
  const { data: templateProject, isLoading } = useGetProjectsByProjectIdQuery(
    project.template_id ? { projectId: project.template_id } : skipToken,
  );
  const { data: templateNamespace } = useGetNamespacesByNamespaceSlugQuery(
    templateProject ? { namespaceSlug: templateProject.namespace } : skipToken,
  );

  if (!project.template_id) return null;
  if (isLoading) return <Loader inline size={16} />;
  if (!templateProject || !templateNamespace) return null;

  const templateLabel = `${templateNamespace.name ?? templateNamespace.slug} / ${templateProject.name}`;
  const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: templateProject.namespace,
    slug: templateProject.slug,
  });

  return (
    <div className={cx("flex-shrink-0", "text-muted")}>
      Copied from:
      <Link
        className={cx(
          "align-items-center",
          "d-inline-flex",
          "min-w-0",
          "text-truncate",
          "text-decoration-underline",
          "ms-1",
          "text-muted",
        )}
        data-cy="copy-project-template-link"
        to={projectUrl}
      >
        {templateLabel}
      </Link>
    </div>
  );
}
