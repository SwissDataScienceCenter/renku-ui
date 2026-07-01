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

import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import {
  BoxArrowUpRight,
  CheckLg,
  FileEarmarkText,
  PauseCircle,
  PlayFill,
  Tools,
  Trash,
  XLg,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router";
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

import { WarnAlert } from "~/components/Alert";
import { ButtonWithMenuV2 } from "~/components/buttons/Button";
import useRenkuToast from "~/components/toast/useRenkuToast";
import SessionLogsModal from "~/features/logsDisplay/SessionLogsModal";
import StopJobContent from "~/features/sessionsV2/components/SessionModals/StopJobContent";
import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import { NOTIFICATION_TOPICS } from "~/notifications/Notifications.constants";
import {
  useGetResourcePoolsQuery,
  type ResourceClassWithId,
} from "../../api/computeResources.api";
import {
  usePatchSessionsBySessionIdMutation as usePatchSessionMutation,
  useDeleteSessionsBySessionIdMutation as useStopSessionMutation,
} from "../../api/sessionsV2.api";
import {
  getLauncherCategoryDefinition,
  sessionLauncherKindToCategory,
} from "../../session.utils";
import {
  LauncherCategory,
  SessionResources,
  SessionStatus,
  SessionStatusState,
  SessionV2,
} from "../../sessionsV2.types";
import { useWaitForSessionStatusV2 } from "../../useWaitForSessionStatus.hook";
import SessionClassSelector from "../SessionClassSelector";
import {
  ErrorOrNotAvailableResourcePools,
  FetchingResourcePools,
} from "../SessionModals/ResourceClassWarning";
import ShutdownSessionContent from "../SessionModals/ShoutdownSessionContent";
import { SessionRowResourceRequests } from "../SessionsList";
import {
  getInteractiveSessionDefaultAction,
  getJobDefaultAction,
} from "./ActiveSessionButton.actions";

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
  const { renkuToastDanger } = useRenkuToast();

  const navigate = useNavigate();

  const { data: user } = useGetUserQueryState();
  const isUserLoggedIn = !!user?.isLoggedIn;

  const [showLogsModal, setShowLogsModal] = useState<boolean>(false);
  const toggleLogsModal = useCallback(() => {
    setShowLogsModal((isOpen) => !isOpen);
  }, []);

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
    // TODO: fix react-hooks/set-state-in-effect

    setIsResuming(true);
  }, [resumeSession, session.name]);
  const { isWaiting: isWaitingForResumedSession } = useWaitForSessionStatusV2({
    desiredStatus: ["starting", "running"],
    sessionName: session.name,
    skip: !isResuming,
  });
  useEffect(() => {
    if (isResuming && isSuccessResumeSession && !isWaitingForResumedSession) {
      // TODO: fix react-hooks/set-state-in-effect
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsResuming(false);
      if (session.session_type === "interactive") navigate(showSessionUrl);
    }
  }, [
    isResuming,
    isSuccessResumeSession,
    isWaitingForResumedSession,
    navigate,
    showSessionUrl,
    session.session_type,
  ]);
  useEffect(() => {
    if (errorResumeSession) {
      renkuToastDanger({
        textHeader: NOTIFICATION_TOPICS.SESSION_START,
        textBody: "Unable to resume the session",
      });
      // TODO: fix react-hooks/set-state-in-effect
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsResuming(false);
    }
  }, [errorResumeSession, renkuToastDanger]);

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
      // TODO: fix react-hooks/set-state-in-effect
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsHibernating(false);
    }
  }, [isSuccessHibernateSession, isWaitingForHibernatedSession]);
  useEffect(() => {
    if (errorHibernateSession) {
      renkuToastDanger({
        textHeader: NOTIFICATION_TOPICS.SESSION_START,
        textBody: "Unable to pause the session",
      });
      // TODO: fix react-hooks/set-state-in-effect
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsHibernating(false);
    }
  }, [errorHibernateSession, renkuToastDanger]);

  // Handle deleting session
  const [stopSession, { error: errorStopSession }] = useStopSessionMutation();
  // Optimistically show a session as "stopping" when triggered from the UI
  const [isStopping, setIsStopping] = useState<boolean>(false);
  const onStopSession = useCallback(() => {
    stopSession({ sessionId: session.name });
    // TODO: fix react-hooks/set-state-in-effect

    setIsStopping(true);
  }, [session.name, stopSession]);
  useEffect(() => {
    if (errorStopSession) {
      renkuToastDanger({
        textHeader: NOTIFICATION_TOPICS.SESSION_START,
        textBody: "Unable to delete the session",
      });
      // TODO: fix react-hooks/set-state-in-effect
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsStopping(false);
    }
  }, [errorStopSession, renkuToastDanger]);
  // Modal for confirming session deletion
  const [showModalStopSession, setShowModalStopSession] = useState(false);
  const toggleStopSession = useCallback(
    () => setShowModalStopSession((show) => !show),
    [],
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
    [modifySession, onResumeSession, session.name, session.status.state],
  );
  useEffect(() => {
    if (errorModifySession) {
      renkuToastDanger({
        textHeader: NOTIFICATION_TOPICS.SESSION_START,
        textBody: "Unable to modify the session",
      });
    }
  }, [errorModifySession, renkuToastDanger]);
  // Modal for modifying a session (change the session class)
  const [showModalModifySession, setShowModalModifySession] = useState(false);
  const toggleModifySession = useCallback(
    () => setShowModalModifySession((show) => !show),
    [],
  );

  const status = session.status.state;
  const failedScheduling =
    status === "failed" &&
    (!!session.status.message?.includes(
      "The resource quota has been exceeded.",
    ) ||
      !!session.status.message?.includes(
        // TODO: fix spelling in notebooks
        // eslint-disable-next-line spellcheck/spell-checker
        "Your session cannot be scheduled due to insufficent resources.",
      ));

  const buttonClassName = cx(
    "btn",
    "btn-rk-green",
    "btn-icon-text",
    "start-session-button",
    "py-1",
    "px-2",
    "btn-outline-primary",
  );

  const launcherCategory = sessionLauncherKindToCategory(session.session_type);

  const actionContext = {
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
  };

  const defaultAction =
    launcherCategory === "session"
      ? getInteractiveSessionDefaultAction(actionContext)
      : launcherCategory === "job"
        ? getJobDefaultAction(actionContext)
        : null;

  const isRunning = status === "running" || status === "starting";

  const hibernateAction = status !== "stopping" &&
    (status !== "failed" || failedScheduling) &&
    status !== "hibernated" &&
    !isStopping &&
    !isHibernating &&
    isUserLoggedIn && (
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
      onClick={isUserLoggedIn ? toggleStopSession : onStopSession}
    >
      <Trash className={cx("bi", "me-1")} />
      Shut down session
    </DropdownItem>
  );

  const dismissAction = launcherCategory === "job" && (
    <DropdownItem
      data-cy="delete-session-button"
      onClick={isRunning ? toggleStopSession : onStopSession}
    >
      <Trash className={cx("bi", "me-1")} />
      {isRunning ? "Cancel" : "Dismiss"}
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
    <DropdownItem data-cy="session-log-button" onClick={toggleLogsModal}>
      <FileEarmarkText className={cx("bi", "me-1")} />
      View logs
    </DropdownItem>
  );

  return (
    <div className={cx("d-flex", "flex-row", "gap-2")}>
      <ButtonWithMenuV2
        className={cx(className)}
        color={launcherCategory === "job" ? "outline-primary" : "primary"}
        default={defaultAction}
        preventPropagation
        size="sm"
      >
        {launcherCategory === "job" ? (
          status === "succeeded" ? (
            logsAction
          ) : (
            dismissAction
          )
        ) : (
          <>
            {deleteAction}
            {modifyAction}
            {(hibernateAction || deleteAction || modifyAction) &&
              (openInNewTabAction || logsAction) && <DropdownItem divider />}

            {openInNewTabAction}
            {logsAction}
          </>
        )}
      </ButtonWithMenuV2>
      <ConfirmDeleteModal
        isOpen={showModalStopSession}
        isStopping={isStopping}
        onStopSession={onStopSession}
        sessionName={session.name}
        sessionProjectId={session.project_id}
        sessionLauncherId={session.launcher_id}
        status={status}
        toggleModal={toggleStopSession}
        launcherCategory={launcherCategory}
      />
      {launcherCategory === "session" && (
        <ModifySessionModal
          isOpen={showModalModifySession}
          onModifySession={onModifySession}
          resources={session.resources}
          status={session.status}
          toggleModal={toggleModifySession}
          resource_class_id={session.resource_class_id}
        />
      )}
      <SessionLogsModal
        isOpen={showLogsModal}
        sessionName={session.name}
        toggle={toggleLogsModal}
      />
    </div>
  );
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  isStopping: boolean;
  onStopSession: () => void;
  sessionName: string;
  sessionLauncherId?: string;
  sessionProjectId: string;
  status: SessionStatusState;
  toggleModal: () => void;
  launcherCategory: LauncherCategory;
}
function ConfirmDeleteModal({
  isOpen,
  isStopping,
  onStopSession,
  sessionLauncherId,
  sessionProjectId,
  status,
  toggleModal,
  launcherCategory,
}: ConfirmDeleteModalProps) {
  const onClick = useCallback(() => {
    onStopSession();
    toggleModal();
  }, [onStopSession, toggleModal]);

  const launcherDefinition = getLauncherCategoryDefinition(launcherCategory);

  return (
    <Modal size="lg" centered isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader className="text-danger" toggle={toggleModal} tag="h2">
        {launcherDefinition.text.delete.title}
      </ModalHeader>
      <ModalBody>
        {launcherCategory === "session" && (
          <ShutdownSessionContent
            sessionLauncherId={sessionLauncherId}
            sessionProjectId={sessionProjectId}
          />
        )}
        {launcherCategory === "job" && <StopJobContent status={status} />}
      </ModalBody>
      <ModalFooter>
        <Button
          color="outline-danger"
          disabled={isStopping}
          onClick={toggleModal}
        >
          <XLg className={cx("bi", "me-1")} />
          {launcherCategory === "job" ? "Close" : "Cancel"}
        </Button>
        <Button
          color="danger"
          data-cy="delete-session-modal-button"
          disabled={isStopping}
          type="submit"
          onClick={onClick}
        >
          <Trash className={cx("bi", "me-1")} />
          {launcherDefinition.text.delete.button}
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
    ResourceClassWithId | undefined
  >(undefined);

  const onChange = useCallback((newValue: SingleValue<ResourceClassWithId>) => {
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
    [currentSessionClass, onModifySession, toggleModal],
  );

  useEffect(() => {
    const currentSessionClass = resourcePools
      ?.flatMap((pool) => pool.classes)
      .find((c) => c.id == resource_class_id);
    // TODO: fix react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <SessionClassSelector
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
            <div className="mb-3">
              <span className={cx("fw-bold", "me-3")}>Current resources:</span>
              <span>
                <SessionRowResourceRequests
                  resourceRequests={resources?.requests}
                />
              </span>
            </div>
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
