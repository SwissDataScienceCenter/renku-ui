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
import { useMemo } from "react";
import { Bookmarks, Globe2, Lock } from "react-bootstrap-icons";
import { generatePath, useLocation } from "react-router";
import EntityBreadcrumb from "~/components/entityBreadcrumb/EntityBreadcrumb";
import EntityIcon from "~/components/entityIcon/EntityIcon";

import EntityIcon from "~/components/entityIcon/EntityIcon.tsx";
import KeywordBadge from "~/components/keywords/KeywordBadge.tsx";
import KeywordContainer from "~/components/keywords/KeywordContainer.tsx";
import { TimeCaption } from "~/components/TimeCaption.tsx";
import { useGetProjectsByProjectIdMembersQuery } from "~/features/projectsV2/api/projectV2.enhanced-api.ts";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants.ts";
import { Project } from "../../projectsV2/api/projectV2.api";
import { ProjectInformationMembers } from "../ProjectPageContent/ProjectInformation/ProjectInformation";
import ProjectAutostartRedirectBanner from "./ProjectAutostartRedirectBanner";
import ProjectCopyBanner from "./ProjectCopyBanner";
import ProjectTemplateInfoBanner from "./ProjectTemplateInfoBanner";

import styles from "../../../components/Separator.module.scss";

interface ProjectPageHeaderProps {
  project: Project;
}
export default function ProjectPageHeader({ project }: ProjectPageHeaderProps) {
  // ? We still use `autostartRedirect` for legacy projects registered for redirect
  const { search } = useLocation();
  const isAutostartRedirect =
    new URLSearchParams(search).get("autostartRedirect") === "true";

  // Members
  const { data: members } = useGetProjectsByProjectIdMembersQuery({
    projectId: project.id,
  });
  const settingsUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.settings, {
    namespace: project.namespace ?? "",
    slug: project.slug ?? "",
  });
  const membersUrl = `${settingsUrl}#members`;

  // keywords
  const hasKeywords = project.keywords?.length ?? 0 > 0;
  const keywordsSorted = useMemo(() => {
    if (!project.keywords) return [];
    return project.keywords
      .map((keyword) => keyword.trim())
      .sort((a, b) => a.localeCompare(b));
  }, [project.keywords]);

  return (
    <div className={cx("d-flex", "flex-column", "gap-2")}>
      <EntityBreadcrumb project={project} />
      <header
        className={cx(
          "d-flex",
          "flex-column",
          "flex-md-row",
          "flex-nowrap",
          "gap-2",
        )}
      >
        <EntityIcon type="project" />
        <div className={cx("d-flex", "flex-column", "justify-content-evenly")}>
          <h1 className={cx("mb-0", "text-break")} data-cy="project-name">
            {project.name}
          </h1>
          <div
            className={cx(
              "d-flex",
              "flex-row",
              "align-items-center",
              styles.dotSeparated,
            )}
          >
            <div className={cx("d-flex", "gap-2", "flex-row")}>
              <ProjectInformationMembers
                members={members}
                membersUrl={membersUrl}
              />
            </div>
            {project.visibility === "private" ? (
              <div>
                <Lock className={cx("bi", "me-1")} />
                Private
              </div>
            ) : (
              <div>
                <Globe2 className={cx("bi", "me-1")} />
                Public
              </div>
            )}
            <TimeCaption
              datetime={project.creation_date}
              prefix="Created"
              className={cx("fs-6")}
            />
            {hasKeywords && (
              <div
                className={cx(
                  "d-flex",
                  "gap-1",
                  "flex-row",
                  "align-items-center",
                )}
              >
                <Bookmarks className="bi" />
                {keywordsSorted.length > 0 && (
                  <KeywordContainer className="mt-1">
                    {keywordsSorted.map((keyword, index) => (
                      <KeywordBadge
                        key={`keyword-${index}`}
                        searchKeyword={keyword}
                      >
                        {keyword}
                      </KeywordBadge>
                    ))}
                  </KeywordContainer>
                )}
              </div>
            )}
          </div>
        </div>
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
      {isAutostartRedirect && (
        <ProjectAutostartRedirectBanner project={project} />
      )}
    </div>
  );
}
