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
import VisibilityIcon from "../../../components/entities/VisibilityIcon";
import { TimeCaption } from "../../../components/TimeCaption";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import UserAvatar from "../../usersV2/show/UserAvatar";
import { Project } from "../api/projectV2.api";

interface ProjectShortHandDisplayProps {
  className?: string | string[];
  project: Project;
}

export default function ProjectShortHandDisplay({
  className,
  project,
}: ProjectShortHandDisplayProps) {
  const content = (
    <div
      className={cx("d-flex", "flex-column", "flex-grow-1", "gap-1")}
      data-cy="project-item"
    >
      <div className={cx("d-flex", "flex-column", "flex-md-row")}>
        <p className={cx("m-0", "fw-bold", "text-truncate", "me-2")}>
          {project.name}
        </p>
      </div>

      <div
        className={cx(
          "d-flex",
          "flex-row",
          "text-truncate",
          "gap-2",
          "align-items-center"
        )}
      >
        <UserAvatar namespace={project.namespace} size="sm" />
        <p className={cx("mb-0", "text-truncate")}>{project.namespace}</p>
      </div>

      {project.description && (
        <div className={cx("d-flex", "flex-column", "flex-md-row")}>
          <p className={cx("mb-0", "text-truncate")}>{project.description}</p>
        </div>
      )}

      <div className={cx("d-flex", "flex-column", "flex-md-row")}>
        <VisibilityIcon visibility={project.visibility} />
        {project.updated_at ? (
          <TimeCaption
            className={cx("ms-0", "ms-md-auto", "my-auto", "text-truncate")}
            datetime={project.updated_at}
            enableTooltip
            prefix="Updated"
          />
        ) : (
          <TimeCaption
            className={cx("ms-auto", "my-auto", "text-truncate")}
            datetime={project.creation_date}
            enableTooltip
            prefix="Created"
          />
        )}
      </div>
    </div>
  );

  return (
    <Link
      className={cx(
        "link-primary",
        "text-body",
        "text-decoration-none",
        className,
        "list-group-item",
        "list-group-item-action"
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
