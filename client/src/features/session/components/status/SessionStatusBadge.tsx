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

import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { useRef } from "react";
import {
  Badge,
  PopoverBody,
  PopoverHeader,
  UncontrolledPopover,
} from "reactstrap";
import { NotebookAnnotations } from "../../../../notebooks/components/session.types";
import { SessionStatus, SessionStatusState } from "../../sessions.types";
import { getSessionStatusColor } from "../../utils/sessionStatus.utils";
import SessionHibernationStatusDetails from "./SessionHibernationStatusDetails";
import SessionStatusIcon from "./SessionStatusIcon";

interface SessionStatusBadgeProps {
  annotations: NotebookAnnotations;
  defaultImage: boolean;
  status: SessionStatus;
}

export default function SessionStatusBadge({
  annotations,
  defaultImage,
  status: statusObject,
}: SessionStatusBadgeProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { message, state: status } = statusObject;

  const color = getSessionStatusColor({ defaultImage, status });
  const popover = (status === "failed" ||
    (status === "running" && defaultImage) ||
    status === "hibernated") && (
    <UncontrolledPopover target={ref} trigger="hover" placement="bottom">
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
    <>
      <div
        className={cx(
          "d-flex",
          "align-items-center",
          "gap-1",
          popover && "cursor-pointer"
        )}
        ref={ref}
      >
        <UnsavedWorkWarning annotations={annotations} status={status} />
        <Badge className="p-1" color={color}>
          <SessionStatusIcon defaultImage={defaultImage} status={status} />
        </Badge>
        <span className={`text-${color} small session-status-text`}>
          {displayedSessionStatus(status)}
        </span>
      </div>
      {popover}
    </>
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

interface UnsavedWorkWarningProps {
  annotations: NotebookAnnotations;
  status: SessionStatusState;
}

function UnsavedWorkWarning({ annotations, status }: UnsavedWorkWarningProps) {
  if (status !== "hibernated") {
    return null;
  }

  const hasHibernationInfo = !!annotations["hibernationDate"];
  const hasUnsavedWork =
    !hasHibernationInfo ||
    annotations["hibernationDirty"] ||
    !annotations["hibernationSynchronized"];

  if (!hasUnsavedWork) {
    return null;
  }

  return (
    <span
      className={cx(
        "time-caption",
        "text-rk-text-light",
        "text-truncate",
        "me-2"
      )}
    >
      <FontAwesomeIcon
        className={cx("text-warning", "me-1")}
        icon={faExclamationTriangle}
      />
      Unsaved work
    </span>
  );
}
