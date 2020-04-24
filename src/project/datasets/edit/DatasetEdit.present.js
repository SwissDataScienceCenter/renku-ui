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

  const onCancel = e => {
    props.datasetFormSchema.name.value = props.datasetFormSchema.name.initial;
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
    dataset.name = props.datasetFormSchema.name.value;
    dataset.description = props.datasetFormSchema.description.value;
    dataset.files = props.datasetFormSchema.files.value.map(f => ({ "file_id": f.file_id }));

    props.client.addFilesToDataset(props.httpProjectUrl, dataset.name, dataset.files)
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
                    props.datasetFormSchema.name.value = props.datasetFormSchema.name.initial;
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
            props.datasetFormSchema.name.value = dataset.name;
            props.datasetFormSchema.description.value = dataset.description;
            props.datasetFormSchema.files.value = dataset.hasPart;
            setInitialFiles(dataset.hasPart);
          });
      }
      else {
        props.datasetFormSchema.name.value = props.dataset.name;
        props.datasetFormSchema.description.value = props.dataset.description;
        props.datasetFormSchema.files.value = props.dataset.hasPart;
        setInitialFiles(props.dataset.hasPart);
      }
      setInitialized(true);
    }

  }, [props, initialized]);

  if (!initialized)
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

  return <FormPanel
    title="Modify Dataset"
    btnName="Modify Dataset"
    submitCallback={submitCallback}
    model={props.datasetFormSchema}
    serverErrors={serverErrors}
    submitLoader={{ value: submitLoader, text: "Adding files to dataset, please wait..." }}
    onCancel={onCancel}
    edit={true} />;

}

export default DatasetEdit;
