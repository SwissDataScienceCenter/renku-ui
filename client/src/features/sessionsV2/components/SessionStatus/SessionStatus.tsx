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
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { ReactNode } from "react";
import { CircleFill, Clock } from "react-bootstrap-icons";
import {
  Badge,
  PopoverBody,
  PopoverHeader,
  UncontrolledPopover,
} from "reactstrap";

import { Loader } from "../../../../components/Loader";
import { TimeCaption } from "../../../../components/TimeCaption";
import { PrettySessionErrorMessage } from "../../../session/components/status/SessionStatusBadge";
import { MissingHibernationInfo } from "../../../session/components/status/SessionStatusText";
import {
  SessionLauncher,
  SessionStatus,
  SessionV2,
} from "../../sessionsV2.types";

export function SessionBadge({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <Badge className={cx("border", "fs-small", "fw-normal", className)} pill>
      {children}
    </Badge>
  );
}
interface ActiveSessionV2Props {
  session: SessionV2;
}
interface ActiveSessionDescV2Props extends ActiveSessionV2Props {
  showInfoDetails?: boolean;
}
interface ActiveSessionTitleV2Props {
  session: SessionV2;
  launcher?: SessionLauncher;
}
export function SessionStatusV2Label({ session }: ActiveSessionV2Props) {
  const { status, image } = session;
  const state = status.state;

  const badge =
    state === "running" && !image ? (
      <SessionBadge className={cx("border-warning", "bg-warning-subtle")}>
        <CircleFill className={cx("bi", "me-1", "text-warning-emphasis")} />
        <span className="text-warning-emphasis">Running Session</span>
      </SessionBadge>
    ) : state === "running" ? (
      <SessionBadge className={cx("border-success", "bg-success-subtle")}>
        <CircleFill className={cx("bi", "me-1", "text-success-emphasis")} />
        <span className="text-success-emphasis">Running Session</span>
      </SessionBadge>
    ) : state === "starting" ? (
      <SessionBadge className={cx("border-warning", "bg-warning-subtle")}>
        <Loader
          size={12}
          className={cx("me-1", "text-warning-emphasis")}
          inline
        />
        <span className="text-warning-emphasis">Starting Session</span>
      </SessionBadge>
    ) : state === "stopping" ? (
      <SessionBadge className={cx("border-warning", "bg-warning-subtle")}>
        <Loader
          size={12}
          className={cx("me-1", "text-warning-emphasis")}
          inline
        />
        <span className="text-warning-emphasis">Shutting down session</span>
      </SessionBadge>
    ) : state === "hibernated" ? (
      <SessionBadge className={cx("border-dark-subtle", "bg-light")}>
        <CircleFill className={cx("bi", "me-1", "text-light-emphasis")} />
        <span className="text-dark-emphasis">Paused Session</span>
      </SessionBadge>
    ) : state === "failed" ? (
      <SessionBadge className={cx("border-danger", "bg-danger-subtle")}>
        <CircleFill
          className={cx("bi", "me-1", "text-danger-emphasis")}
          size={16}
        />
        <span className="text-danger-emphasis">Error in Session</span>
      </SessionBadge>
    ) : (
      <SessionBadge className={cx("border-warning", "bg-warning-subtle")}>
        <CircleFill className={cx("bi", "me-1", "text-warning")} />
        <span className="text-warning">Unknown status</span>
      </SessionBadge>
    );

  return (
    <div className={cx("d-flex", "flex-row", "gap-2", "align-items-center")}>
      {badge}
    </div>
  );
}
export function SessionStatusV2Description({
  session,
  showInfoDetails = true,
}: ActiveSessionDescV2Props) {
  const { started, status, name } = session;
  return (
    <div
      className={cx(
        "time-caption",
        "d-flex",
        "flex-row",
        "gap-2",
        "align-items-center"
      )}
    >
      <SessionStatusV2Text startTimestamp={started} status={status} />
      {showInfoDetails && (
        <SessionListRowStatusExtraDetailsV2 status={status} uid={name} />
      )}
    </div>
  );
}

interface StatusExtraDetailsV2Props {
  status: SessionStatus;
  uid: string;
}
export function SessionListRowStatusExtraDetailsV2({
  status,
  uid,
}: StatusExtraDetailsV2Props) {
  if (!status.message) return null;

  const popover = (
    <UncontrolledPopover target={uid} trigger="legacy" placement="bottom">
      <PopoverHeader>Kubernetes pod status</PopoverHeader>
      <PopoverBody>
        <PrettySessionErrorMessage message={status.message} />
      </PopoverBody>
    </UncontrolledPopover>
  );

  if (status.state == "failed")
    return (
      <>
        {" "}
        <span id={uid} className={cx("text-muted", "cursor-pointer")}>
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
export function SessionStatusV2Title({
  session,
  launcher,
}: ActiveSessionTitleV2Props) {
  const { status } = session;
  const state = status.state;

  const text =
    state === "running" && !launcher
      ? "You are currently running a orphan session"
      : state === "running"
      ? "You are currently running a session from this launcher"
      : state === "starting"
      ? "You are currently starting a session from this launcher"
      : state === "stopping"
      ? "You are currently deleting a session from this launcher"
      : state === "hibernated"
      ? "You have a paused session from this launcher"
      : state === "failed"
      ? "An error was encountered while attempting to launch this session."
      : null;

  return text ? <p className={cx("fst-italic", "mb-2")}>{text}</p> : null;
}
interface SessionStatusV2TextProps {
  startTimestamp: string;
  status: SessionStatus;
}
function SessionStatusV2Text({
  startTimestamp,
  status,
}: SessionStatusV2TextProps) {
  const { state, will_hibernate_at, will_delete_at } = status;
  const startTimeText = (
    <TimeCaption datetime={startTimestamp} enableTooltip noCaption />
  );
  const hibernationTimestamp =
    state === "hibernated" ? will_hibernate_at ?? "" : null;

  return state === "running" ? (
    <div className={cx("d-flex", "align-items-center", "gap-2")}>
      <Clock size="16" className="flex-shrink-0" />
      <span>Launched {startTimeText}</span>
    </div>
  ) : state === "starting" ? (
    <div className={cx("d-flex", "align-items-center", "gap-2")}>
      <Clock size="16" className="flex-shrink-0" />
      <span>Created {startTimeText}</span>
    </div>
  ) : state === "stopping" ? (
    <>Shutting down session...</>
  ) : state === "hibernated" && will_delete_at ? (
    <div className={cx("d-flex", "align-items-center", "gap-2")}>
      <Clock size="16" className="flex-shrink-0" />
      <span>
        Session will be deleted in{" "}
        <TimeCaption
          datetime={will_delete_at}
          enableTooltip
          noCaption
          suffix=" "
        />
      </span>
    </div>
  ) : state === "hibernated" && hibernationTimestamp ? (
    <div className={cx("d-flex", "align-items-center", "gap-2")}>
      <Clock size="16" className="flex-shrink-0" />
      <span>
        Paused
        <TimeCaption datetime={hibernationTimestamp} enableTooltip noCaption />
      </span>
    </div>
  ) : state === "hibernated" ? (
    <div className={cx("d-flex", "align-items-center", "gap-2")}>
      <Clock size="16" className="flex-shrink-0" />
      <span>
        Paused
        <MissingHibernationInfo />
      </span>
    </div>
  ) : state === "failed" ? (
    <div className={cx("d-flex", "align-items-center", "gap-2")}>
      <Clock size="16" className="flex-shrink-0" />
      <span>
        Error {"("}created {startTimeText}
        {")"}
      </span>
    </div>
  ) : null;
}
