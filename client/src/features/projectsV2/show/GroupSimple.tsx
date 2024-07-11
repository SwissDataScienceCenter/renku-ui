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

import type { GroupSimple } from "./GroupSimple.types";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import VisibilityIcon from "../../../components/entities/VisibilityIcon";
import { TimeCaption } from "../../../components/TimeCaption";

interface GroupSimpleProps {
  className?: string | string[];
  element: "card" | "card-body" | "list-item" | "plain";
  group: GroupSimple;
}
export default function GroupSimple({
  className,
  element,
  group,
}: GroupSimpleProps) {
  const content = (
    <div>
      <Link
        className={cx("link-primary", "text-body")}
        data-cy="project-link"
        to={generatePath(ABSOLUTE_ROUTES.v2.groups.show, {
          slug: group.slug,
        })}
      >
        <h5 className="m-0">{group.name}</h5>
        <p className={cx("fst-italic", "mb-2")}>{group.slug}</p>
      </Link>

      {group.description && <p className="mb-2">{group.description}</p>}

      <div className="d-flex">
        <VisibilityIcon className="text-primary" visibility="public" />
        <TimeCaption
          className={cx("ms-auto", "my-auto")}
          datetime={group.creation_date}
          prefix="Created"
        />
      </div>
    </div>
  );

  return element === "card" ? (
    <div className={cx("card", className)}>
      <div className="card-body">{content}</div>
    </div>
  ) : element === "card-body" ? (
    <div className={cx("card-body", className)}>{content}</div>
  ) : element === "list-item" ? (
    <li className={cx("list-group-item", className)}>{content}</li>
  ) : (
    <div className={cx(className)}>{content}</div>
  );
}
