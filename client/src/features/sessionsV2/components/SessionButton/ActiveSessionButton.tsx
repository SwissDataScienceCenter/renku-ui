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

import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  BoxArrowUpRight,
  CheckLg,
  FileEarmarkText,
  PauseCircle,
  PlayFill,
  Plugin,
  Tools,
  Trash,
  XLg,
} from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom-v5-compat";
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

import { WarnAlert } from "../../../../components/Alert";
import { Loader } from "../../../../components/Loader";
import { EnvironmentLogs } from "../../../../components/Logs";
import { ButtonWithMenuV2 } from "../../../../components/buttons/Button";
import { User } from "../../../../model/renkuModels.types";
import { NotebooksHelper } from "../../../../notebooks";
import { NotebookAnnotations } from "../../../../notebooks/components/session.types";
import { NOTIFICATION_TOPICS } from "../../../../notifications/Notifications.constants";
import { NotificationsManager } from "../../../../notifications/notifications.types";
import AppContext from "../../../../utils/context/appContext";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { useGetResourcePoolsQuery } from "../../../dataServices/computeResources.api";
import { ResourceClass } from "../../../dataServices/dataServices.types";
import { toggleSessionLogsModal } from "../../../display/displaySlice";
import { SessionRowResourceRequests } from "../../../session/components/SessionsList";
import UnsavedWorkWarning from "../../../session/components/UnsavedWorkWarning";
import { SessionClassSelectorV2 } from "../../../session/components/options/SessionClassOption";
import {
  usePatchSessionMutation,
  useStopSessionMutation,
} from "../../../session/sessions.api";
import { Session, SessionStatusState } from "../../../session/sessions.types";
import useWaitForSessionStatus from "../../../session/useWaitForSessionStatus.hook";
import {
  ErrorOrNotAvailableResourcePools,
  FetchingResourcePools,
} from "../SessionModals/ResourceClassWarning";

interface ActiveSessionButtonProps {
  className?: string;
  session: Session;
  showSessionUrl: string;
}

export default function ActiveSessionButton({
  className,
  session,
  showSessionUrl,
}: ActiveSessionButtonProps) {
  const { notifications } = useContext(AppContext);

  const navigate = useNavigate();

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
  const cleanAnnotations = useMemo(
    () => NotebooksHelper.cleanAnnotations(annotations) as NotebookAnnotations,
    [annotations]
  );

  const displayModal = useAppSelector(
    ({ display }) => display.modals.sessionLogs
  );

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
      navigate(showSessionUrl);
    }
  }, [
    isSuccessResumeSession,
    isWaitingForResumedSession,
    navigate,
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
    "btn-icon-text",
    "start-session-button",
    "py-1",
    "px-2"
  );

  const defaultAction =
    status === "stopping" || isStopping ? (
      <Button color="primary" data-cy="stopping-btn" disabled>
        <Loader className="me-1" inline size={16} />
        Deleting
      </Button>
    ) : isHibernating ? (
      <Button color="primary" data-cy="stopping-btn" disabled>
        <Loader className="me-1" inline size={16} />
        Pausing
      </Button>
    ) : status === "starting" || status === "running" ? (
      <Link
        className={cx("btn", "btn-primary")}
        data-cy="open-session"
        to={showSessionUrl}
      >
        <Plugin className={cx("bi", "me-1")} />
        Open
      </Link>
    ) : status === "hibernated" ? (
      <Button
        color="primary"
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
    ) : failedScheduling ? (
      <Button
        color="primary"
        className={buttonClassName}
        data-cy="modify-session-button"
        onClick={toggleModifySession}
      >
        <Tools className={cx("bi", "me-1")} />
        Modify
      </Button>
    ) : (
      <Button
        color="primary"
        className={buttonClassName}
        data-cy={logged ? "pause-session-button" : "delete-session-button"}
        onClick={logged ? onHibernateSession : onStopSession}
      >
        {logged ? (
          <span className="align-self-start">
            <PauseCircle className={cx("bi", "me-1")} />
          </span>
        ) : (
          <Trash className={cx("bi", "me-1")} />
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
        <PauseCircle className={cx("bi", "me-1")} />
        Pause session
      </DropdownItem>
    );

  const deleteAction = status !== "stopping" && !isStopping && (
    <DropdownItem
      data-cy="delete-session-button"
      onClick={logged ? toggleStopSession : onStopSession}
    >
      <Trash className={cx("bi", "me-1")} />
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
        <Tools className={cx("bi", "me-1")} />
        Modify session resources
      </DropdownItem>
    );

  const openInNewTabAction = (status === "starting" ||
    status === "running") && (
    <DropdownItem href={session.url} target="_blank">
      <BoxArrowUpRight className={cx("bi", "me-1")} />
      Open in new tab
    </DropdownItem>
  );

  const logsAction = status !== "hibernated" && (
    <DropdownItem data-cy="session-log-button" onClick={onToggleLogs}>
      <FileEarmarkText className={cx("bi", "me-1")} />
      Get logs
    </DropdownItem>
  );

  return (
    <ButtonWithMenuV2
      className={cx(className)}
      color="primary"
      default={defaultAction}
      preventPropagation
      size="sm"
    >
      {hibernateAction}
      {deleteAction}
      {modifyAction}
      {(hibernateAction || deleteAction || modifyAction) &&
        (openInNewTabAction || logsAction) && <DropdownItem divider />}

      {openInNewTabAction}
      {logsAction}

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
      <EnvironmentLogs
        name={displayModal.targetServer}
        annotations={cleanAnnotations}
      />
    </ButtonWithMenuV2>
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
    <Modal size="lg" centered isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader className="text-danger" toggle={toggleModal}>
        Delete Session
      </ModalHeader>
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
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button
          color="outline-danger"
          disabled={isStopping}
          onClick={toggleModal}
        >
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="danger"
          data-cy="delete-session-modal-button"
          disabled={isStopping}
          type="submit"
          onClick={onClick}
        >
          <Trash className={cx("bi", "me-1")} /> Delete this session
        </Button>
      </ModalFooter>
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
      <ModalHeader toggle={toggleModal}>Modify Session Resources</ModalHeader>
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
    <SessionClassSelectorV2
      resourcePools={resourcePools}
      currentSessionClass={currentSessionClass}
      onChange={onChange}
    />
  );

  return (
    <>
      <ModalBody className="py-0">
        <Row>
          <Col>
            {message}
            <p>
              <span className="fw-bold me-3">Current resources:</span>
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
            <PlayFill className={cx("bi", "me-1")} />
            Modify and resume session
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
