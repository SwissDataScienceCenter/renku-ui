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
import ClampedParagraph from "../../../components/clamped/ClampedParagraph";

interface ProjectSimpleProps {
  className?: string | string[];
  element: "card-body" | "list-item" | "plain";
  project: Project;
}

export default function ProjectSimple({
  className,
  element,
  project,
}: ProjectSimpleProps) {
  const content = (
    <div
      className={cx(
        element === "card-body" && cx("d-flex", "flex-column", "flex-grow-1")
      )}
      data-cy="project-item"
    >
      <h6 className="m-0 fw-bold">{project.name}</h6>
      <p className={cx("fst-italic", "mb-2")}>
        @{project.namespace}/{project.slug}
      </p>

      {project.description && (
        <ClampedParagraph className="mb-2">
          {project.description}
        </ClampedParagraph>
      )}

      <div className={cx("d-flex", element === "card-body" && "mt-auto")}>
        <VisibilityIcon visibility={project.visibility} />
        <TimeCaption
          className={cx("ms-auto", "my-auto")}
          datetime={project.creation_date}
          enableTooltip
          prefix="Created"
        />
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
