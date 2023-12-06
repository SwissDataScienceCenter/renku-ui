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
import { Duration } from "luxon";
import { useCallback, useContext, useEffect, useState } from "react";
import { Redirect } from "react-router";
import {
  Button,
  Col,
  FormText,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";

import { InfoAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import { User } from "../../../model/RenkuModels";
import { NotebooksHelper } from "../../../notebooks";
import { NotebookAnnotations } from "../../../notebooks/components/session.types";
import { NOTIFICATION_TOPICS } from "../../../notifications/Notifications.constants";
import { NotificationsManager } from "../../../notifications/notifications.types";
import AppContext from "../../../utils/context/appContext";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { toHumanDuration } from "../../../utils/helpers/DurationUtils";
import { Url } from "../../../utils/helpers/url";
import {
  usePatchSessionMutation,
  useStopSessionMutation,
} from "../sessions.api";
import { Session } from "../sessions.types";
import useWaitForSessionStatus from "../useWaitForSessionStatus.hook";

import styles from "./SessionModals.module.scss";

interface StopSessionModalProps {
  isOpen: boolean;
  session: Session | undefined;
  sessionName: string;
  toggleModal: () => void;
}

export default function StopSessionModal({
  isOpen,
  session,
  sessionName,
  toggleModal,
}: StopSessionModalProps) {
  const logged = useLegacySelector<User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  if (!logged) {
    return (
      <AnonymousStopSessionModal
        isOpen={isOpen}
        session={session}
        sessionName={sessionName}
        toggleModal={toggleModal}
      />
    );
  }

  return (
    <HibernateSessionModal
      isOpen={isOpen}
      session={session}
      sessionName={sessionName}
      toggleModal={toggleModal}
    />
  );
}

function AnonymousStopSessionModal({
  isOpen,
  sessionName,
  toggleModal,
}: StopSessionModalProps) {
  const pathWithNamespace = useLegacySelector<string>(
    (state) => state.stateModel.project.metadata.pathWithNamespace
  );
  const sessionsListUrl = Url.get(Url.pages.project.session, {
    namespace: "",
    path: pathWithNamespace,
  });

  const [stopSession, { isSuccess, error }] = useStopSessionMutation();

  const [isStopping, setIsStopping] = useState(false);

  const onStopSession = useCallback(async () => {
    stopSession({ serverName: sessionName });
    setIsStopping(true);
  }, [sessionName, stopSession]);

  const { isWaiting } = useWaitForSessionStatus({
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

  if (isSuccess && !isWaiting) {
    return <Redirect push to={sessionsListUrl} />;
  }

  return (
    <Modal className={styles.sessionModal} isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Delete Session</ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <p>Are you sure you want to delete this session?</p>
            {isStopping ? (
              <FormText color="primary">
                <Loader className="me-1" inline size={16} />
                Deleting Session
                <br />
              </FormText>
            ) : null}
            <div className="d-flex justify-content-end">
              <Button
                className={cx("float-right", "mt-1", "btn-outline-rk-green")}
                disabled={isStopping}
                onClick={toggleModal}
              >
                Back to Session
              </Button>
              <Button
                className={cx("float-right", "mt-1", "ms-2", "btn-rk-green")}
                data-cy="delete-session-modal-button"
                disabled={isStopping}
                type="submit"
                onClick={onStopSession}
              >
                Delete Session
              </Button>
            </div>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
}

function HibernateSessionModal({
  isOpen,
  session,
  sessionName,
  toggleModal,
}: StopSessionModalProps) {
  const pathWithNamespace = useLegacySelector<string>(
    (state) => state.stateModel.project.metadata.pathWithNamespace
  );
  const sessionsListUrl = Url.get(Url.pages.project.session, {
    namespace: "",
    path: pathWithNamespace,
  });

  const [patchSession, { isSuccess, error }] = usePatchSessionMutation();

  const [isStopping, setIsStopping] = useState(false);

  const onHibernateSession = useCallback(async () => {
    patchSession({ sessionName, state: "hibernated" });
    setIsStopping(true);
  }, [patchSession, sessionName]);

  const { isWaiting } = useWaitForSessionStatus({
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

  if (isSuccess && !isWaiting) {
    return <Redirect push to={sessionsListUrl} />;
  }

  const annotations = session
    ? (NotebooksHelper.cleanAnnotations(
        session.annotations
      ) as NotebookAnnotations)
    : null;
  const hibernatedSecondsThreshold = parseInt(
    annotations?.hibernatedSecondsThreshold ?? "",
    10
  );
  const duration = isNaN(hibernatedSecondsThreshold)
    ? Duration.fromISO("")
    : Duration.fromObject({ seconds: hibernatedSecondsThreshold });
  const hibernationThreshold = duration.isValid
    ? toHumanDuration({ duration })
    : "a period";

  return (
    <Modal className={styles.sessionModal} isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Pause Session</ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <p>
              Are you sure you want to pause this session? The current state of
              the session (new and edited files) will be preserved while the
              session is paused.
            </p>
            {hibernatedSecondsThreshold > 0 && (
              <InfoAlert dismissible={false} timeout={0}>
                Please note that paused session are deleted after{" "}
                {hibernationThreshold} of inactivity.
              </InfoAlert>
            )}
            <div className="d-flex justify-content-end">
              <Button
                className={cx("float-right", "mt-1", "btn-outline-rk-green")}
                disabled={isStopping}
                onClick={toggleModal}
              >
                Back to Session
              </Button>
              <Button
                className={cx("float-right", "mt-1", "ms-2", "btn-rk-green")}
                data-cy="pause-session-modal-button"
                disabled={isStopping || session?.status.state === "starting"}
                type="submit"
                onClick={onHibernateSession}
              >
                {isStopping ? (
                  <>
                    <Loader className="me-2" inline size={16} />
                    Pausing session
                  </>
                ) : (
                  <>Pause Session</>
                )}
              </Button>
            </div>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
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
    "Unable to stop the current session",
    undefined,
    undefined,
    undefined,
    `Error message: "${message}"`
  );
}
