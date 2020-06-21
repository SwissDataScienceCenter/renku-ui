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
 *  DatasetEdit.present.js
 *  Presentational components.
 */


import React, { useState, useEffect, useRef } from "react";
import { Col, Alert, Button } from "reactstrap";
import { Link } from "react-router-dom";
import { FormPanel } from "../../../utils/formgenerator";
import { ACCESS_LEVELS } from "../../../api-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

function DatasetEdit(props) {

  const [serverErrors, setServerErrors] = useState(undefined);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [initalFiles, setInitialFiles] = useState([]);
  props.datasetFormSchema.files.filesOnUploader = useRef(0);

  // const getServerWarnings = () => {
  //   const tooLongText = "The Knowledge Graph has not finished updating.  The new files" +
  //   " will not be visible until this is complete, but you can continue to work freely within RenkuLab.";
  //   if (props.jobsStats.failed.length === 0 && props.jobsStats.inProgress.length === 0 && props.jobsStats.tooLong) {
  //     return <div>
  //       {tooLongText}
  //       <br/><br/>
  //       You can keep on working while this operation is running.
  //     </div>;
  //   }
  // };

  const tooLongText = "The Knowledge Graph has not finished updating.  The new files" +
    " will not be visible until this is complete, but you can continue to work freely within RenkuLab.";
  if (props.jobsStats.failed.length === 0 && props.jobsStats.inProgress.length === 0 && props.jobsStats.tooLong) {
    return <div>
      {tooLongText}
      <br /><br />
      You can keep on working while this operation is running.
    </div>;
  }

  const onCancel = e => {
    props.datasetFormSchema.title.value = props.datasetFormSchema.title.initial;
    props.datasetFormSchema.short_name.value = props.datasetFormSchema.short_name.initial;
    props.datasetFormSchema.description.value = props.datasetFormSchema.description.initial;
    props.datasetFormSchema.files.value = props.datasetFormSchema.files.initial;
    props.history.push({
      pathname: `/projects/${props.projectPathWithNamespace}/datasets/${props.dataset.identifier}/`
    });
  };

  const submitCallback = e => {
    setServerErrors(undefined);
    setSubmitLoader(true);
    const dataset = {};
    dataset.title = props.datasetFormSchema.title.value;
    dataset.short_name = props.datasetFormSchema.short_name.value;
    dataset.description = props.datasetFormSchema.description.value;
    dataset.files = [].concat.apply([], props.datasetFormSchema.files.value.map(f => f.file_id))
      .map(f => ({ "file_id": f }));

    props.client.addFilesToDataset(props.httpProjectUrl, dataset.short_name, dataset.files)
      .then(response => {
        if (response.data.error !== undefined) {
          setSubmitLoader(false);
          setServerErrors(response.data.error.reason);
        }
        else {
          let counter = 0;
          const waitForFilesInKG = setInterval(
            () => {
              props.client.fetchDatasetFromKG(props.client.baseUrl.replace(
                "api", "knowledge-graph/datasets/") + props.datasetId)
                .then(response => {
                  if (response.hasPart.length >= (dataset.files.length + initalFiles.length)) {
                    setSubmitLoader(false);
                    props.datasetFormSchema.title.value = props.datasetFormSchema.title.initial;
                    props.datasetFormSchema.short_name.value = props.datasetFormSchema.short_name.initial;
                    props.datasetFormSchema.description.value = props.datasetFormSchema.description.initial;
                    props.datasetFormSchema.files.value = props.datasetFormSchema.files.initial;
                    clearInterval(waitForFilesInKG);
                    props.history.push({
                      pathname: `/projects/${props.projectPathWithNamespace}/datasets/${props.datasetId}/`
                    });
                  }
                  else {
                    counter++;
                    if (counter > 20) {
                      clearInterval(waitForFilesInKG);
                      setSubmitLoader(false);
                      setServerErrors(" The knowledge graph update has not yet finished." +
                      " The files have been imported and should be visible in a short time");
                    }
                  }
                });
            }
            , 6000);
        }
      });
  };

  useEffect(() => {
    if (!initialized) {
      props.datasetFormSchema.files.uploadFileFunction = props.client.uploadFile;
      if (props.dataset === null) {
        props.client.fetchDatasetFromKG(props.client.baseUrl.replace(
          "api", "knowledge-graph/datasets/") + props.datasetId)
          .then((dataset) => {
            props.datasetFormSchema.title.value = dataset.name;
            props.datasetFormSchema.short_name.value = dataset.short_name;
            props.datasetFormSchema.description.value = dataset.description;
            props.datasetFormSchema.creators.value = dataset.published.creator;
            props.datasetFormSchema.files.value = dataset.hasPart;
            setInitialFiles(dataset.hasPart);
          });
      }
      else {
        props.datasetFormSchema.title.value = props.dataset.name;
        props.datasetFormSchema.short_name.value = props.dataset.short_name;
        props.datasetFormSchema.description.value = props.dataset.description;
        props.datasetFormSchema.creators.value = props.dataset.published.creator;
        props.datasetFormSchema.files.value = props.dataset.hasPart;
        setInitialFiles(props.dataset.hasPart);
      }
      setInitialized(true);
    }
  });

  const getServerWarnings = () =>{
    const failed = props.jobsStats.failed
      .map(job => <div key={"warn-" + job.file_url} className="pl-2">- {job.file_url}<br /></div>);
    const progress = props.jobsStats.inProgress
      .map(job => <div key={"warn-" + job.file_url} className="pl-2">- {job.file_url}<br /></div>);
    return <div>
      {props.jobsStats.tooLong ?
        <div>
          This operation is taking too long and it will continue being processed in the background.<br/>
          Please check the datasets list later to make sure that the new dataset is available. <br />
          You can also check the <Link to={props.overviewCommitsUrl}>commits list
          </Link> in the project to see if commits for the new dataset appear there.
          <br />
          <br />
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

  if (!props.initialized)
    return null;

  if (props.accessLevel < ACCESS_LEVELS.MAINTAINER) {
    return <Col sm={12} md={10} lg={8}>
      <Alert timeout={0} color="primary">
        Acces Denied. You don&apos;t have rights to edit datasets for this project.<br /><br />
        <FontAwesomeIcon icon={faInfoCircle} /> If you were recently given access to this project,
        you might need to <Button size="sm" color="primary"
          onClick={() => window.location.reload()}>refresh the page</Button> first.
      </Alert>
    </Col>;
  }

  const warning = props.warningOn.current ? getServerWarnings() : undefined;

  return <FormPanel
    title="Modify Dataset"
    btnName="Modify Dataset"
    submitCallback={props.warningOn.current ? undefined : props.submitCallback}
    model={props.datasetFormSchema}
    serverErrors={props.serverErrors}
    serverWarnings={warning}
    disableAll={props.warningOn.current === true}
    submitLoader={{ value: props.submitLoader, text: "Adding files to dataset, please wait..." }}
    onCancel={props.onCancel}
    cancelBtnName={props.warningOn.current ? "Go to dataset" : "Cancel"}
    edit={true} />;

}

export default DatasetEdit;
