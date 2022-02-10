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


import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

import { Loader } from "../../utils/components/Loader";
import SelectAutosuggestInput from "../../utils/components/SelectAutosuggestInput";
import { ButtonGroup, Table } from "reactstrap/lib";
import { getDatasetAuthors } from "../DatasetFunctions";

function HeaderAddDataset(dataset) {
  if (!dataset) return null;
  const authors = getDatasetAuthors(dataset);
  return (
    <>
      <h2>Add dataset to project</h2>
      {/* eslint-disable-next-line */}
      <Table className="mb-4 table-borderless" size="sm">
        <tbody className="text-rk-text">
          <tr>
            <td className="text-dark fw-bold" style={{ "width": "120px" }}>Title:</td>
            <td>{ dataset?.title || dataset?.name }</td>
          </tr>
          <tr>
            <td className="text-dark fw-bold" style={{ "width": "120px" }}>Authors:</td>
            <td>{ authors }</td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}

function ImportDatasetStatus(status, text, existingProject) {
  let statusProject = null;
  switch (status) {
    case "errorNeedMigration" :
      statusProject = (
        <div>
          <FontAwesomeIcon icon={faExclamationTriangle} /> <strong>This project must be upgraded.</strong>
          <br />
          The target project ({existingProject}) needs to be upgraded before datasets can be imported into it.
          <br />
          <i className="pt-2"><Link to={`/projects/${existingProject}/overview/status`}>More info</Link></i>
        </div>
      );
      break;
    case "error" :
      statusProject = <div><FontAwesomeIcon icon={faExclamationTriangle} /> {text}</div>;
      break;
    case "inProcess" :
      statusProject = <div><Loader size="14" inline="true" /> {text}</div>;
      break;
    case "validProject" :
      statusProject = <div><FontAwesomeIcon icon={faCheck} color={"var(--bs-success)"} /> {text}</div>;
      break;
    case "completed" :
      statusProject = <div><FontAwesomeIcon icon={faCheck} color={"var(--bs-success)"} /> {text}</div>;
      break;
    default:
      statusProject = null;
  }
  return statusProject;
}

function DatasetAdd(props) {
  const [existingProject, setExistingProject] = useState(null);
  const [isNewProject, setIsNewProject] = useState(false);

  useEffect( () => {
    props.customHandlers.onProjectSelected(existingProject);
  }, [existingProject]); // eslint-disable-line

  const setProjectValue = value => setExistingProject(value);
  const startImportDataset = () => props.submitCallback(existingProject);
  const onSubmit = (e) => e.preventDefault();
  let statusImportDataset = null;
  if (props.currentStatus) {
    statusImportDataset = ImportDatasetStatus(
      props.currentStatus.status, props.currentStatus?.text || null, existingProject?.name, props.history);
  }

  /* buttons */
  const addDatasetButton = (
    <div className="mt-4 d-flex justify-content-end">
      <Button
        color="primary"
        disabled={props.currentStatus?.status !== "validProject" || props.importingDataset}
        onClick={startImportDataset}>
        Add Dataset to existing Project
      </Button>
    </div>
  );

  const buttonGroup = (
    <ButtonGroup className="d-flex">
      <Button color="primary" outline active={!isNewProject} onClick={(e) => setIsNewProject(false)}>
        Existing Project
      </Button>
      <Button color="primary" outline active={isNewProject} onClick={(e) => setIsNewProject(true)}>
        New Project
      </Button>
    </ButtonGroup>
  );

  /* end buttons */

  let suggestionInput;
  if (props.isProjectsReady && props.isDatasetValid) {
    suggestionInput = (<SelectAutosuggestInput
      existingValue={existingProject?.name || null}
      name="project"
      label="Project"
      placeholder="Select a project..."
      customHandlers={props.customHandlers}
      setInputs={setProjectValue}
      options={props.options}
      disabled={props.importingDataset || props.currentStatus?.status === "inProcess"}
    />);
  }
  else if (props.isDatasetValid === null || props.isDatasetValid === false) {
    suggestionInput = null;
  }
  else {
    suggestionInput = <div><Loader size="14" inline="true" />{" "}Loading projects...</div>;
  }

  if (!props.dataset) return null;

  const formToDisplay = !isNewProject ?
    (
      <div className="mt-4">
        <form onSubmit={onSubmit} className={"mt-2"}>
          {suggestionInput}
          {statusImportDataset}
          {addDatasetButton}
        </form>
      </div>
    ) : null;

  const header = HeaderAddDataset(props.dataset);
  return (
    <>
      <Row className="mb-3">
        <Col sm={10} md={9} lg={8} xl={7}>
          { header }
          { buttonGroup }
          { formToDisplay }
        </Col>
      </Row>
    </>
  );
}

export default DatasetAdd;
