/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import React, { useCallback, useState } from "react";
import cx from "classnames";
import { RootStateOrAny, useSelector } from "react-redux";
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
import {
  usePatchSessionMutation,
  useStopSessionMutation,
} from "../sessions.api";

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
  const [stopSession] = useStopSessionMutation();

  const [isStopping, setIsStopping] = useState(false);

  const onStopSession = useCallback(async () => {
    stopSession({ serverName: sessionName });
    setIsStopping(true);
  }, [sessionName, stopSession]);

  return (
    <Modal className="modal-session" isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Delete Session</ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <p>Are you sure you want to delete this session?</p>
            {isStopping ? (
              <FormText color="primary">
                <Loader inline margin={2} size={16} />
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
  const [patchSession] = usePatchSessionMutation();

  const [isStopping, setIsStopping] = useState(false);

  const onHibernateSession = useCallback(async () => {
    patchSession({ sessionName, state: "hibernated" });
    setIsStopping(true);
  }, [patchSession, sessionName]);

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
                <Loader inline margin={2} size={16} />
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
