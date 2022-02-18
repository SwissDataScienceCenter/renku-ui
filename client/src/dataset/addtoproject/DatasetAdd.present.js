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


import React, { useContext, useState } from "react";
import _ from "lodash";
import { Row, Col } from "reactstrap";
import { Button } from "reactstrap";
import { ButtonGroup, Table } from "reactstrap/lib";

import { getDatasetAuthors } from "../DatasetFunctions";
import { AddDatasetExistingProject } from "./addDatasetExistingProject";
import { DatasetError } from "../DatasetError";
import { Loader } from "../../utils/components/Loader";
import { AddDatasetNewProject } from "./addDatasetNewProject";
import { AddDatasetContext } from "./DatasetAdd.container";

function HeaderAddDataset(props) {
  const { dataset } = props;
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

function DatasetAdd(props) {
  const datasetContext = useContext(AddDatasetContext);
  const [isNewProject, setIsNewProject] = useState(false);
  const buttonGroup = (
    <ButtonGroup className="d-flex">
      <Button disabled={datasetContext.currentStatus?.status === "inProcess"}
        color="primary" outline active={!isNewProject} onClick={(e) => setIsNewProject(false)}>
        Existing Project
      </Button>
      <Button disabled={datasetContext.currentStatus?.status === "inProcess"}
        color="primary" outline active={isNewProject} onClick={(e) => setIsNewProject(true)}>
        New Project
      </Button>
    </ButtonGroup>
  );
  const formToDisplay = !isNewProject ?
    (<AddDatasetExistingProject
      dataset={props.dataset}
      validateProject={props.validateProject}
    />) : <AddDatasetNewProject
      dataset={props.dataset}/>;

  if (!props.dataset) return <Loader />;
  if (!props.dataset?.exists) {
    if (!_.isEmpty(props.dataset?.fetchError)) {
      return (
        <DatasetError
          fetchError={props.dataset?.fetchError}
          insideProject={props.insideProject}
          location={datasetContext.location}
          logged={props.logged} />
      );
    }
  }
  return (
    <>
      <Row className="mb-3">
        <Col sm={10} md={9} lg={8} xl={7}>
          <HeaderAddDataset dataset={props.dataset} />
          { buttonGroup }
          { formToDisplay }
        </Col>
      </Row>
    </>
  );
}

export default DatasetAdd;
