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
 *  FormPanel.js
 *  Presentational components.
 */

import React, { Fragment, useEffect, useRef } from "react";
import { Form, Button, Col, UncontrolledAlert, FormText } from "reactstrap";
import useForm from "./UseForm";
import TextInput from "./fields/TextInput";
import TextareaInput from "./fields/TexAreaInput";
import SelectInput from "./fields/SelectInput";
import CreatorsInput from "./fields/CreatorsInput";
import SelectautosuggestInput from "./fields/SelectAutosuggestInput";
import CktextareaInput from "./fields/CKEditorTextArea";
import FileUploaderInput from "./fields/FileUploaderInput";
import KeywordsInput from "./fields/KeywordsInput";
import ValidationAlert from "./fields/ValidationAlert";
import { Loader } from "../../utils/UIComponents";
import "./FormGenerator.css";
import _ from "lodash";

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function SubmitButtonGroup(props) {
  const { submitCallback, submitLoader, btnName, errorFields } = props;
  const { onCancel, cancelBtnName } = props;
  const submitButton = submitCallback !== undefined ?
    <Button type="submit" disabled={submitLoader.value} className="float-right mt-1" color="primary">
      {btnName}
    </Button>
    : null;
  const cancelButton = onCancel !== undefined ?
    <Button disabled={submitLoader.value} className="float-right mt-1 mr-1"
      color="secondary" onClick={(e)=>onCancel(e, props.handlers)}>
      {cancelBtnName ? cancelBtnName : "Cancel"}
    </Button>
    : null;
  const errorMessage = (errorFields.length > 0) ?
    <ValidationAlert
      content={`Please fix problems in the following fields: ${errorFields.map(d => d.label).join(" ")}`} /> :
    null;
  return <Fragment>
    { errorMessage }
    { submitButton }
    { cancelButton }
  </Fragment>;
}

function FormPanel({ title, btnName, submitCallback, model, formLocation, onCancel, edit,
  handlers, initializeFunction }) {
  const draft = handlers ? handlers.getDraft() : undefined;
  const modelValues = draft ? draft : _.cloneDeep(Object.values(model));
  const initialized = useRef(false);
  const [inputs, setInputs, setSubmit] = useForm(modelValues, submitCallback, handlers, formLocation);
  const submitLoader = handlers.getSubmitLoader(formLocation);
  const serverErrors = handlers.getServerErrors(formLocation);
  const serverWarnings = handlers.getServerWarnings(formLocation);
  const secondaryButtonText = handlers.getSecondaryButtonText(formLocation);
  const disableAll = handlers.getDisableAll(formLocation);

  useEffect(()=>{
    if (initializeFunction && modelValues && !initialized.current) {
      initializeFunction(modelValues);
      handlers.addDraft(modelValues, true);
      initialized.current = true;
    }
  }, []);

  const Components = {
    TextInput,
    TextareaInput,
    CktextareaInput,
    FileUploaderInput,
    SelectInput,
    SelectautosuggestInput,
    CreatorsInput,
    KeywordsInput
  };

  const renderInput = input => {
    const Component = Components[capitalize(input.type) + "Input"];
    return <Component key={input.name}
      disabled={(submitLoader && submitLoader.value ) || (input.edit === false && edit) || disableAll}
      setInputs={setInputs} {...input} handlers={handlers} formLocation={formLocation}/>;
  };

  const extractErrorsAndWarnings = (errorOrWarning) => {
    let content;
    var htmlRegex = new RegExp(/^/);
    if (typeof errorOrWarning === "string") {
      content = <p>{errorOrWarning}</p>;
    }
    else {
      if (htmlRegex.test(errorOrWarning)) { content = errorOrWarning; }
      else {
      //this could be improve to extract better the error message
      //ideally we could map backend and frontend fields and put the error under the field
        content = Object.keys(errorOrWarning).map(error =>
          (<p key={error}>{`${error}: ${JSON.stringify(errorOrWarning[error])}`}</p>)
        );
      }
    }
    return (<div>
      <p>Errors occurred while performing this operation.</p>
      {content}
    </div>);
  };

  const errorFields = inputs ? inputs.filter(input => (input.alert != null) && (input.edit !== false)) : [];

  return (
    <Col>
      { title !== undefined ?
        <h3 className="uk-heading-divider uk-text-center pb-2">{title}</h3>
        : null }
      <Form onSubmit={setSubmit}>
        <div>
          {inputs ? inputs.map(input => renderInput(input)) : null}
          {serverErrors ? <UncontrolledAlert color="danger">
            {extractErrorsAndWarnings(serverErrors)}</UncontrolledAlert> : null}
          {serverWarnings ? <UncontrolledAlert color="warning">
            {extractErrorsAndWarnings(serverWarnings)}</UncontrolledAlert> : null}
          {submitLoader !== undefined && submitLoader.value ?
            <FormText color="primary">
              <Loader size="16" inline="true" margin="2" />
              {submitLoader.text}
            </FormText>
            : null
          }
          <SubmitButtonGroup
            submitCallback={submitCallback} submitLoader={submitLoader} btnName={btnName} errorFields={errorFields}
            onCancel={onCancel} cancelBtnName={secondaryButtonText} handlers={handlers}
          />
        </div>
      </Form>
    </Col>
  );
}

export default FormPanel;
export { capitalize };
