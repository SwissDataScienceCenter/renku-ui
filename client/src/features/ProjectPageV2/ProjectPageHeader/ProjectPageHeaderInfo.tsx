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

import cx from "classnames";
import { type RefObject } from "react";
import { Clock, Globe2, Lock } from "react-bootstrap-icons";
import { generatePath } from "react-router";

import { TimeCaption } from "~/components/TimeCaption";
import { useGetProjectsByProjectIdMembersQuery } from "~/features/projectsV2/api/projectV2.enhanced-api";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import type { Project } from "../../projectsV2/api/projectV2.api";
import { ProjectPageHeaderMembers } from "./ProjectPageHeaderMembers";

import styles from "../../../components/Separator.module.scss";

function ProjectVisibility({ isPrivate }: { isPrivate: boolean }) {
  return (
    <div className={cx("col-12", "col-md-auto", "flex-shrink-0", "small")}>
      {isPrivate ? (
        <Lock className={cx("bi", "me-1")} />
      ) : (
        <Globe2 className={cx("bi", "me-1")} />
      )}
      {isPrivate ? "Private" : "Public"}
    </div>
  );
}

interface ProjectPageHeaderInfoProps {
  metadataRef: RefObject<HTMLDivElement>;
  project: Project;
}

export default function ProjectPageHeaderInfo({
  metadataRef,
  project,
}: ProjectPageHeaderInfoProps) {
  const { data: members } = useGetProjectsByProjectIdMembersQuery({
    projectId: project.id,
  });
  const settingsUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.settings, {
    namespace: project.namespace ?? "",
    slug: project.slug ?? "",
  });
  const membersUrl = `${settingsUrl}#members`;

  return (
    <div
      ref={metadataRef}
      className={cx(
        "align-items-center",
        "col-12",
        "col-md-auto",
        "d-flex",
        "flex-md-nowrap",
        "flex-row",
        "flex-shrink-0",
        "flex-wrap",
        "gap-2",
        "gap-md-0",
        "min-w-0",
        "mt-2",
        "mt-md-0",
        "mw-100",
        styles.dotSeparated,
      )}
    >
      <div
        className={cx(
          "align-items-center",
          "col-12",
          "col-md-auto",
          "d-flex",
          "flex-row",
          "flex-shrink-1",
          "gap-2",
          "min-w-0",
          "small",
        )}
      >
        <ProjectPageHeaderMembers members={members} membersUrl={membersUrl} />
      </div>
      <ProjectVisibility isPrivate={project.visibility === "private"} />
      <div className={cx("col-12", "col-md-auto", "flex-shrink-0", "small")}>
        <Clock className={cx("bi", "me-1")} />
        Created
        <TimeCaption
          datetime={project.creation_date}
          prefix=""
          className={cx(
            "col-12",
            "col-md-auto",
            "flex-shrink-0",
            "small",
            "fw-bold",
            "ms-1",
          )}
        />
      </div>
    </div>
  );
}
