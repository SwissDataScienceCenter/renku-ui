/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import React from "react";
import {
  Badge,
  PopoverBody,
  PopoverHeader,
  UncontrolledPopover,
} from "reactstrap";
import cx from "classnames";
import { SessionStatus, SessionStatusState } from "../../sessions.types";
import { getSessionStatusColor } from "../../utils/sessionStatus.utils";
import SessionStatusIcon from "./SessionStatusIcon";
import SessionHibernationStatusDetails from "./SessionHibernationStatusDetails";
import { NotebookAnnotations } from "../../../../notebooks/components/session.types";

interface SessionStatusBadgeProps {
  annotations: NotebookAnnotations;
  defaultImage: boolean;
  name: string;
  status: SessionStatus;
}

export default function SessionStatusBadge({
  annotations,
  defaultImage,
  name,
  status: statusObject,
}: SessionStatusBadgeProps) {
  const { message, state: status } = statusObject;

  const color = getSessionStatusColor({ defaultImage, status });
  const popover = (status === "failed" ||
    (status === "running" && defaultImage) ||
    status === "hibernated") && (
    <UncontrolledPopover target={name} trigger="hover" placement="bottom">
      <PopoverHeader>
        {status === "failed"
          ? "Error Details"
          : status === "running"
          ? "Warning Details"
          : "Paused Session"}
      </PopoverHeader>
      <PopoverBody>
        {message}
        {defaultImage && <div>A fallback image was used.</div>}
        {status === "hibernated" && (
          <SessionHibernationStatusDetails annotations={annotations} />
        )}
      </PopoverBody>
    </UncontrolledPopover>
  );

  return (
    <div
      id={name}
      className={cx(
        "d-flex",
        "align-items-center",
        "gap-1",
        popover && "cursor-pointer"
      )}
    >
      <Badge className="p-1" color={color}>
        <SessionStatusIcon defaultImage={defaultImage} status={status} />
      </Badge>
      <span className={`text-${color} small session-status-text`}>
        {displayedSessionStatus(status)}
      </span>
      {popover}
    </div>
  );
}

function displayedSessionStatus(status: SessionStatusState): string {
  return status === "running"
    ? "Running"
    : status === "starting"
    ? "Starting"
    : status === "stopping"
    ? "Deleting"
    : status === "hibernated"
    ? "Paused"
    : status === "failed"
    ? "Error"
    : "Unknown state";
}
