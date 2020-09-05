/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
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
 *  DatasetNew.present.js
 *  Presentational components.
 */


import React from "react";
import { Col, Alert, Button } from "reactstrap";
import { Link } from "react-router-dom";
import { FormPanel } from "../../../utils/formgenerator";
import { ACCESS_LEVELS } from "../../../api-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";


function DatasetNew(props) {

  const getServerWarnings = () => {
    const failed = props.jobsStats.failed
      .map(job => <div key={"warn-" + job.file_url} className="pl-2">- {job.file_url}<br /></div>);
    const progress = props.jobsStats.inProgress
      .map( job => <div key={"warn-" + job.file_url} className="pl-2">- {job.file_url}<br /></div>);
    return <div>
      {props.jobsStats.tooLong ?
        <div>
          This operation is taking too long and it will continue being processed in the background.<br />
          Please check the datasets list in a while to make sure that the changes are there. <br />
          You can also check the <Link to={props.overviewCommitsUrl}>commits list
          </Link> in the project and see if the new change was pushed.
          <br/><br/>
        </div>
        : null
      }
      {props.jobsStats.failed.length > 0 ?
        <div><strong>Some files had errors on upload:</strong>
          <br />
          {failed}
        </div>
        : null}
      {props.jobsStats.inProgress.length > 0 ?
        <div>
          <strong>Uploads in progress:</strong>
          <br />
          {progress}
        </div>
        : null}
      <br /><br />
    </div>;
  };

  if (props.accessLevel < ACCESS_LEVELS.MAINTAINER) {
    return <Col sm={12} md={10} lg={8}>
      <Alert timeout={0} color="primary">
        Acces Denied. You don&apos;t have rights to create datasets for this project.<br /><br />
        <FontAwesomeIcon icon={faInfoCircle} /> If you were recently given access to this project,
        you might need to <Button size="sm" color="primary"
          onClick={() => window.location.reload()}>refresh the page</Button> first.
      </Alert>
    </Col>;
  }

  const warning = props.warningOn.current ? getServerWarnings() : undefined;

  return <FormPanel
    btnName="Create Dataset"
    submitCallback={props.warningOn.current ? undefined : props.submitCallback}
    model={props.datasetFormSchema}
    serverErrors={props.serverErrors}
    serverWarnings={warning}
    disableAll={props.warningOn.current === true}
    cancelBtnName={props.warningOn.current ? "Go to list" : "Cancel"}
    submitLoader={{ value: props.submitLoader, text: "Creating dataset, please wait..." }}
    onCancel={props.onCancel}
  />;


}

export default DatasetNew;
