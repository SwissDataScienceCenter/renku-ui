/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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
 *  incubator-renku-ui
 *
 *  DatasetNew.container.js
 *  Container components for new dataset.
 */

import React, { useState, useRef, useEffect } from "react";
import { datasetFormSchema } from "../../../model/RenkuModels";
import DatasetNew from "./DatasetNew.present";

function NewDataset(props) {


  const [serverErrors, setServerErrors] = useState(undefined);
  const [submitLoader, setSubmitLoader] = useState(false);
  datasetFormSchema.files.uploadFileFunction = props.client.uploadFile;
  datasetFormSchema.files.filesOnUploader = useRef(0);

  const onCancel = e => {
    props.history.push({ pathname: `/projects/${props.projectPathWithNamespace}/datasets` });
  };

  const submitCallback = e => {
    setServerErrors(undefined);
    setSubmitLoader(true);
    const dataset = {};
    dataset.name = datasetFormSchema.name.value;
    dataset.description = datasetFormSchema.description.value;
    dataset.files = datasetFormSchema.files.value.map(f => ({ "file_id": f.file_id }));

    props.client.postDataset(props.httpProjectUrl, dataset)
      .then(dataset => {
        if (dataset.data.error !== undefined) {
          setSubmitLoader(false);
          setServerErrors(dataset.data.error.reason);
        }
        else {
          let waitForDatasetInKG = setInterval(() => {
            props.client.getProjectDatasetsFromKG(props.projectPathWithNamespace)
              .then(datasets => {
                // eslint-disable-next-line
            let new_dataset = datasets.find( ds => ds.name === dataset.data.result.dataset_name);
                if (new_dataset !== undefined) {
                  setSubmitLoader(false);
                  clearInterval(waitForDatasetInKG);
                  props.history.push({
                    pathname: `/projects/${props.projectPathWithNamespace}/datasets/${new_dataset.identifier}/`,
                    state: { datasets: datasets }
                  });
                }
              });
          }, 6000);
        }
      });
  };

  useEffect(()=>{
    return () => {
      datasetFormSchema.name.value = datasetFormSchema.name.initial;
      datasetFormSchema.description.value = datasetFormSchema.description.initial;
      datasetFormSchema.files.value = datasetFormSchema.files.initial;
    };
  }, []);

  return <DatasetNew
    datasetFormSchema={datasetFormSchema}
    accessLevel={props.accessLevel}
    serverErrors={serverErrors}
    submitCallback={submitCallback}
    submitLoader={submitLoader}
    onCancel={onCancel}
  />;
}


export default NewDataset;
