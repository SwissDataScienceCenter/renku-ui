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
 *  incubator-renku-ui
 *
 *  RemoveDataset.container.js
 *  Container component for removing a dataset.
 */


import React, { useState } from "react";
import RemoveDatasetPresent from "./RemoveDataset.present";


function RemoveDataset(props) {

  const [serverErrors, setServerErrors] = useState(undefined);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [submitLoaderText, setSubmitLoaderText] = useState("Deleting dataset...");


  const closeModal = () =>{
    if (!submitLoader) {
      setServerErrors(undefined);
      props.setModalOpen(false);
    }
  };

  const removeDataset = () => {
    setServerErrors(undefined);
    setSubmitLoader(true);
    setSubmitLoaderText("Deleting dataset...");
    props.client.removeDataset(props.httpProjectUrl, props.dataset.name)
      .then(response => {
        if (response.data.error !== undefined) {
          setSubmitLoader(false);
          setServerErrors(response.data.error.reason);
        }
        else {
          setSubmitLoaderText("Dataset deleted, you will be redirected soon...");
          setSubmitLoader(false);
          props.history.push({
            pathname: `/projects/${props.projectPathWithNamespace}/datasets`,
            state: { reload: true }
          });
        }
      });
  };

  return (
    <RemoveDatasetPresent
      dataset={props.dataset}
      modalOpen={props.modalOpen}
      closeModal={closeModal}
      removeDataset={removeDataset}
      serverErrors={serverErrors}
      submitLoader={{ value: submitLoader, text: submitLoaderText }}
      history={props.history}
    />
  );
}

export default RemoveDataset;
