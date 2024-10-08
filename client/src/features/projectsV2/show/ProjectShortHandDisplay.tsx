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
import { Link, generatePath } from "react-router-dom-v5-compat";
import VisibilityIcon from "../../../components/entities/VisibilityIcon";
import { TimeCaption } from "../../../components/TimeCaption";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { Project } from "../api/projectV2.api";

interface ProjectShortHandDisplayProps {
  className?: string | string[];
  element: "card-body" | "list-item" | "plain";
  project: Project;
}

export default function ProjectShortHandDisplay({
  className,
  element,
  project,
}: ProjectShortHandDisplayProps) {
  const content = (
    <div
      className={cx(
        element === "card-body" && cx("d-flex", "flex-column", "flex-grow-1")
      )}
      data-cy="project-item"
    >
      <div className={cx("d-flex", "justify-content-between")}>
        <p className={cx("m-0", "fw-bold", "text-truncate", "me-2")}>
          {project.name}
        </p>
        <VisibilityIcon visibility={project.visibility} />
      </div>

      <div className={cx("d-flex", element === "card-body" && "mt-auto")}>
        <p className={cx("fst-italic", "mb-2", "text-truncate")}>
          @{project.namespace}/{project.slug}
        </p>
        {project.updated_at ? (
          <TimeCaption
            className={cx("ms-auto", "my-auto", "text-truncate")}
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

  const elementClasses =
    element === "card-body"
      ? cx("card-body", "d-flex")
      : element === "list-item"
      ? cx("list-group-item", "list-group-item-action")
      : "";

  return (
    <Link
      className={cx(
        "link-primary",
        "text-body",
        "text-decoration-none",
        className,
        elementClasses
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
