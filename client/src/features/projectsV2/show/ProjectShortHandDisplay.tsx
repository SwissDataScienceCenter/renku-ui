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
 * limitations under the License
 */

import cx from "classnames";
import { generatePath, Link } from "react-router";

import { TimeCaption } from "../../../components/TimeCaption";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import UserAvatar from "../../usersV2/show/UserAvatar";
import { Project } from "../api/projectV2.api";
import VisibilityIconV2 from "./VisibilityIconV2";

type ProjectDisplayRows =
  | "creation_or_update_time"
  | "description"
  | "namespace"
  | "visibility";

interface ProjectShortHandDisplayProps {
  className?: string | string[];
  displayRows?: ProjectDisplayRows[];
  project: Project;
}

export default function ProjectShortHandDisplay({
  className,
  displayRows = [
    "creation_or_update_time",
    "description",
    "namespace",
    "visibility",
  ],
  project,
}: ProjectShortHandDisplayProps) {
  const content = (
    <div
      className={cx("d-flex", "flex-column", "flex-grow-1", "gap-1")}
      data-cy="project-item"
    >
      <p className={cx("m-0", "fw-bold", "text-truncate")}>{project.name}</p>

      {displayRows.includes("namespace") && (
        <div
          className={cx(
            "align-items-center",
            "d-flex",
            "gap-2",
            "text-truncate"
          )}
        >
          <UserAvatar namespace={project.namespace} size="sm" />
          <p className={cx("mb-0", "text-truncate")}>{project.namespace}</p>
        </div>
      )}

      {project.description && displayRows.includes("description") && (
        <p className={cx("mb-0", "text-truncate")}>{project.description}</p>
      )}

      {displayRows.includes("creation_or_update_time") && (
        <div className={cx("d-flex", "flex-column", "flex-md-row")}>
          <VisibilityIconV2 visibility={project.visibility} />
          <TimeCaption
            className={cx("ms-md-auto", "my-auto", "text-truncate")}
            datetime={project.updated_at ?? project.creation_date}
            enableTooltip
            prefix={project.updated_at ? "Updated" : "Created"}
          />
        </div>
      )}
    </div>
  );

  return (
    <Link
      className={cx(
        "link-primary",
        "list-group-item-action",
        "list-group-item",
        "text-body",
        className
      )}
      to={generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
        namespace: project.namespace,
        slug: project.slug,
      })}
    >
      {content}
    </Link>
  );
}
