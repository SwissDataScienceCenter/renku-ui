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


import React, { Fragment } from "react";
import { Row, Col, Modal, ModalHeader, ModalBody, Button, FormText } from "reactstrap";
import { ErrorAlert, Loader } from "../../../utils/UIComponents";

function DeleteDatasetPresent(props) {

  let modalContent = null;

  if (props.serverErrors) {
    modalContent = <Col>
      <ErrorAlert>
        <p>Errors occurred while deleting this dataset</p>
        <p><pre className="text-wrap">{props.serverErrors.error}</pre></p>
      </ErrorAlert>
    </Col>;
  }
  else {
    modalContent = <Col>
      <p>
        Are you sure you want to delete dataset <strong>{props.dataset.name}</strong>?
      </p>
      <Fragment>
        { props.submitLoader !== undefined && props.submitLoader.value ?
          <FormText color="primary">
            <Loader size="16" inline="true" margin="2" />
            {props.submitLoader.text}
            <br />
          </FormText>
          : null
        }
        <Button type="submit" onClick={props.deleteDataset}
          disabled={props.submitLoader.value} className="float-right mt-1" color="secondary">
          Delete dataset
        </Button>
        <Button disabled={props.submitLoader.value} className="float-right mt-1 ms-2"
          color="primary" onClick={props.closeModal}>
          Cancel
        </Button>
      </Fragment>
    </Col>;
  }

  return <Modal
    isOpen={props.modalOpen}
    toggle={props.closeModal}
  >
    <ModalHeader toggle={props.closeModal}>
      Delete Dataset
    </ModalHeader>
    <ModalBody>
      <Row className="mb-3">
        {modalContent}
      </Row>
    </ModalBody>
  </Modal>;
}

export default DeleteDatasetPresent;
