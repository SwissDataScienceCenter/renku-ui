/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  DeleteDataset.present.js
 *  Presentational components.
 */

import React from "react";
import {
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  FormText,
} from "reactstrap";

import { CoreErrorAlert } from "../../../components/errors/CoreErrorAlert";
import { Loader } from "../../../components/Loader";

function ModalContent({
  closeModal,
  dataset,
  deleteDataset,
  serverErrors,
  submitLoader,
}) {
  if (serverErrors) {
    return (
      <Col>
        <CoreErrorAlert error={serverErrors} />
      </Col>
    );
  }

  if (submitLoader != null && submitLoader.value) {
    return (
      <div className="d-flex flex-row-reverse">
        <FormText color="primary">
          <Loader size={16} inline margin={2} />
          {submitLoader.text}
          <br />
        </FormText>
      </div>
    );
  }

  return (
    <Col>
      <p>
        Are you sure you want to delete dataset <strong>{dataset.name}</strong>?
      </p>
      <div className="d-flex flex-row-reverse">
        <Button
          type="submit"
          onClick={deleteDataset}
          disabled={submitLoader.value}
          className="mt-1 btn-rk-pink"
        >
          Delete dataset
        </Button>
        <Button
          disabled={submitLoader.value}
          className="mt-1 me-2 btn-outline-rk-pink"
          onClick={closeModal}
        >
          Cancel
        </Button>
        {submitLoader != null && submitLoader.value && (
          <FormText color="primary">
            <Loader size={16} inline margin={2} />
            {submitLoader.text}
            <br />
          </FormText>
        )}
      </div>
    </Col>
  );
}

function DeleteDatasetPresent(props) {
  return (
    <Modal isOpen={props.modalOpen} toggle={props.closeModal}>
      <ModalHeader toggle={props.closeModal}>Delete Dataset</ModalHeader>
      <ModalBody>
        <Row className="mb-3">
          <ModalContent {...props} />
        </Row>
      </ModalBody>
    </Modal>
  );
}

export default DeleteDatasetPresent;
