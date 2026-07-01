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
import { ReactNode } from "react";
import {
  ArrowRightCircle,
  FileEarmarkText,
  PauseCircle,
  PlayFill,
  Tools,
  Trash,
} from "react-bootstrap-icons";
import { Link } from "react-router";
import { Button } from "reactstrap";

import { Loader } from "~/components/Loader";
import { JOB_STOPPING_BUTTON_LABEL } from "~/features/sessionsV2/session.utils.ts";
import { SessionStatusState } from "../../sessionsV2.types";

export interface ActiveSessionActionContext {
  status: SessionStatusState;
  isStopping: boolean;
  isHibernating: boolean;
  isResuming: boolean;
  failedScheduling: boolean;
  isUserLoggedIn: boolean;
  showSessionUrl: string;
  buttonClassName: string;
  onHibernateSession: () => void;
  onStopSession: () => void;
  onResumeSession: () => void;
  toggleLogsModal: () => void;
  toggleModifySession: () => void;
}

function StoppingStatusButton({ label }: { label: string }) {
  return (
    <Button color="primary" data-cy="stopping-btn" disabled>
      <Loader className="me-1" inline size={16} />
      {label}
    </Button>
  );
}

function DismissJobButton({
  buttonClassName,
  color = "outline-primary",
  onStopSession,
}: {
  buttonClassName?: string;
  color?: "outline-primary" | "primary";
  onStopSession: () => void;
}) {
  return (
    <Button
      color={color}
      className={color === "outline-primary" ? buttonClassName : undefined}
      data-cy={"dismiss-job-button"}
      onClick={onStopSession}
    >
      <Trash className={cx("bi", "me-1")} /> Dismiss
    </Button>
  );
}

function PausingStatusButton() {
  return (
    <Button color="primary" data-cy="stopping-btn" disabled>
      <Loader className="me-1" inline size={16} />
      Pausing
    </Button>
  );
}

function ResumeStatusButton({
  isResuming,
  onResumeSession,
}: {
  isResuming: boolean;
  onResumeSession: () => void;
}) {
  return (
    <Button
      color="outline-primary"
      data-cy="resume-session-button"
      disabled={isResuming}
      onClick={onResumeSession}
    >
      {isResuming ? (
        <>
          <Loader className="me-1" inline size={16} />
          Resuming
        </>
      ) : (
        <>
          <PlayFill className={cx("bi", "me-1")} />
          Resume
        </>
      )}
    </Button>
  );
}

function LogsStatusButton({
  onClick,
  label,
  color = "outline-primary",
}: {
  onClick: () => void;
  label: string;
  color?: "outline-primary" | "primary";
}) {
  return (
    <Button color={color} data-cy="show-logs-session-button" onClick={onClick}>
      <FileEarmarkText className={cx("bi", "me-1")} />
      {label}
    </Button>
  );
}

function OpenSessionButton({ showSessionUrl }: { showSessionUrl: string }) {
  return (
    <Link
      className={cx("btn", "btn-primary")}
      data-cy="open-session"
      to={showSessionUrl}
    >
      <ArrowRightCircle className={cx("bi", "me-1")} />
      Open
    </Link>
  );
}

function PauseOrDeleteButton({
  buttonClassName,
  color = "outline-primary",
  isUserLoggedIn,
  onHibernateSession,
  onStopSession,
}: {
  buttonClassName?: string;
  color?: "outline-primary" | "primary";
  isUserLoggedIn: boolean;
  onHibernateSession: () => void;
  onStopSession: () => void;
}) {
  return (
    <Button
      color={color}
      className={color === "outline-primary" ? buttonClassName : undefined}
      data-cy={
        isUserLoggedIn ? "pause-session-button" : "delete-session-button"
      }
      onClick={isUserLoggedIn ? onHibernateSession : onStopSession}
    >
      {isUserLoggedIn ? (
        <span className="align-self-start">
          <PauseCircle className={cx("bi", "me-1")} />
        </span>
      ) : (
        <Trash className={cx("bi", "me-1")} />
      )}
      {isUserLoggedIn ? "Pause" : "Delete"}
    </Button>
  );
}

export function getInteractiveSessionDefaultAction(
  ctx: ActiveSessionActionContext,
): ReactNode {
  const {
    status,
    isStopping,
    isHibernating,
    isResuming,
    failedScheduling,
    isUserLoggedIn,
    showSessionUrl,
    buttonClassName,
    onHibernateSession,
    onStopSession,
    onResumeSession,
    toggleLogsModal,
    toggleModifySession,
  } = ctx;

  if (status === "stopping" || isStopping) {
    return <StoppingStatusButton label="Shutting down" />;
  }
  if (isHibernating) {
    return <PausingStatusButton />;
  }
  if (status === "starting") {
    return <OpenSessionButton showSessionUrl={showSessionUrl} />;
  }
  if (status === "running") {
    return (
      <>
        <PauseOrDeleteButton
          buttonClassName={buttonClassName}
          isUserLoggedIn={isUserLoggedIn}
          onHibernateSession={onHibernateSession}
          onStopSession={onStopSession}
        />
        <OpenSessionButton showSessionUrl={showSessionUrl} />
      </>
    );
  }
  if (status === "hibernated") {
    return (
      <ResumeStatusButton
        isResuming={isResuming}
        onResumeSession={onResumeSession}
      />
    );
  }
  if (failedScheduling) {
    return (
      <>
        <LogsStatusButton onClick={toggleLogsModal} label="View logs" />
        <Button
          color="primary"
          className={buttonClassName}
          data-cy="modify-session-button"
          onClick={toggleModifySession}
        >
          <Tools className={cx("bi", "me-1")} />
          Modify
        </Button>
      </>
    );
  }
  return (
    <>
      <LogsStatusButton onClick={toggleLogsModal} label="View logs" />
      <PauseOrDeleteButton
        color="primary"
        isUserLoggedIn={isUserLoggedIn}
        onHibernateSession={onHibernateSession}
        onStopSession={onStopSession}
      />
    </>
  );
}

export function getJobDefaultAction(
  ctx: ActiveSessionActionContext,
): ReactNode {
  const {
    status,
    isStopping,
    isHibernating,
    isResuming,
    onResumeSession,
    toggleLogsModal,
    onStopSession,
  } = ctx;

  if (status === "stopping" || isStopping) {
    return <StoppingStatusButton label={JOB_STOPPING_BUTTON_LABEL} />;
  }
  if (isHibernating) {
    return <PausingStatusButton />;
  }
  if (status === "starting" || status === "running") {
    return <LogsStatusButton onClick={toggleLogsModal} label="View logs" />;
  }
  if (status === "succeeded") {
    return <DismissJobButton onStopSession={onStopSession} />;
  }
  if (status === "hibernated") {
    return (
      <ResumeStatusButton
        isResuming={isResuming}
        onResumeSession={onResumeSession}
      />
    );
  }
  return <LogsStatusButton onClick={toggleLogsModal} label="View logs" />;
}
