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

import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useContext, useEffect, useState } from "react";
import { generatePath, useNavigate, useParams } from "react-router";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { Loader } from "../../components/Loader";
import { User } from "../../model/renkuModels.types";
import { NOTIFICATION_TOPICS } from "../../notifications/Notifications.constants";
import { NotificationsManager } from "../../notifications/notifications.types";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import AppContext from "../../utils/context/appContext";
import useLegacySelector from "../../utils/customHooks/useLegacySelector.hook";
import { useWaitForSessionStatusV2 } from "../session/useWaitForSessionStatus.hook";
import {
  usePatchSessionsBySessionIdMutation as usePatchSessionMutation,
  useDeleteSessionsBySessionIdMutation as useStopSessionMutation,
} from "./api/sessionsV2.api";
import { SessionV2 } from "./sessionsV2.types";

import styles from "../session/components/SessionModals.module.scss";

interface PauseOrDeleteSessionModalProps {
  action?: "pause" | "delete";
  isOpen: boolean;
  session: SessionV2 | undefined;
  sessionName: string;
  toggleAction: () => void;
  toggleModal: () => void;
}

export default function PauseOrDeleteSessionModal({
  action,
  isOpen,
  session,
  sessionName,
  toggleAction,
  toggleModal,
}: PauseOrDeleteSessionModalProps) {
  const logged = useLegacySelector<User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  if (!logged) {
    return (
      <AnonymousDeleteSessionModal
        isOpen={isOpen}
        sessionName={sessionName}
        toggleModal={toggleModal}
      />
    );
  }

  return (
    <LoggedPauseOrDeleteSessionModal
      action={action}
      isOpen={isOpen}
      session={session}
      sessionName={sessionName}
      toggleAction={toggleAction}
      toggleModal={toggleModal}
    />
  );
}

type AnonymousDeleteSessionModalProps = Pick<
  PauseOrDeleteSessionModalProps,
  "isOpen" | "sessionName" | "toggleModal"
