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

import { Project } from "../api/projectV2.api";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import VisibilityIcon from "../../../components/entities/VisibilityIcon";
import { TimeCaption } from "../../../components/TimeCaption";

interface ProjectSimpleProps {
  className?: string | string[];
  element: "card" | "card-body" | "card-full-height" | "list-item" | "plain";
  project: Project;
}

export default function ProjectSimple({
  className,
  element,
  project,
}: ProjectSimpleProps) {
  const content = (
    <Link
      className={cx(
        "text-decoration-none",
        "text-reset",
        element === "card-full-height" &&
          cx("d-flex", "flex-column", "flex-grow-1")
      )}
      data-cy="project-link"
      to={generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
        namespace: project.namespace,
        slug: project.slug,
      })}
    >
      <h5 className="m-0">{project.name}</h5>
      <p className={cx("fst-italic", "mb-2")}>
        {project.namespace}/{project.slug}
      </p>

      {project.description && <p className="mb-2">{project.description}</p>}

      <div
        className={cx("d-flex", element === "card-full-height" && "mt-auto")}
      >
        <VisibilityIcon
          className="text-primary"
          visibility={project.visibility}
        />
        <TimeCaption
          className={cx("ms-auto", "my-auto")}
          datetime={project.creation_date}
          prefix="Created"
        />
      </div>
    </Link>
  );

  return element === "card" ? (
    <div className={cx("card", className)}>
      <div className="card-body">{content}</div>
    </div>
  ) : element === "card-full-height" ? (
    <div className={cx("card", "h-100", className)}>
      <div className={cx("card-body", "d-flex")}>{content}</div>
    </div>
  ) : element === "card-body" ? (
    <div className={cx("card-body", className)}>{content}</div>
  ) : element === "list-item" ? (
    <li className={cx("list-group-item", className)}>{content}</li>
  ) : (
    <div className={cx(className)}>{content}</div>
  );
}
