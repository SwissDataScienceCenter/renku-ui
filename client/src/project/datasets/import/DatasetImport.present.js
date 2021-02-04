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
 *  DatasetImport.present.js
 *  Presentational components.
 */


import React from "react";
import { Col, Alert, Button } from "reactstrap";
import { FormGenerator } from "../../../utils/formgenerator";
import { ACCESS_LEVELS } from "../../../api-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

function DatasetImport(props) {

  if (props.accessLevel < ACCESS_LEVELS.MAINTAINER) {
    return <Col sm={12} md={10} lg={8}>
      <Alert timeout={0} color="primary">
        Acces Denied. You don&apos;t have rights to import datasets for this project.<br /><br />
        <FontAwesomeIcon icon={faInfoCircle} />  If you were recently given access to this project,
        you might need to <Button size="sm" color="primary" onClick={() => window.location.reload()}>
          refresh the page</Button> first.
      </Alert>
    </Col>;
  }

  return <FormGenerator
    btnName="Import Dataset"
    submitCallback={props.submitCallback}
    model={props.datasetImportFormSchema}
    onCancel={props.onCancel}
    formLocation={props.formLocation}
    notifications={props.notifications}
    model_top={props.model}
  />;

}

export default DatasetImport;