>;
function AnonymousDeleteSessionModal({
  isOpen,
  sessionName,
  toggleModal,
}: AnonymousDeleteSessionModalProps) {
  const { namespace, slug } = useParams<{ namespace: string; slug: string }>();

  const navigate = useNavigate();

  const backUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: namespace ?? "",
    slug: slug ?? "",
  });

  const [stopSession, { isSuccess, error }] = useStopSessionMutation();

  const [isStopping, setIsStopping] = useState(false);

  const onStopSession = useCallback(async () => {
    stopSession({ sessionId: sessionName });
    setIsStopping(true);
  }, [sessionName, stopSession]);

  const { isWaiting } = useWaitForSessionStatusV2({
    desiredStatus: "stopping",
    sessionName,
    skip: !isStopping,
  });

  const { notifications } = useContext(AppContext);

  useEffect(() => {
    if (error != null) {
      addErrorNotification({
        error,
        notifications: notifications as NotificationsManager,
      });
    }
  }, [error, notifications]);

  useEffect(() => {
    if (isStopping && isSuccess && !isWaiting) {
      setIsStopping(false);
      console.log("navigate", [isStopping, backUrl, isSuccess, isWaiting]);
      navigate(backUrl);
    }
  }, [isStopping, backUrl, isSuccess, isWaiting, navigate]);

  return (
    <Modal className={styles.sessionModal} isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Shut Down Session</ModalHeader>
      <ModalBody>
        <p>Are you sure you want to shut down this session?</p>
      </ModalBody>
      <ModalFooter>
        <Button
          color="outline-danger"
          disabled={isStopping}
          onClick={toggleModal}
        >
          Back to Session
        </Button>
        <Button
          color="danger"
          data-cy="delete-session-modal-button"
          disabled={isStopping}
          type="submit"
          onClick={onStopSession}
        >
          {isStopping ? (
            <>
              <Loader className="me-1" inline size={16} />
              Shutting down session
            </>
          ) : (
            <>Shut down session</>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function LoggedPauseOrDeleteSessionModal({
  action = "pause",
  isOpen,
  session,
  sessionName,
  toggleAction,
  toggleModal,
}: PauseOrDeleteSessionModalProps) {
  return (
    <Modal className={styles.sessionModal} isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>
        {action === "pause" ? "Pause Session" : "Shut Down Session"}
      </ModalHeader>
      {action === "pause" ? (
        <PauseSessionModalContent
          session={session}
          sessionName={sessionName}
          toggleAction={toggleAction}
          toggleModal={toggleModal}
        />
      ) : (
        <DeleteSessionModalContent
          session={session}
          sessionName={sessionName}
          toggleAction={toggleAction}
          toggleModal={toggleModal}
        />
      )}
    </Modal>
  );
}

type ModalContentProps = Omit<
  PauseOrDeleteSessionModalProps,
  "action" | "isOpen"
>;

function PauseSessionModalContent({
  session,
  sessionName,
  toggleAction,
  toggleModal,
}: ModalContentProps) {
  const { namespace, slug } = useParams<{ namespace: string; slug: string }>();

  const navigate = useNavigate();

  const backUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: namespace ?? "",
    slug: slug ?? "",
  });

  const [patchSession, { isSuccess, error }] = usePatchSessionMutation();

  const [isStopping, setIsStopping] = useState(false);

  const onHibernateSession = useCallback(async () => {
    patchSession({
      sessionId: sessionName,
      sessionPatchRequest: { state: "hibernated" },
    });
    setIsStopping(true);
  }, [patchSession, sessionName]);

  const { isWaiting } = useWaitForSessionStatusV2({
    desiredStatus: "hibernated",
    sessionName,
    skip: !isStopping,
  });

  const { notifications } = useContext(AppContext);

  useEffect(() => {
    if (error != null) {
      addErrorNotification({
        error,
        notifications: notifications as NotificationsManager,
      });
    }
  }, [error, notifications]);

  useEffect(() => {
    if (isStopping && isSuccess && !isWaiting) {
      setIsStopping(false);
      console.log("navigate", [isStopping, backUrl, isSuccess, isWaiting]);
      navigate(backUrl);
    }
  }, [isStopping, backUrl, isSuccess, isWaiting, navigate]);

  // TODO: Uncomment when hibernatedSecondsThreshold is available
  // const now = DateTime.utc();
  // const hibernationThreshold = session?.status?.hibernatedSecondsThreshold
  //   ? toHumanRelativeDuration({
  //       datetime: session?.status?.hibernatedSecondsThreshold,
  //       now,
  //     })
  //   : 0;
  return (
    <>
      <ModalBody>
        <p>
          Are you sure you want to pause this session? The current state of the
          session (new and edited files) will be preserved while the session is
          paused.
        </p>
        {/* TODO: Uncomment when hibernatedSecondsThreshold is available
          { hibernationThreshold > 0 && (
            <InfoAlert dismissible={false} timeout={0}>
              Please note that paused sessions are deleted after{" "}
              {hibernationThreshold} of inactivity.
            </InfoAlert>
          )} */}
        <div className="my-2">
          <Button
            className={cx("float-right", "p-0")}
            color="link"
            disabled={isStopping}
            onClick={toggleAction}
          >
            Delete session instead?
          </Button>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color="outline-primary"
          disabled={isStopping}
          onClick={toggleModal}
        >
          Back to Session
        </Button>
        <Button
          color="primary"
          data-cy="pause-session-modal-button"
          disabled={isStopping || session?.status.state === "starting"}
          type="submit"
          onClick={onHibernateSession}
        >
          {isStopping ? (
            <>
              <Loader className="me-1" inline size={16} />
              Pausing session
            </>
          ) : (
            <>Pause Session</>
          )}
        </Button>
      </ModalFooter>
    </>
  );
}

function DeleteSessionModalContent({
  sessionName,
  toggleAction,
  toggleModal,
}: ModalContentProps) {
  const { namespace, slug } = useParams<{ namespace: string; slug: string }>();

  const navigate = useNavigate();

  const backUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: namespace ?? "",
    slug: slug ?? "",
  });

  const [stopSession, { isSuccess, error }] = useStopSessionMutation();

  const [isStopping, setIsStopping] = useState(false);

  const onStopSession = useCallback(async () => {
    stopSession({ sessionId: sessionName });
    setIsStopping(true);
  }, [sessionName, stopSession]);

  const { isWaiting } = useWaitForSessionStatusV2({
    desiredStatus: "stopping",
    sessionName,
    skip: !isStopping,
  });

  const { notifications } = useContext(AppContext);

  useEffect(() => {
    if (error != null) {
      addErrorNotification({
        error,
        notifications: notifications as NotificationsManager,
      });
    }
  }, [error, notifications]);

  useEffect(() => {
    if (isStopping && isSuccess && !isWaiting) {
      setIsStopping(false);
      console.log("navigate", [isStopping, backUrl, isSuccess, isWaiting]);
      navigate(backUrl);
    }
  }, [isStopping, backUrl, isSuccess, isWaiting, navigate]);

  return (
    <>
      <ModalBody>
        <p>Are you sure you want to shut down this session?</p>
        <p className="fw-bold">
          Shutting down a session will permanently remove any unsaved work.
        </p>
        <div className="my-2">
          <Button
            className={cx("float-right", "p-0")}
            color="link"
            disabled={isStopping}
            onClick={toggleAction}
          >
            Pause session instead?
          </Button>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color="outline-danger"
          disabled={isStopping}
          onClick={toggleModal}
        >
          Back to Session
        </Button>
        <Button
          color="danger"
          data-cy="delete-session-modal-button"
          disabled={isStopping}
          type="submit"
          onClick={onStopSession}
        >
          {isStopping ? (
            <>
              <Loader className="me-1" inline size={16} />
              Shutting down session
            </>
          ) : (
            <>Shut down session</>
          )}
        </Button>
      </ModalFooter>
    </>
  );
}

function addErrorNotification({
  error,
  notifications,
}: {
  error: FetchBaseQueryError | SerializedError;
  notifications: NotificationsManager;
}) {
  const message =
    "message" in error && error.message != null
      ? error.message
      : "error" in error && error.error != null
      ? error.error
      : "Unknown error";
  notifications.addError(
    NOTIFICATION_TOPICS.SESSION_START,
    "Unable to delete the current session",
    undefined,
    undefined,
    undefined,
    `Error message: "${message}"`
  );
}
