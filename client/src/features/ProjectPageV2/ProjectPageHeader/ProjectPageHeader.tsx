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

import cx from "classnames";

import ProjectGitLabWarnBanner from "../../legacy/ProjectGitLabWarnBanner";
import { Project } from "../../projectsV2/api/projectV2.api";
import ProjectCopyBanner from "./ProjectCopyBanner";
import ProjectTemplateInfoBanner from "./ProjectTemplateInfoBanner";

interface ProjectPageHeaderProps {
  project: Project;
}
export default function ProjectPageHeader({ project }: ProjectPageHeaderProps) {
  return (
    <div className={cx("d-flex", "flex-column", "gap-2")}>
      <header>
        <h1 className={cx("mb-0", "text-break")} data-cy="project-name">
          {project.name}
        </h1>
      </header>
      {project.description && (
        <p className="mb-0" data-cy="project-description">
          {project.description}
        </p>
      )}
      {project.is_template && (
        <>
          <ProjectTemplateInfoBanner project={project} />
          <ProjectCopyBanner project={project} />
        </>
      )}

      <ProjectGitLabWarnBanner project={project} />
    </div>
  );
}
