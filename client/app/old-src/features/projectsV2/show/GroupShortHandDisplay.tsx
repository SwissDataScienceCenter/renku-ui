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
import { Link, generatePath } from "react-router";

import { TimeCaption } from "../../../components/TimeCaption";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import UserAvatar from "../../usersV2/show/UserAvatar";
import { GroupResponse } from "../api/namespace.api";

interface GroupShortHandDisplayProps {
  className?: string;
  element: "card-body" | "list-item" | "plain";
  group: GroupResponse;
}
export default function GroupShortHandDisplay({
  className,
  element,
  group,
}: GroupShortHandDisplayProps) {
  const content = (
    <div
      className={cx(
        element === "card-body" && ["d-flex", "flex-column", "flex-grow-1"]
      )}
      data-cy="group-item"
    >
      <div className={cx("d-flex", "gap-2")}>
        <UserAvatar namespace={group.slug} size="md" />
        <div
          className={cx(
            "d-flex",
            "flex-column",
            "justify-content-center",
            "text-truncate"
          )}
        >
          <p className={cx("m-0", "fw-bold", "text-truncate")}>{group.name}</p>
          <TimeCaption
            className={cx("text-truncate")}
            datetime={group.creation_date}
            enableTooltip
            prefix="Created"
          />
        </div>
      </div>
    </div>
  );

  const elementClasses =
    element === "card-body"
      ? ["card-body", "d-flex"]
      : element === "list-item"
      ? ["list-group-item", "list-group-item-action"]
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
      to={generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
        slug: group.slug,
      })}
    >
      {content}
    </Link>
  );
}
