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
import { useLocation } from "react-router";

import EntityIcon from "~/components/entityIcon/EntityIcon";
import type { Project } from "../../projectsV2/api/projectV2.api";
import ProjectAutostartRedirectBanner from "./ProjectAutostartRedirectBanner";
import { ProjectCopiedFrom } from "./ProjectCopiedFrom";
import ProjectCopyBanner from "./ProjectCopyBanner";
import ProjectPageHeaderDescription from "./ProjectPageHeaderDescription";
import ProjectPageHeaderInfo from "./ProjectPageHeaderInfo";
import ProjectPageHeaderKeywords, {
  useProjectPageHeaderKeywords,
} from "./ProjectPageHeaderKeywords";
import ProjectPageHeaderMenu from "./ProjectPageHeaderMenu";
import ProjectTemplateInfoBanner from "./ProjectTemplateInfoBanner";

interface ProjectPageHeaderProps {
  project: Project;
}

export default function ProjectPageHeader({ project }: ProjectPageHeaderProps) {
  // ? We still use `autostartRedirect` for legacy projects registered for redirect
  const { search } = useLocation();
  const isAutostartRedirect =
    new URLSearchParams(search).get("autostartRedirect") === "true";
  const {
    hasKeywords,
    keywordsInline,
    keywordsSorted,
    measureRef,
    metadataRef,
    rowRef,
  } = useProjectPageHeaderKeywords(project.keywords);

  return (
    <div className={cx("d-flex", "flex-column", "gap-2", "position-relative")}>
      <header
        className={cx(
          "d-flex",
          "flex-column",
          "flex-md-row",
          "flex-nowrap",
          "gap-3",
        )}
      >
        <EntityIcon type="project" />
        <div
          className={cx(
            "d-flex",
            "flex-column",
            "flex-grow-1",
            "justify-content-evenly",
            "min-w-0",
          )}
        >
          <div
            className={cx(
              "align-items-center",
              "d-flex",
              "flex-row",
              "justify-content-between",
              "min-w-0",
            )}
          >
            <h1
              className={cx("mb-0", "min-w-0", "text-break")}
              data-cy="project-name"
            >
              {project.name}
            </h1>
            <ProjectPageHeaderMenu project={project} />
          </div>
          <div
            ref={rowRef}
            data-cy="project-info"
            className={cx(
              "align-items-center",
              "d-flex",
              "flex-md-nowrap",
              "flex-row",
              "flex-wrap",
              "min-w-0",
            )}
          >
            {metadataRef && (
              <ProjectPageHeaderInfo
                metadataRef={metadataRef}
                project={project}
              />
            )}
            {keywordsInline && (
              <ProjectPageHeaderKeywords
                keywordsSorted={keywordsSorted}
                leadingSeparator
              />
            )}
          </div>
        </div>
      </header>
      {keywordsInline === false && (
        <ProjectPageHeaderKeywords keywordsSorted={keywordsSorted} wrapBadges />
      )}
      {project.description && (
        <ProjectPageHeaderDescription
          key={project.description}
          description={project.description}
        />
      )}
      {project.is_template && (
        <>
          <ProjectTemplateInfoBanner project={project} />
          <ProjectCopyBanner project={project} />
        </>
      )}
      {isAutostartRedirect && (
        <ProjectAutostartRedirectBanner project={project} />
      )}
      <ProjectCopiedFrom project={project} />
      {hasKeywords && (
        <ProjectPageHeaderKeywords
          keywordsSorted={keywordsSorted}
          leadingSeparator
          measureRef={measureRef}
        />
      )}
    </div>
  );
}
