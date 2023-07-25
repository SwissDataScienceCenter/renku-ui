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

import React, { useState, useCallback, useEffect } from "react";
import { Button, Col, FormText, Modal, Row } from "reactstrap";
import { ModalBody, ModalHeader } from "reactstrap";
import {
  usePatchSessionMutation,
  useStopSessionMutation,
} from "../sessions.api";
import { Save } from "react-bootstrap-icons";
import cx from "classnames";
import { Loader } from "../../../components/Loader";

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
  const [stopSession] = useStopSessionMutation();
  const [patchSession] = usePatchSessionMutation();

  useEffect(() => {
    console.log({ patchSession });
  }, [patchSession]);

  const [isStopping, setIsStopping] = useState(false);

  const onStopSession = useCallback(async () => {
    stopSession({ serverName: sessionName });
    setIsStopping(true);
  }, [sessionName, stopSession]);

  return (
    <Modal className="modal-session" isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Stop Session</ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <p>
              Are you sure you want to stop this session? Make sure to commit
              any changes you want to be saved for next time (for example, by
              using the{" "}
              <b>
                <Save
                  className={cx("text-rk-dark", "align-middle")}
                  title="save"
                />{" "}
                (Save)
              </b>{" "}
              button).
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
                onClick={onStopSession}
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
