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



import React, { useState } from 'react';
import { Row, Col, Alert } from 'reactstrap';
import { FormPanel } from '../../../utils/formgenerator';
import { ACCESS_LEVELS } from '../../../api-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';


function DatasetNew(props){

  const [serverErrors, setServerErrors] = useState(undefined);
  const [submitLoader, setSubmitLoader] = useState(false);

  const onCancel = e => {
    props.datasetFormSchema.name.value =  props.datasetFormSchema.name.initial;
    props.datasetFormSchema.description.value =  props.datasetFormSchema.description.initial;
    props.datasetFormSchema.files.value =  props.datasetFormSchema.files.initial;
    props.history.push({pathname: `/projects/${props.projectPathWithNamespace}/datasets`});
  }

  const submitCallback = e => {
    setServerErrors(undefined);
    setSubmitLoader(true);
    const dataset= {};
    dataset.name = props.datasetFormSchema.name.value;
    dataset.description = props.datasetFormSchema.description.value;
    dataset.files = props.datasetFormSchema.files.value.map((file)=> 
    {
      return { "file_id":file.file_id } 
    });
    
   props.client.postDataset(props.projectPathWithNamespace, dataset)
   .then(dataset => {
     if(dataset.data.error !== undefined) {
      setSubmitLoader(false);
      setServerErrors(dataset.data.error.reason);
     } else {
      setSubmitLoader(false);
      props.datasetFormSchema.name.value =  props.datasetFormSchema.name.initial;
      props.datasetFormSchema.description.value =  props.datasetFormSchema.description.initial;
      props.datasetFormSchema.files.value =  props.datasetFormSchema.files.initial;
      props.history.push({pathname: `/projects/${props.projectPathWithNamespace}/datasets`});
     }
  });
  }
  if(props.accessLevel < ACCESS_LEVELS.MAINTAINER){
    return <Col sm={12} md={8} lg={10}>
    <Alert timeout={0} color="primary">
      Acces Denied. You don't have rights to create datasets for this project.<br /><br /> 
      <FontAwesomeIcon icon={faInfoCircle} />  If you where recently added to this project try refreshing the page.
    </Alert>
  </Col>
  }

  return (
    <Row>
      <Col>
        <FormPanel
          title="Create Dataset" 
          btnName="Create Dataset" 
          submitCallback={submitCallback} 
          model={props.datasetFormSchema}
          serverErrors={serverErrors}
          submitLoader={{value: submitLoader, text:"Creating dataset, please wait..."}}
          onCancel={onCancel} />
      </Col>
    </Row>
  );

}

export default DatasetNew;
