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
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import {
  Badge,
  PopoverBody,
  PopoverHeader,
  UncontrolledPopover,
} from "reactstrap";
import { Clipboard } from "../../components/Clipboard";
import { Loader } from "../../components/Loader";
import { SessionStatus } from "../../utils/constants/Notebooks";
import type { NotebookAnnotations } from "./Session";

type SessionRunningStatus = "failed" | "running" | "starting" | "stopping";

type SessionListRowCoreProps = {
  annotations: NotebookAnnotations;
  details: { message: string };
  status: SessionRunningStatus;
  uid: string;
};

function getStatusObject(status: SessionRunningStatus, defaultImage: boolean) {
  switch (status) {
    case SessionStatus.running:
      return {
        color: defaultImage ? "warning" : "success",
        icon: defaultImage ? (
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            inverse={true}
            size="lg"
          />
        ) : (
          <FontAwesomeIcon icon={faCheckCircle} size="lg" />
        ),
        text: "Running",
      };
    case SessionStatus.starting:
      return {
        color: "warning",
        icon: <Loader size={16} inline />,
        text: "Starting...",
      };
    case SessionStatus.stopping:
      return {
        color: "warning",
        icon: <Loader size={16} inline />,
        text: "Stopping...",
      };
    case SessionStatus.failed:
      return {
        color: "danger",
        icon: <FontAwesomeIcon icon={faTimesCircle} size="lg" />,
        text: "Error",
      };
    default:
      return {
        color: "danger",
        icon: <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />,
        text: "Unknown",
      };
  }
}

interface SessionListRowStatusProps extends SessionListRowCoreProps {
  startTime: string;
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

function SessionListRowStatus(props: SessionListRowStatusProps) {
  const { status, details, uid, annotations, startTime } = props;
  const data = getStatusObject(status, annotations.default_image_used);
  const textColor = {
    running: "text-secondary",
    failed: "text-danger",
    starting: "text-secondary",
    stopping: "text-secondary",
  };

  const textStatus =
    status === SessionStatus.running
      ? `${data.text} since ${startTime}`
      : data.text;

  return (
    <>
      <span className={`time-caption font-weight-bold ${textColor[status]}`}>
        {textStatus}
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
  spaced: boolean;
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
  if (status !== SessionStatus.running && status !== SessionStatus.failed)
    return null;
  if (status === SessionStatus.failed) {
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

  if (!image) return null;
  const policy = annotations.default_image_used ? (
    <span>
      <br />
      <span className="font-weight-bold">Warning:</span> a fallback image was
      used.
    </span>
  ) : null;
  return (
    <UncontrolledPopover target={id} trigger="legacy" placement="bottom">
      <PopoverHeader>Details</PopoverHeader>
      <PopoverBody>
        <span className="font-weight-bold">Image source:</span> {image}
        <span className="ms-1">
          <Clipboard clipboardText={image} />
        </span>
        {policy}
      </PopoverBody>
    </UncontrolledPopover>
  );
}

function SessionListRowStatusIcon({
  annotations,
  details,
  image,
  spaced,
  status,
  uid,
}: SessionListRowStatusIconProps) {
  const data = getStatusObject(status, annotations.default_image_used);
  const className = cx("text-nowrap p-1 cursor-pointer", spaced && "mb-2");
  const id = `${uid}-status`;

  return (
    <div>
      <Badge id={id} color={data.color} className={className}>
        {data.icon}
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

export { SessionListRowStatus, SessionListRowStatusIcon, getStatusObject };
export type { SessionRunningStatus };
