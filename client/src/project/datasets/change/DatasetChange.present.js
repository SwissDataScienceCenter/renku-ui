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
 *  DatasetChange.present.js
 *  Presentational components.
 */


import React from "react";
import { Link } from "react-router-dom";
import { Col, Alert, Button } from "reactstrap";
import { ACCESS_LEVELS } from "../../../api-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import FormGenerator from "../../../utils/components/formgenerator/FormGenerator.container";
import { Loader } from "../../../utils/components/Loader";
import FormSchema from "../../../utils/components/formschema/FormSchema";

function DatasetChange(props) {

  if (!props.initialized)
    return <Loader />;

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

  const formatServerErrorsAndWarnings = (errorOrWarning, isError) => {
    const jobsStats = errorOrWarning;
    if (!isError && (jobsStats.failed || jobsStats.inProgress || jobsStats.tooLong)) {
      const failed = jobsStats.failed
        .map(job => <div key={"warn-" + job.file_url} className="pl-2">- {job.file_url}<br /></div>);
      const progress = jobsStats.inProgress
        .map( job => <div key={"warn-" + job.file_url} className="pl-2">- {job.file_url}<br /></div>);
      return <div>
        {jobsStats.tooLong ?
          <div>
            This operation is taking too long and it will continue being processed in the background.<br />
            Please check the datasets list later to make sure that the changes are visible in the project. <br />
            You can also check the <Link to={props.overviewCommitsUrl}>commits list
            </Link> in the project to see if commits for the new dataset appear there.
            <br/><br/>
          </div>
          : null
        }
        {jobsStats.failed.length > 0 ?
          <div><strong>Some files had errors on upload:</strong>
            <br />
            {failed}
          </div>
          : null}
        {jobsStats.inProgress.length > 0 ?
          <div>
            <strong>Uploads in progress:</strong>
            <br />
            {progress}
          </div>
          : null}
        <br /><br />
      </div>;
    }
    //no need to format the error, just the warning
    return errorOrWarning;

  };

  const edit = props.edit;

  const form = <FormGenerator
    btnName={edit ? "Modify Dataset" : "Create Dataset"}
    edit={edit}
    formLocation={props.formLocation}
    formatServerErrorsAndWarnings={formatServerErrorsAndWarnings}
    initializeFunction={props.initializeFunction}
    model={props.datasetFormSchema}
    modelTop={props.model}
    onCancel={props.onCancel}
    submitCallback={props.submitCallback}
    title={edit ? "Modify Dataset" : undefined}
    versionUrl={props.versionUrl}
    toggleNewDataset={props.toggleNewDataset}
    showAddDatasetOptions={!edit}
    addDatasetOptionSelected={"addDataset"}
  />;

  const title = edit ? "Modify Dataset" : "Add Dataset";
  const desc = !edit ? (
    <span>
      Create a new dataset by providing metadata and content. Use&nbsp;
      <Button className="p-0" style={{ verticalAlign: "baseline" }} color="link" onClick={props.toggleNewDataset}>
        <small>Import Dataset</small>
      </Button>
      &nbsp;to reuse an existing dataset.
    </span>
  ) : "Update dataset metadata or upload dataset files";

  return (
    <FormSchema showHeader={true} title={title} description={desc}>
      {form}
    </FormSchema>
  );
}

export default DatasetChange;
