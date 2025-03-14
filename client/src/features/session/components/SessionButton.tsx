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

import {
  faExternalLinkAlt,
  faFileAlt,
  faLink,
  faPlay,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError, skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CheckLg, Tools, XLg } from "react-bootstrap-icons";
import { Link, useHistory } from "react-router-dom";
import { SingleValue } from "react-select";
import {
  Button,
  Col,
  DropdownItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";

import { WarnAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import { ButtonWithMenu } from "../../../components/buttons/Button";
import SessionPausedIcon from "../../../components/icons/SessionPausedIcon";
import { SshDropdown } from "../../../components/ssh/ssh";
import { User } from "../../../model/renkuModels.types";
import { NotebooksHelper } from "../../../notebooks";
import { NotebookAnnotations } from "../../../notebooks/components/session.types";
import { NOTIFICATION_TOPICS } from "../../../notifications/Notifications.constants";
import { NotificationsManager } from "../../../notifications/notifications.types";
import rkIconStartWithOptions from "../../../styles/icons/start-with-options.svg";
import AppContext from "../../../utils/context/appContext";
import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import RtkQueryErrorsContext from "../../../utils/helpers/RtkQueryErrorsContext";
import { Url } from "../../../utils/helpers/url";
import { useGetResourcePoolsQuery } from "../../dataServices/computeResources.api";
import { ResourceClass } from "../../dataServices/dataServices.types";
import { toggleSessionLogsModal } from "../../display/displaySlice";
import {
  ErrorOrNotAvailableResourcePools,
  FetchingResourcePools,
} from "../../sessionsV2/components/SessionModals/ResourceClassWarning";
import {
  useGetSessionsQuery,
  usePatchSessionMutation,
  useStopSessionMutation,
} from "../sessions.api";
import { Session, SessionStatusState } from "../sessions.types";
import { getRunningSession } from "../sessions.utils";
import useWaitForSessionStatus from "../useWaitForSessionStatus.hook";
import { SessionRowResourceRequests } from "./SessionsList";
import SimpleSessionButton from "./SimpleSessionButton";
import UnsavedWorkWarning from "./UnsavedWorkWarning";
import { SessionClassSelector } from "./options/SessionClassOption";

interface SessionButtonProps {
  className?: string;
  fullPath: string;
  gitUrl?: string;
  branch?: string;
  runningSessionName?: string;
}

export default function SessionButton({
  className,
  fullPath,
  gitUrl,
  branch,
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

  const { getSessions } = useContext(RtkQueryErrorsContext);
  const {
    data: sessions,
    isLoading,
    isError,
  } = useGetSessionsQuery(!getSessions?.isError ? undefined : skipToken);

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
        skip={isError || getSessions?.isError}
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
        <li>
          <Link className="dropdown-item" to={sessionStartUrl}>
            <img
              src={rkIconStartWithOptions}
              className="rk-icon rk-icon-md me-2"
            />
            Start with options
          </Link>
        </li>
        {gitUrl && branch && (
          <SshDropdown fullPath={fullPath} gitUrl={gitUrl} branch={branch} />
        )}
        <DropdownItem divider />
        <li>
          <Link
            className="dropdown-item"
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
        </li>
      </ButtonWithMenu>
    );
  }

  return <SessionActions className={className} session={runningSession} />;
}

interface SessionActionsProps {
  className?: string;
  session: Session;
}

function SessionActions({ className, session }: SessionActionsProps) {
  const history = useHistory();

  const { notifications } = useContext(AppContext);

  const logged = useLegacySelector<User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  const dispatch = useAppDispatch();
  const onToggleLogs = useCallback(() => {
    dispatch(toggleSessionLogsModal({ targetServer: session.name }));
  }, [dispatch, session.name]);

  const annotations = NotebooksHelper.cleanAnnotations(
    session.annotations
  ) as NotebookAnnotations;
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
  const [
    resumeSession,
    { isSuccess: isSuccessResumeSession, error: errorResumeSession },
  ] = usePatchSessionMutation();
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
  useEffect(() => {
    if (errorResumeSession) {
      addErrorNotification({
        error: errorResumeSession,
        notifications: notifications as NotificationsManager,
        title: "Unable to resume the session",
      });
      setIsResuming(false);
    }
  }, [errorResumeSession, notifications]);

  // Handle hibernating session
  const [isHibernating, setIsHibernating] = useState(false);
  const [
    hibernateSession,
    { isSuccess: isSuccessHibernateSession, error: errorHibernateSession },
  ] = usePatchSessionMutation();
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
  useEffect(() => {
    if (errorHibernateSession) {
      addErrorNotification({
        error: errorHibernateSession,
        notifications: notifications as NotificationsManager,
        title: "Unable to pause the session",
      });
      setIsHibernating(false);
    }
  }, [errorHibernateSession, notifications]);

  // Handle deleting session
  const [stopSession, { error: errorStopSession }] = useStopSessionMutation();
  // Optimistically show a session as "stopping" when triggered from the UI
  const [isStopping, setIsStopping] = useState<boolean>(false);
  const onStopSession = useCallback(() => {
    stopSession({ serverName: session.name });
    setIsStopping(true);
  }, [session.name, stopSession]);
  useEffect(() => {
    if (errorStopSession) {
      addErrorNotification({
        error: errorStopSession,
        notifications: notifications as NotificationsManager,
        title: "Unable to delete the session",
      });
      setIsStopping(false);
    }
  }, [errorStopSession, notifications]);
  // Modal for confirming session deletion
  const [showModalStopSession, setShowModalStopSession] = useState(false);
  const toggleStopSession = useCallback(
    () => setShowModalStopSession((show) => !show),
    []
  );

  // Handle modifying session
  const [modifySession, { error: errorModifySession }] =
    usePatchSessionMutation();
  const onModifySession = useCallback(
    (sessionClass: number, resumeSession: boolean) => {
      const status = session.status.state;
      const request = modifySession({
        sessionName: session.name,
        sessionClass,
      });
      if (resumeSession && status === "hibernated") {
        request.then(() => {
          onResumeSession();
        });
      }
    },
    [modifySession, onResumeSession, session.name, session.status.state]
  );
  useEffect(() => {
    if (errorModifySession) {
      addErrorNotification({
        error: errorModifySession,
        notifications: notifications as NotificationsManager,
        title: "Unable to modify the session",
      });
    }
  }, [errorModifySession, notifications]);
  // Modal for modifying a session (change the session class)
  const [showModalModifySession, setShowModalModifySession] = useState(false);
  const toggleModifySession = useCallback(
    () => setShowModalModifySession((show) => !show),
    []
  );

  const status = session.status.state;
  const failedScheduling =
    status === "failed" &&
    (!!session.status.message?.includes(
      "The resource quota has been exceeded."
    ) ||
      !!session.status.message?.includes(
        // TODO: fix spelling in notebooks
        // eslint-disable-next-line spellcheck/spell-checker
        "Your session cannot be scheduled due to insufficent resources."
      ));

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
        <Loader className="me-1" inline size={16} />
        Deleting
      </Button>
    ) : isHibernating ? (
      <Button className={buttonClassName} data-cy="stopping-btn" disabled>
        <Loader className="me-1" inline size={16} />
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
            <Loader className="me-1" inline size={16} />
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
    ) : failedScheduling ? (
      <Button
        className={buttonClassName}
        data-cy="modify-session-button"
        onClick={toggleModifySession}
      >
        <Tools className={cx("bi", "flex-shrink-0", "me-2")} />
        Modify
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
    (status !== "failed" || failedScheduling) &&
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
    <DropdownItem
      data-cy="delete-session-button"
      onClick={logged ? toggleStopSession : onStopSession}
    >
      <FontAwesomeIcon
        className={cx("text-rk-green", "fa-w-14", "me-2")}
        fixedWidth
        icon={faTrash}
      />
      Delete session
    </DropdownItem>
  );

  const modifyAction = (status === "hibernated" || status === "failed") &&
    !isStopping &&
    !isHibernating &&
    !failedScheduling && (
      <DropdownItem
        data-cy="modify-session-button"
        onClick={toggleModifySession}
      >
        <Tools className={cx("bi", "text-rk-green", "me-2")} />
        Modify session
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

  const createSessionLinkAction = (
    <li>
      <Link
        className="dropdown-item"
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
    </li>
  );

  const logsAction = status !== "hibernated" && (
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
      isPrincipal
      size="sm"
    >
      {hibernateAction}
      {deleteAction}
      {modifyAction}
      {(hibernateAction || deleteAction || modifyAction) && (
        <DropdownItem divider />
      )}

      {openInNewTabAction}
      {logsAction}
      {(openInNewTabAction || logsAction) && <DropdownItem divider />}

      {createSessionLinkAction}

      <ConfirmDeleteModal
        annotations={annotations}
        isOpen={showModalStopSession}
        isStopping={isStopping}
        onStopSession={onStopSession}
        sessionName={session.name}
        status={status}
        toggleModal={toggleStopSession}
      />
      <ModifySessionModal
        annotations={annotations}
        isOpen={showModalModifySession}
        onModifySession={onModifySession}
        resources={session.resources}
        status={status}
        toggleModal={toggleModifySession}
      />
    </ButtonWithMenu>
  );
}

interface ConfirmDeleteModalProps {
  annotations: NotebookAnnotations;
  isOpen: boolean;
  isStopping: boolean;
  onStopSession: () => void;
  sessionName: string;
  status: SessionStatusState;
  toggleModal: () => void;
}

function ConfirmDeleteModal({
  annotations,
  isOpen,
  isStopping,
  onStopSession,
  sessionName,
  status,
  toggleModal,
}: ConfirmDeleteModalProps) {
  const onClick = useCallback(() => {
    onStopSession();
    toggleModal();
  }, [onStopSession, toggleModal]);

  return (
    <Modal centered isOpen={isOpen} toggle={toggleModal}>
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
            <UnsavedWorkWarning
              annotations={annotations}
              sessionName={sessionName}
              status={status}
            />
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

interface ModifySessionModalProps {
  annotations: NotebookAnnotations;
  isOpen: boolean;
  onModifySession: (sessionClass: number, resumeSession: boolean) => void;
  resources: Session["resources"];
  status: SessionStatusState;
  toggleModal: () => void;
}

function ModifySessionModal({
  annotations,
  isOpen,
  onModifySession,
  resources,
  status,
  toggleModal,
}: ModifySessionModalProps) {
  return (
    <Modal
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggleModal}
    >
      <ModalHeader toggle={toggleModal}>Modify Session</ModalHeader>
      <ModifySessionModalContent
        annotations={annotations}
        onModifySession={onModifySession}
        resources={resources}
        status={status}
        toggleModal={toggleModal}
      />
    </Modal>
  );
}

interface ModifySessionModalContentProps {
  annotations: NotebookAnnotations;
  onModifySession: (sessionClass: number, resumeSession: boolean) => void;
  resources: Session["resources"];
  status: SessionStatusState;
  toggleModal: () => void;
}

function ModifySessionModalContent({
  annotations,
  onModifySession,
  resources,
  status,
  toggleModal,
}: ModifySessionModalContentProps) {
  const currentSessionClassId = useMemo(() => {
    const raw = parseInt(annotations?.resourceClassId ?? "", 10);
    return isNaN(raw) ? undefined : raw;
  }, [annotations?.resourceClassId]);

  const {
    data: resourcePools,
    isLoading,
    isError,
  } = useGetResourcePoolsQuery({});

  const [currentSessionClass, setCurrentSessionClass] = useState<
    ResourceClass | undefined
  >(undefined);

  const onChange = useCallback((newValue: SingleValue<ResourceClass>) => {
    if (newValue) {
      setCurrentSessionClass(newValue);
    }
  }, []);

  const onClick = useCallback(
    ({ resumeSession }: { resumeSession: boolean }) => {
      return function modifySession() {
        if (!currentSessionClass) {
          return;
        }
        onModifySession(currentSessionClass.id, resumeSession);
        toggleModal();
      };
    },
    [currentSessionClass, onModifySession, toggleModal]
  );

  useEffect(() => {
    const currentSessionClass = resourcePools
      ?.flatMap((pool) => pool.classes)
      .find((c) => c.id === currentSessionClassId);
    setCurrentSessionClass(currentSessionClass);
  }, [currentSessionClassId, resourcePools]);

  const message =
    status === "failed" ? (
      <>
        <WarnAlert dismissible={false}>
          This session cannot be started or resumed at the moment.
        </WarnAlert>
        <p>
          You can try to modify the session class and attempt to resume the
          session.
        </p>
      </>
    ) : (
      <p>You can modify the session class before resuming this session.</p>
    );

  const selector = isLoading ? (
    <FetchingResourcePools />
  ) : !resourcePools || resourcePools.length == 0 || isError ? (
    <ErrorOrNotAvailableResourcePools />
  ) : (
    <SessionClassSelector
      resourcePools={resourcePools}
      currentSessionClass={currentSessionClass}
      onChange={onChange}
    />
  );

  return (
    <>
      <ModalBody>
        <Row>
          <Col>
            {message}
            <p>
              <span className={cx("fw-bold", "me-3")}>Current resources:</span>
              <span>
                <SessionRowResourceRequests
                  resourceRequests={resources.requests}
                />
              </span>
            </p>
            <div className="field-group">{selector}</div>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        {status === "hibernated" && (
          <Button
            disabled={
              isLoading ||
              !resourcePools ||
              resourcePools.length == 0 ||
              isError ||
              currentSessionClass == null ||
              (currentSessionClassId != null &&
                currentSessionClassId === currentSessionClass?.id)
            }
            onClick={onClick({ resumeSession: true })}
            type="submit"
          >
            <FontAwesomeIcon icon={faPlay} /> Modify and resume session
          </Button>
        )}
        <Button
          className={cx(status === "hibernated" && "btn-outline-rk-green")}
          disabled={
            isLoading ||
            !resourcePools ||
            resourcePools.length == 0 ||
            isError ||
            currentSessionClass == null ||
            (currentSessionClassId != null &&
              currentSessionClassId === currentSessionClass?.id)
          }
          onClick={onClick({ resumeSession: false })}
          type="submit"
        >
          <CheckLg className={cx("bi", "me-1")} />
          Modify session
        </Button>
        <Button className="btn-outline-rk-green" onClick={toggleModal}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
      </ModalFooter>
    </>
  );
}

function addErrorNotification({
  error,
  notifications,
  title,
}: {
  error: FetchBaseQueryError | SerializedError;
  notifications: NotificationsManager;
  title: string;
}) {
  const message =
    "message" in error && error.message != null
      ? error.message
      : "error" in error && error.error != null
      ? error.error
      : "Unknown error";
  notifications.addError(
    NOTIFICATION_TOPICS.SESSION_START,
    title,
    undefined,
    undefined,
    undefined,
    `Error message: "${message}"`
  );
}
