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

import React, { useCallback, useEffect, useState } from "react";
import {
  faExternalLinkAlt,
  faFileAlt,
  faLink,
  faPlay,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import {
  Button,
  Col,
  DropdownItem,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import { WarnAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import { ButtonWithMenu } from "../../../components/buttons/Button";
import SessionPausedIcon from "../../../components/icons/SessionPausedIcon";
import { SshDropdown } from "../../../components/ssh/ssh";
import { User } from "../../../model/RenkuModels";
import { NotebooksHelper } from "../../../notebooks";
import { NotebookAnnotations } from "../../../notebooks/components/Session";
import rkIconStartWithOptions from "../../../styles/icons/start-with-options.svg";
import { Url } from "../../../utils/helpers/url";
import { toggleSessionLogsModal } from "../../display/displaySlice";
import {
  useGetSessionsQuery,
  usePatchSessionMutation,
  useStopSessionMutation,
} from "../sessions.api";
import { Session, SessionStatusState } from "../sessions.types";
import { getRunningSession } from "../sessions.utils";
import useWaitForSessionStatus from "../useWaitForSessionStatus.hook";
import SimpleSessionButton from "./SimpleSessionButton";

interface SessionButtonProps {
  className?: string;
  enableCreateSessionLink?: boolean;
  fullPath: string;
  gitUrl?: string;
  runningSessionName?: string;
}

export default function SessionButton({
  className,
  enableCreateSessionLink,
  fullPath,
  gitUrl,
  runningSessionName,
}: SessionButtonProps) {
  const sessionAutostartUrl = Url.get(Url.pages.project.session.autostart, {
    namespace: "",
    path: fullPath,
  });
  const sessionStartUrl = Url.get(Url.pages.project.session.new, {
    namespace: "",
    path: fullPath,
  });

  const { data: sessions, isLoading, isError } = useGetSessionsQuery();

  const runningSession =
    sessions && runningSessionName && runningSessionName in sessions
      ? sessions[runningSessionName]
      : sessions
      ? getRunningSession({ autostartUrl: sessionAutostartUrl, sessions })
      : null;

  if (isLoading) {
    return (
      <Button className={cx("btn-sm", className)} disabled>
        <span>Loading...</span>
      </Button>
    );
  }

  if (!runningSession) {
    const defaultAction = (
      <SimpleSessionButton
        className="session-link-group"
        fullPath={fullPath}
        skip={isError}
      />
    );
    return (
      <ButtonWithMenu
        className={cx("startButton", className)}
        color="rk-green"
        default={defaultAction}
        isPrincipal
        size="sm"
      >
        <DropdownItem>
          <Link className="text-decoration-none" to={sessionStartUrl}>
            <img
              src={rkIconStartWithOptions}
              className="rk-icon rk-icon-md btn-with-menu-margin"
            />
            Start with options
          </Link>
        </DropdownItem>
        {gitUrl && <SshDropdown fullPath={fullPath} gitUrl={gitUrl} />}
        {enableCreateSessionLink && (
          <>
            <DropdownItem divider />
            <DropdownItem>
              <Link
                className="text-decoration-none"
                to={{
                  pathname: sessionStartUrl,
                  search: new URLSearchParams({
                    showCreateLink: "1",
                  }).toString(),
                }}
              >
                <FontAwesomeIcon
                  className={cx("text-rk-green", "fa-w-14", "me-2")}
                  fixedWidth
                  icon={faLink}
                />
                Create session link
              </Link>
            </DropdownItem>
          </>
        )}
      </ButtonWithMenu>
    );
  }

  return (
    <SessionActions
      className={className}
      enableCreateSessionLink={enableCreateSessionLink}
      session={runningSession}
    />
  );
}

interface SessionActionsProps {
  className?: string;
  enableCreateSessionLink?: boolean;
  session: Session;
}

function SessionActions({
  className,
  enableCreateSessionLink,
  session,
}: SessionActionsProps) {
  const history = useHistory();

  const logged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  const dispatch = useDispatch();
  const onToggleLogs = useCallback(() => {
    dispatch(toggleSessionLogsModal({ targetServer: session.name }));
  }, [dispatch, session.name]);

  const annotations = NotebooksHelper.cleanAnnotations(
    session.annotations
  ) as Session["annotations"];
  const showSessionUrl = Url.get(Url.pages.project.session.show, {
    namespace: annotations.namespace,
    path: annotations.projectName,
    server: session.name,
  });
  const sessionStartUrl = Url.get(Url.pages.project.session.new, {
    namespace: annotations.namespace,
    path: annotations.projectName,
  });

  // Handle resuming session
  const [isResuming, setIsResuming] = useState(false);
  const [resumeSession, { isSuccess: isSuccessResumeSession }] =
    usePatchSessionMutation();
  const onResumeSession = useCallback(() => {
    resumeSession({ sessionName: session.name, state: "running" });
    setIsResuming(true);
  }, [resumeSession, session.name]);
  const { isWaiting: isWaitingForResumedSession } = useWaitForSessionStatus({
    desiredStatus: ["starting", "running"],
    sessionName: session.name,
    skip: !isResuming,
  });
  useEffect(() => {
    if (isSuccessResumeSession && !isWaitingForResumedSession) {
      history.push({ pathname: showSessionUrl });
    }
  }, [
    history,
    isSuccessResumeSession,
    isWaitingForResumedSession,
    showSessionUrl,
  ]);

  // Handle hibernating session
  const [isHibernating, setIsHibernating] = useState(false);
  const [hibernateSession, { isSuccess: isSuccessHibernateSession }] =
    usePatchSessionMutation();
  const onHibernateSession = useCallback(() => {
    hibernateSession({ sessionName: session.name, state: "hibernated" });
    setIsHibernating(true);
  }, [hibernateSession, session.name]);
  const { isWaiting: isWaitingForHibernatedSession } = useWaitForSessionStatus({
    desiredStatus: ["hibernated"],
    sessionName: session.name,
    skip: !isHibernating,
  });
  useEffect(() => {
    if (isSuccessHibernateSession && !isWaitingForHibernatedSession) {
      setIsHibernating(false);
    }
  }, [isSuccessHibernateSession, isWaitingForHibernatedSession]);

  // Handle deleting session
  const [stopSession] = useStopSessionMutation();
  // Optimistically show a session as "stopping" when triggered from the UI
  const [isStopping, setIsStopping] = useState<boolean>(false);
  const onStopSession = useCallback(() => {
    stopSession({ serverName: session.name });
    setIsStopping(true);
  }, [session.name, stopSession]);
  // Modal for confirming session deletion
  const [showModalStopSession, setShowModalStopSession] = useState(false);
  const toggleStopSession = useCallback(
    () => setShowModalStopSession((show) => !show),
    []
  );

  const status = session.status.state;

  const buttonClassName = cx(
    "btn",
    "btn-rk-green",
    "btn-sm",
    "btn-icon-text",
    "start-session-button",
    "session-link-group"
  );

  const defaultAction =
    status === "stopping" || isStopping ? (
      <Button className={buttonClassName} data-cy="stopping-btn" disabled>
        <Loader className="me-2" inline size={16} />
        Deleting
      </Button>
    ) : isHibernating ? (
      <Button className={buttonClassName} data-cy="stopping-btn" disabled>
        <Loader className="me-2" inline size={16} />
        Pausing
      </Button>
    ) : status === "starting" || status === "running" ? (
      <Link
        className={buttonClassName}
        data-cy="open-session"
        to={{ pathname: showSessionUrl }}
      >
        <img
          className={cx("rk-icon", "rk-icon-md", "me-2")}
          src="/connect.svg"
        />
        Connect
      </Link>
    ) : status === "hibernated" ? (
      <Button
        className={buttonClassName}
        data-cy="resume-session-button"
        disabled={isResuming}
        onClick={onResumeSession}
      >
        {isResuming ? (
          <>
            <Loader className="me-2" inline size={16} />
            Resuming
          </>
        ) : (
          <>
            <FontAwesomeIcon
              className={cx("rk-icon", "rk-icon-md", "me-2")}
              icon={faPlay}
            />
            Resume
          </>
        )}
      </Button>
    ) : (
      <Button
        className={buttonClassName}
        data-cy={logged ? "pause-session-button" : "delete-session-button"}
        onClick={logged ? onHibernateSession : onStopSession}
      >
        {logged ? (
          <span className="align-self-start">
            <SessionPausedIcon size={16} />
          </span>
        ) : (
          <FontAwesomeIcon
            className={cx("rk-icon", "rk-icon-md", "me-2")}
            icon={faTrash}
          />
        )}
        {logged ? "Pause" : "Delete"}
      </Button>
    );

  const hibernateAction = status !== "stopping" &&
    status !== "failed" &&
    status !== "hibernated" &&
    !isStopping &&
    !isHibernating &&
    logged && (
      <DropdownItem
        disabled={status === "starting"}
        onClick={onHibernateSession}
      >
        <SessionPausedIcon
          className={cx("text-rk-green", "svg-inline--fa", "fa-fw", "me-2")}
          size={16}
        />
        Pause session
      </DropdownItem>
    );

  const deleteAction = status !== "stopping" && !isStopping && (
    <DropdownItem onClick={logged ? toggleStopSession : onStopSession}>
      <FontAwesomeIcon
        className={cx("text-rk-green", "fa-w-14", "me-2")}
        fixedWidth
        icon={faTrash}
      />
      Delete session
    </DropdownItem>
  );

  const openInNewTabAction = (status === "starting" ||
    status === "running") && (
    <DropdownItem href={session.url} target="_blank">
      <FontAwesomeIcon
        className={cx("text-rk-green", "fa-w-14", "me-2")}
        fixedWidth
        icon={faExternalLinkAlt}
      />
      Open in new tab
    </DropdownItem>
  );

  const createSessionLinkAction = enableCreateSessionLink && (
    <>
      <DropdownItem divider />
      <DropdownItem>
        <Link
          className="text-decoration-none"
          to={{
            pathname: sessionStartUrl,
            search: new URLSearchParams({
              showCreateLink: "1",
            }).toString(),
          }}
        >
          <FontAwesomeIcon
            className={cx("text-rk-green", "fa-w-14", "me-2")}
            fixedWidth
            icon={faLink}
          />
          Create session link
        </Link>
      </DropdownItem>
    </>
  );

  const logsAction = (
    <DropdownItem data-cy="session-log-button" onClick={onToggleLogs}>
      <FontAwesomeIcon
        className={cx("text-rk-green", "fa-w-14", "me-2")}
        fixedWidth
        icon={faFileAlt}
      />
      Get logs
    </DropdownItem>
  );

  return (
    <ButtonWithMenu
      className={cx("sessionsButton", className)}
      color="rk-green"
      default={defaultAction}
      disabled={status === "stopping" || isStopping}
      isPrincipal
      size="sm"
    >
      {hibernateAction}
      {deleteAction}
      {(hibernateAction || deleteAction) && <DropdownItem divider />}

      {openInNewTabAction}
      {logsAction}
      {createSessionLinkAction}

      <ConfirmDeleteModal
        annotations={annotations as NotebookAnnotations}
        isOpen={showModalStopSession}
        isStopping={isStopping}
        onStopSession={onStopSession}
        status={status}
        toggleModal={toggleStopSession}
      />
    </ButtonWithMenu>
  );
}

interface ConfirmDeleteModalProps {
  annotations: NotebookAnnotations;
  isOpen: boolean;
  isStopping: boolean;
  onStopSession: () => void;
  status: SessionStatusState;
  toggleModal: () => void;
}

function ConfirmDeleteModal({
  annotations,
  isOpen,
  isStopping,
  onStopSession,
  status,
  toggleModal,
}: ConfirmDeleteModalProps) {
  const onClick = useCallback(() => {
    onStopSession();
    toggleModal();
  }, [onStopSession, toggleModal]);

  return (
    <Modal isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Delete Session</ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <p className="mb-1">
              Are you sure you want to delete this session?
            </p>
            <p className="fw-bold">
              Deleting a session will permanently remove any unsaved work.
            </p>
            <UnsavedWorkWarning annotations={annotations} status={status} />
            <div className="d-flex justify-content-end">
              <Button
                className={cx("float-right", "mt-1", "btn-outline-rk-green")}
                disabled={isStopping}
                onClick={toggleModal}
              >
                No, keep this session
              </Button>
              <Button
                className={cx("float-right", "mt-1", "ms-2", "btn-rk-green")}
                data-cy="delete-session-modal-button"
                disabled={isStopping}
                type="submit"
                onClick={onClick}
              >
                Yes, delete this session
              </Button>
            </div>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
}

interface UnsavedWorkWarningProps {
  annotations: NotebookAnnotations;
  status: SessionStatusState;
}

function UnsavedWorkWarning({ annotations, status }: UnsavedWorkWarningProps) {
  const hasHibernationInfo = !!annotations["hibernation-date"];
  const hasUnsavedWork =
    !hasHibernationInfo ||
    annotations["hibernation-dirty"] ||
    !annotations["hibernation-synchronized"];

  if (!hasUnsavedWork) {
    return null;
  }

  const explanation = !hasHibernationInfo
    ? "uncommitted files and/or unsynced commits"
    : annotations["hibernation-dirty"] &&
      !annotations["hibernation-synchronized"]
    ? "uncommitted files and unsynced commits"
    : annotations["hibernation-dirty"]
    ? "uncommitted files"
    : "unsynced commits";

  return (
    <WarnAlert dismissible={false}>
      You {status !== "hibernated" && <>may </>} have unsaved work {"("}
      {explanation}
      {")"} in this session
    </WarnAlert>
  );
}
