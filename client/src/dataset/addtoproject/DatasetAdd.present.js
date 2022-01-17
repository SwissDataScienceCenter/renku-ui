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
 *  DatasetAdd.present.js
 *  Presentational components.
 */


import React from "react";
import { Row, Col, Modal, ModalHeader, ModalBody } from "reactstrap";
import { FormGenerator } from "../../utils/components/formgenerator";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

function DatasetAdd(props) {

  const formatServerErrorsAndWarnings = (errorOrWarning, isError)=>{
    const selectedProjectName = errorOrWarning;
    if (!isError) {
      return <div>
        <FontAwesomeIcon icon={faExclamationTriangle} /> <strong>A new version of renku is available.</strong>
        <br />
        The target project ({selectedProjectName}) needs to be upgraded to allow
        modification of datasets and is recommended for all projects.
        <br />
        <Button color="warning" onClick={() =>
          props.history.push(`/projects/${selectedProjectName}/overview/status`)}>More Info</Button>
      </div>;
    }
    return errorOrWarning;
  };


  return (
    <Modal
      isOpen={props.modalOpen}
      toggle={props.closeModal}
    >
      <ModalHeader toggle={props.closeModal}>
        Add dataset to project
      </ModalHeader>
      <ModalBody>
        <Row className="mb-3">
          <Col>
            <FormGenerator
              btnName={"Add Dataset"}
              submitCallback={!props.takingTooLong ? props.submitCallback : undefined}
              model={props.addDatasetToProjectSchema}
              onCancel={props.onCancel}
              formLocation={props.formLocation}
              modelTop={props.model}
              initializeFunction={props.initializeFunction}
              formatServerErrorsAndWarnings={formatServerErrorsAndWarnings}
            />
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
}

export default DatasetAdd;
