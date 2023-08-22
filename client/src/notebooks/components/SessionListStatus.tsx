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
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import {
  Badge,
  PopoverBody,
  PopoverHeader,
  UncontrolledPopover,
} from "reactstrap";
import { Clipboard } from "../../components/Clipboard";
import SessionHibernationStatusDetails from "../../features/session/components/status/SessionHibernationStatusDetails";
import SessionStatusIcon from "../../features/session/components/status/SessionStatusIcon";
import SessionStatusText from "../../features/session/components/status/SessionStatusText";
import { SessionStatusState } from "../../features/session/sessions.types";
import { getSessionStatusColor } from "../../features/session/utils/sessionStatus.utils";
import type { NotebookAnnotations } from "./session.types";

interface SessionListRowCoreProps {
  annotations: NotebookAnnotations;
  details: { message: string | undefined };
  status: SessionStatusState;
  uid: string;
}

interface SessionListRowStatusProps extends SessionListRowCoreProps {
  startTimestamp: string;
}

function SessionListRowStatusExtraDetails({
  details,
  status,
  uid,
}: Pick<SessionListRowStatusProps, "details" | "status" | "uid">) {
  if (!details.message) return null;

  const popover = (
    <UncontrolledPopover target={uid} trigger="legacy" placement="bottom">
      <PopoverHeader>Kubernetes pod status</PopoverHeader>
      <PopoverBody>
        <span>{details.message}</span>
        <br />
      </PopoverBody>
    </UncontrolledPopover>
  );

  if (status == "failed")
    return (
      <>
        {" "}
        <span id={uid} className="text-muted cursor-pointer">
          (Click here for details.)
        </span>
        {popover}
      </>
    );
  return (
    <>
      {" "}
      <FontAwesomeIcon id={uid} icon={faInfoCircle} />
      {popover}
    </>
  );
}

function SessionListRowStatus({
  status,
  details,
  uid,
  annotations,
  startTimestamp,
}: SessionListRowStatusProps) {
  // Do not use "warning" color when a default image is in use
  const color = getSessionStatusColor({ defaultImage: false, status });

  return (
    <>
      <span className={cx("time-caption", "font-weight-bold", `text-${color}`)}>
        <SessionStatusText
          annotations={annotations}
          startTimestamp={startTimestamp}
          status={status}
        />
        <SessionListRowStatusExtraDetails
          details={details}
          status={status}
          uid={uid}
        />
      </span>
    </>
  );
}

interface SessionListRowStatusIconProps extends SessionListRowCoreProps {
  image: string;
  spaced?: boolean;
}

type SessionListRowStatusIconPopoverProps = Pick<
  SessionListRowStatusIconProps,
  "annotations" | "details" | "image" | "status"
> & {
  id: string;
};

function SessionListRowStatusIconPopover({
  annotations,
  details,
  image,
  id,
  status,
}: SessionListRowStatusIconPopoverProps) {
  if (status !== "running" && status !== "failed" && status !== "hibernated") {
    return null;
  }

  if (status === "failed") {
    return (
      <UncontrolledPopover target={id} trigger="legacy" placement="right">
        <PopoverHeader>Kubernetes pod status</PopoverHeader>
        <PopoverBody>
          <span>{details.message}</span>
          <br />
        </PopoverBody>
      </UncontrolledPopover>
    );
  }

  const policy = annotations.default_image_used && (
    <span>
      <br />
      <span className="fw-bold">Warning:</span> a fallback image was used.
    </span>
  );

  if (status === "hibernated") {
    return (
      <UncontrolledPopover placement="bottom" target={id} trigger="legacy">
        <PopoverHeader>Details</PopoverHeader>
        <PopoverBody>
          <h3 className="fs-6 fw-bold">Paused session</h3>
          <SessionHibernationStatusDetails annotations={annotations} />

          {image && (
            <>
              <span className="fw-bold">Image source:</span> {image}
              <span className="ms-1">
                <Clipboard clipboardText={image} />
              </span>
              {policy}
            </>
          )}
        </PopoverBody>
      </UncontrolledPopover>
    );
  }

  if (!image) {
    return null;
  }

  return (
    <UncontrolledPopover placement="bottom" target={id} trigger="legacy">
      <PopoverHeader>Details</PopoverHeader>
      <PopoverBody>
        <span className="fw-bold">Image source:</span> {image}
        <span className="ms-1">
          <Clipboard clipboardText={image} />
        </span>
        {policy}
      </PopoverBody>
    </UncontrolledPopover>
  );
}

function SessionListRowStatusBadge({
  annotations,
  details,
  image,
  spaced,
  status,
  uid,
}: SessionListRowStatusIconProps) {
  const defaultImage = annotations.default_image_used;

  const className = cx("text-nowrap p-1 cursor-pointer", spaced && "mb-2");
  const color = getSessionStatusColor({ defaultImage, status });
  const id = `${uid}-status`;

  return (
    <div>
      <Badge id={id} color={color} className={className}>
        <SessionStatusIcon defaultImage={defaultImage} status={status} />
      </Badge>
      <SessionListRowStatusIconPopover
        annotations={annotations}
        details={details}
        image={image}
        id={id}
        status={status}
      />
    </div>
  );
}

export {
  SessionListRowStatus,
  SessionListRowStatusBadge as SessionListRowStatusIcon,
};
