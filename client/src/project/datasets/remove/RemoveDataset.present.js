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
 *  RemoveDataset.present.js
 *  Presentational components.
 */


import React, { Fragment } from "react";
import { Row, Col, Modal, ModalHeader, ModalBody, Button, Alert, FormText } from "reactstrap";
import { Loader } from "../../../utils/UIComponents";

function RemoveDatasetPresent(props) {

  let modalContent = null;

  if (props.serverErrors) {
    let content;
    let error = props.serverErrors.error;
    if (typeof serverErrors == "string") {
      content = <pre className="text-wrap">{error}</pre>;
    }
    else {
      const errors = Object.keys(error).map(v => {
        const text = typeof error[v] == "string" ?
            `${v}: ${error[v]}` :
            `Error message: ${JSON.stringify(error[v])}`;
        return (<pre key={v} className="text-wrap">{text}</pre>);
      });
      if (errors.length === 1)
        content = (errors[0]);
      else
        content = error[0];
    }

    modalContent = <Col>
      <Alert color="danger">
        <p>Errors occurred while deleting this dataset</p>
        <p>{content}</p>
      </Alert>
    </Col>;
  }
  else {
    modalContent = <Col>
      <p>
        Are you sure you want to remove dataset <strong>{props.dataset.name}</strong>?
      </p>
      <Fragment>
        { props.submitLoader !== undefined && props.submitLoader.value ?
          <FormText color="primary">
            <Loader size="16" inline="true" margin="2" />
            {props.submitLoader.text}
          </FormText>
          : null
        }
        <Button type="submit" onClick={props.removeDataset}
          disabled={props.submitLoader.value} className="float-right mt-1" color="primary">
          Remove Dataset
        </Button>
        <Button disabled={props.submitLoader.value} className="float-right mt-1 mr-1"
          color="secondary" onClick={props.closeModal}>
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
      Remove Dataset
    </ModalHeader>
    <ModalBody>
      <Row className="mb-3">
        {modalContent}
      </Row>
    </ModalBody>
  </Modal>;
}

export default RemoveDatasetPresent;
