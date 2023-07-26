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

import React, { useCallback, useContext, useEffect, useState } from "react";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { RootStateOrAny, useSelector } from "react-redux";
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
import { Loader } from "../../../components/Loader";
import { User } from "../../../model/RenkuModels";
import { NOTIFICATION_TOPICS } from "../../../notifications/Notifications.constants";
import { NotificationsInterface } from "../../../notifications/notifications.types";
import AppContext from "../../../utils/context/appContext";
import { Url } from "../../../utils/helpers/url";
import {
  usePatchSessionMutation,
  useStopSessionMutation,
} from "../sessions.api";
import useWaitForSessionStatus from "../useWaitForSessionStatus.hook";

interface StopSessionModalProps {
  isOpen: boolean;
  sessionName: string;
  toggleModal: () => void;
}

export default function StopSessionModal({
  isOpen,
  sessionName,
  toggleModal,
}: StopSessionModalProps) {
  const logged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  if (!logged) {
    return (
      <AnonymousStopSessionModal
        isOpen={isOpen}
        sessionName={sessionName}
        toggleModal={toggleModal}
      />
    );
  }

  return (
    <HibernateSessionModal
      isOpen={isOpen}
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
  const pathWithNamespace = useSelector<RootStateOrAny, string>(
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

  const { notifications } = useContext(AppContext);

  useEffect(() => {
    if (error != null) {
      addErrorNotification({
        error,
        notifications: notifications as NotificationsInterface,
      });
    }
  }, [error, notifications]);

  if (isSuccess) {
    return <Redirect push to={sessionsListUrl} />;
  }

  return (
    <Modal className="modal-session" isOpen={isOpen} toggle={toggleModal}>
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
                data-cy="stop-session-modal-button"
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
  sessionName,
  toggleModal,
}: StopSessionModalProps) {
  const pathWithNamespace = useSelector<RootStateOrAny, string>(
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
        notifications: notifications as NotificationsInterface,
      });
    }
  }, [error, notifications]);

  if (isSuccess && !isWaiting) {
    return <Redirect push to={sessionsListUrl} />;
  }

  return (
    <Modal className="modal-session" isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Stop Session</ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <p>
              Are you sure you want to stop this session? The current state of
              the session (new and edited files) will be preserved while the
              session is stopped.
            </p>
            {isStopping ? (
              <FormText color="primary">
                <Loader className="me-1" inline size={16} />
                Stopping Session
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
                data-cy="stop-session-modal-button"
                disabled={isStopping}
                type="submit"
                onClick={onHibernateSession}
              >
                Stop Session
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
  notifications: NotificationsInterface;
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
