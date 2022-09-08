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

import React, { Fragment, useState } from "react";
import { Button, Col, FormText, Modal, ModalBody, ModalHeader, Row } from "../../utils/ts-wrappers";
import { Loader } from "../../utils/components/Loader";
import { Notebook } from "./Session";

interface StopSessionProps {
  stopNotebook: Function;
  closeModal: Function;
  isOpen: boolean;
  notebook: Notebook;
  urlList: any;
}
function StopSession({ stopNotebook, notebook, urlList, closeModal, isOpen }: StopSessionProps) {
  const [stopping, setStopping] = useState(false);

  const stop = async () => {
    setStopping(true);
    // ? no need to handle the error here since we use the notifications at container level
    const success = await stopNotebook(notebook.data.name, urlList);
    if (success !== false)
      return;
    setStopping(false);
  };

  return (
    <StopSessionModal stopSession={stop} stopping={stopping} closeModal={closeModal} isOpen={isOpen} />);
}

interface StopSessionModalProps {
  stopSession: Function;
  stopping: boolean;
  closeModal: Function;
  isOpen: boolean;
}
function StopSessionModal({ stopSession, stopping, closeModal, isOpen }: StopSessionModalProps) {
  const modalContent = <Col>
    <p>
      Are you sure you want to stop this session?
      Make sure to commit any changes you want to be saved for next time
      by running <code>renku save</code> or using Git.
    </p>
    <Fragment>
      { stopping ?
        <FormText color="primary">
          <Loader size="16" inline="true" margin="2" />
          Stopping Session
          <br />
        </FormText>
        : null
      }
      <div className="d-flex justify-content-end">
        <Button disabled={stopping} className="float-right mt-1 btn-outline-rk-green"
          onClick={closeModal}>
          Back to Session
        </Button>
        <Button type="submit" onClick={stopSession} data-cy="stop-session-modal-button"
          disabled={stopping} className="float-right mt-1  ms-2 btn-rk-green" >
          Stop Session
        </Button>
      </div>
    </Fragment>
  </Col>;

  return (
    <Modal className="modal-session" isOpen={isOpen} toggle={closeModal}>
      <ModalHeader toggle={closeModal}>
        Stop Session
      </ModalHeader>
      <ModalBody>
        <Row>
          {modalContent}
        </Row>
      </ModalBody>
    </Modal>
  );
}


export default StopSession;
