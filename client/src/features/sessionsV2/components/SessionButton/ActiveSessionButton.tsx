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
import { useCallback, useContext, useEffect, useState } from "react";
import {
  ArrowRightCircle,
  BoxArrowUpRight,
  CheckLg,
  FileEarmarkText,
  PauseCircle,
  PlayFill,
  Tools,
  Trash,
  XLg,
} from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router";
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
import { ButtonWithMenuV2 } from "../../../../components/buttons/Button";
import { User } from "../../../../model/renkuModels.types";
import { NOTIFICATION_TOPICS } from "../../../../notifications/Notifications.constants";
import { NotificationsManager } from "../../../../notifications/notifications.types";
import AppContext from "../../../../utils/context/appContext";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { useGetResourcePoolsQuery } from "../../../dataServices/computeResources.api";
import { ResourceClass } from "../../../dataServices/dataServices.types";
import { toggleSessionLogsModal } from "../../../display/displaySlice";
import { SessionRowResourceRequests } from "../../../session/components/SessionsList";
import { SessionClassSelectorV2 } from "../../../session/components/options/SessionClassOption";
import { SessionStatusState } from "../../../session/sessions.types";
import { useWaitForSessionStatusV2 } from "../../../session/useWaitForSessionStatus.hook";
import {
  usePatchSessionsBySessionIdMutation as usePatchSessionMutation,
  useDeleteSessionsBySessionIdMutation as useStopSessionMutation,
} from "../../api/sessionsV2.api";
import {
  SessionResources,
  SessionStatus,
  SessionV2,
} from "../../sessionsV2.types";
import {
  ErrorOrNotAvailableResourcePools,
  FetchingResourcePools,
} from "../SessionModals/ResourceClassWarning";
import ShutdownSessionContent from "../SessionModals/ShoutdownSessionContent";

interface ActiveSessionButtonProps {
  className?: string;
  session: SessionV2;
  showSessionUrl: string;
  toggleSessionDetails?: () => void;
}

