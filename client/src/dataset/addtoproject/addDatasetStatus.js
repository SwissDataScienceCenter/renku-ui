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

import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

import { ErrorAlert } from "../../utils/components/Alert";
import { Loader } from "../../utils/components/Loader";
import ProgressIndicator, { ProgressStyle, ProgressType } from "../../utils/components/progress/Progress";


/**
 *  incubator-renku-ui
 *
 *  AddDatasetStatus
 *  Component for displaying the status of adding a dataset
 */

function AddDatasetStatus(props) {
  const { status, text, projectName } = props;
  let statusProject = null;
  switch (status) {
    case "errorNeedMigration" :
      statusProject = (
        <div>
          <FontAwesomeIcon icon={faExclamationTriangle} /> <strong>This project must be upgraded.</strong>
          <br />
          The target project ({projectName}) needs to be upgraded before datasets can be imported into it.
          <br />
          <i className="pt-2"><Link to={`/projects/${projectName}/overview/status`}>More info</Link></i>
        </div>
      );
      break;
    case "error" :
      statusProject = (
        <ErrorAlert>
          <h3>Error</h3>
          <p className="mb-0">{text}</p>
        </ErrorAlert>
      );
      break;
    case "inProcess" :
      statusProject = <div><Loader size="14" inline="true" /> {text}</div>;
      break;
    case "importing" :
      statusProject = (
        <ProgressIndicator
          type={ProgressType.Indeterminate}
          style={ProgressStyle.Dark}
          title={"Importing Dataset..."}
          description="Project is being created, afterwards the data set will be imported into it."
          currentStatus={text}
          feedback="Once the process is completed, you will be redirected to the page of the imported dataset"
        />
      );
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
  return statusProject ?
    <div data-cy="import-dataset-status">{ statusProject }</div> : statusProject;
}

export { AddDatasetStatus };
