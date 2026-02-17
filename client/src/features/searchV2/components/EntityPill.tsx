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
import { useRef } from "react";
import {
  Database,
  Folder2Open,
  Icon,
  People,
  Person,
  Question,
} from "react-bootstrap-icons";
import { Badge, UncontrolledTooltip } from "reactstrap";

import { type SearchEntity } from "../api/searchV2Api.api";
import { toDisplayName } from "../searchV2.utils";

interface EntityPillProps {
  entityType: SearchEntity["type"];
  size?: "sm" | "md" | "lg" | "xl" | "auto";
  tooltip?: boolean;
  tooltipPlacement?: "top" | "bottom" | "left" | "right";
}
export default function EntityPill({
  entityType,
  size = "auto",
  tooltip = true,
  tooltipPlacement = "top",
}: EntityPillProps) {
  const ref = useRef<HTMLDivElement>(null);
  const IconComponent: Icon =
    entityType === "Project"
      ? Folder2Open
      : entityType === "Group"
      ? People
      : entityType === "User"
      ? Person
      : entityType === "DataConnector"
      ? Database
      : Question;
  const sizeClass =
    size == "sm"
      ? "fs-6"
      : size === "md"
      ? "fs-5"
      : size === "lg"
      ? "fs-4"
      : size === "xl"
      ? "fs-2"
      : null;

  return (
    <>
      <div ref={ref}>
        <Badge
          className={cx(
            "bg-light",
            "border-dark-subtle",
            "border",
            "d-flex",
            "p-2",
            "text-dark-emphasis",
            sizeClass
          )}
          pill
        >
          <IconComponent />
        </Badge>
      </div>
      {tooltip && (
        <UncontrolledTooltip placement={tooltipPlacement} target={ref}>
          {toDisplayName(entityType)}
        </UncontrolledTooltip>
      )}
    </>
  );
}
