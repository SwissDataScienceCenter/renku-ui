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
import { capitalize } from "lodash-es";
import { useRef } from "react";
import { Globe, Lock } from "react-bootstrap-icons";
import { UncontrolledTooltip } from "reactstrap";

export interface VisibilityIconV2Props {
  visibility: "public" | "private";
  className?: string;
}

export default function VisibilityIconV2({
  visibility,
  className,
}: VisibilityIconV2Props) {
  const ref = useRef(null);

  if (visibility !== "public" && visibility !== "private") {
    return null;
  }

  const icon =
    visibility === "public" ? (
      <Globe className={cx("bi", "me-1")} />
    ) : (
      <Lock className={cx("bi", "me-1")} />
    );
  const tooltip =
    visibility === "public"
      ? "Public: Anyone can access your project."
      : "Private: Only members explicitly added to this project can access it.";

  return (
    <>
      <div
        ref={ref}
        className={cx(
          "align-items-center",
          "card-visibility-icon",
          "d-flex",
          "gap-2",
          className
        )}
        data-cy="project-visibility"
      >
        {icon}
        {capitalize(visibility)}
      </div>
      <UncontrolledTooltip target={ref}>{tooltip}</UncontrolledTooltip>
    </>
  );
}