export default function ActiveSessionButton({
  session,
  showSessionUrl,
  className,
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

  // Handle resuming session
  const [isResuming, setIsResuming] = useState(false);
  const [
    resumeSession,
    { isSuccess: isSuccessResumeSession, error: errorResumeSession },
  ] = usePatchSessionMutation();
  const onResumeSession = useCallback(() => {
    resumeSession({
      sessionId: session.name,
      sessionPatchRequest: { state: "running" },
    });
    setIsResuming(true);
  }, [resumeSession, session.name]);
  const { isWaiting: isWaitingForResumedSession } = useWaitForSessionStatusV2({
    desiredStatus: ["starting", "running"],
    sessionName: session.name,
    skip: !isResuming,
  });
  useEffect(() => {
    if (isResuming && isSuccessResumeSession && !isWaitingForResumedSession) {
      setIsResuming(false);
      navigate(showSessionUrl);
      setIsResuming(false);
    }
  }, [
    isResuming,
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
    hibernateSession({
      sessionId: session.name,
      sessionPatchRequest: { state: "hibernated" },
    });
    setIsHibernating(true);
  }, [hibernateSession, session.name]);
  const { isWaiting: isWaitingForHibernatedSession } =
    useWaitForSessionStatusV2({
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
    stopSession({ sessionId: session.name });
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
        sessionId: session.name,
        sessionPatchRequest: { resource_class_id: sessionClass },
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
    "px-2",
    "btn-outline-primary"
  );

  const defaultAction =
    status === "stopping" || isStopping ? (
      <Button color="primary" data-cy="stopping-btn" disabled>
        <Loader className="me-1" inline size={16} />
        Shutting down
      </Button>
    ) : isHibernating ? (
      <Button color="primary" data-cy="stopping-btn" disabled>
        <Loader className="me-1" inline size={16} />
        Pausing
      </Button>
    ) : status === "starting" ? (
      <Link
        className={cx("btn", "btn-primary")}
        data-cy="open-session"
        to={showSessionUrl}
      >
        <ArrowRightCircle className={cx("bi", "me-1")} />
        Open
      </Link>
    ) : status === "running" ? (
      <>
        <Button
          color="outline-primary"
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
        <Link
          className={cx("btn", "btn-primary")}
          data-cy="open-session"
          to={showSessionUrl}
        >
          <ArrowRightCircle className={cx("bi", "me-1")} />
          Open
        </Link>
      </>
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
      <>
        <Button
          color="outline-primary"
          data-cy="show-logs-session-button"
          onClick={onToggleLogs}
        >
          <FileEarmarkText className={cx("bi", "me-1")} />
          Get logs
        </Button>
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
    ) : (
      <>
        <Button
          color="outline-primary"
          data-cy={"show-logs-session-button"}
          onClick={onToggleLogs}
        >
          <FileEarmarkText className={cx("bi", "me-1")} />
          Get logs
        </Button>
        <Button
          color="primary"
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
      </>
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
      Shut down session
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
    <div className={cx("d-flex", "flex-row", "gap-2")}>
      <ButtonWithMenuV2
        className={cx(className)}
        color={"primary"}
        default={defaultAction}
        preventPropagation
        size="sm"
      >
        {deleteAction}
        {modifyAction}
        {(hibernateAction || deleteAction || modifyAction) &&
          (openInNewTabAction || logsAction) && <DropdownItem divider />}

        {openInNewTabAction}
        {logsAction}
      </ButtonWithMenuV2>
      <ConfirmDeleteModal
        isOpen={showModalStopSession}
        isStopping={isStopping}
        onStopSession={onStopSession}
        sessionName={session.name}
        sessionProjectId={session.project_id}
        status={status}
        toggleModal={toggleStopSession}
      />
      <ModifySessionModal
        isOpen={showModalModifySession}
        onModifySession={onModifySession}
        resources={session.resources}
        status={session.status}
        toggleModal={toggleModifySession}
        resource_class_id={session.resource_class_id}
      />
    </div>
  );
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  isStopping: boolean;
  onStopSession: () => void;
  sessionName: string;
  sessionProjectId: string;
  status: SessionStatusState;
  toggleModal: () => void;
}
function ConfirmDeleteModal({
  isOpen,
  isStopping,
  onStopSession,
  sessionProjectId,
  toggleModal,
}: ConfirmDeleteModalProps) {
  const onClick = useCallback(() => {
    onStopSession();
    toggleModal();
  }, [onStopSession, toggleModal]);

  return (
    <Modal size="lg" centered isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader className="text-danger" toggle={toggleModal}>
        Shut Down Session
      </ModalHeader>
      <ModalBody>
        <ShutdownSessionContent sessionProjectId={sessionProjectId} />
      </ModalBody>
      <ModalFooter>
        <Button
          color="outline-primary"
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
          <Trash className={cx("bi", "me-1")} />
          Shut down session
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface ModifySessionModalProps {
  isOpen: boolean;
  onModifySession: (sessionClass: number, resumeSession: boolean) => void;
  resources: SessionResources;
  status: SessionStatus;
  toggleModal: () => void;
  resource_class_id: number;
}

function ModifySessionModal({
  isOpen,
  onModifySession,
  resources,
  status,
  toggleModal,
  resource_class_id,
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
        onModifySession={onModifySession}
        resources={resources}
        status={status}
        toggleModal={toggleModal}
        resource_class_id={resource_class_id}
      />
    </Modal>
  );
}

interface ModifySessionModalContentProps {
  onModifySession: (sessionClass: number, resumeSession: boolean) => void;
  resources: SessionResources;
  status: SessionStatus;
  toggleModal: () => void;
  resource_class_id: number;
}

function ModifySessionModalContent({
  onModifySession,
  resources,
  status,
  toggleModal,
  resource_class_id,
}: ModifySessionModalContentProps) {
  const { state } = status;

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
      .find((c) => c.id == resource_class_id);
    setCurrentSessionClass(currentSessionClass);
  }, [resource_class_id, resourcePools]);

  const message =
    state === "failed" ? (
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
              <span className={cx("fw-bold", "me-3")}>Current resources:</span>
              <span>
                <SessionRowResourceRequests
                  resourceRequests={resources?.requests}
                />
              </span>
            </p>
            <div className="field-group">{selector}</div>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        {state === "hibernated" && (
          <Button
            disabled={
              isLoading ||
              !resourcePools ||
              resourcePools.length == 0 ||
              isError ||
              currentSessionClass == null ||
              resource_class_id === currentSessionClass?.id
            }
            onClick={onClick({ resumeSession: true })}
            type="submit"
          >
            <PlayFill className={cx("bi", "me-1")} />
            Modify and resume session
          </Button>
        )}
        <Button
          className={cx(state === "hibernated" && "btn-outline-rk-green")}
          disabled={
            isLoading ||
            !resourcePools ||
            resourcePools.length == 0 ||
            isError ||
            currentSessionClass == null ||
            (resource_class_id != null &&
              resource_class_id === currentSessionClass?.id)
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
