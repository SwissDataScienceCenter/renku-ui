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
 *  FormGenerator.present.js
 *  Presentational components.
 */

import React from "react";
import { Form, Button, Col, UncontrolledAlert } from "reactstrap";
import TextInput from "./fields/TextInput";
import TextareaInput from "./fields/TexAreaInput";
import SelectInput from "./fields/SelectInput";
import CreatorsInput from "./fields/CreatorsInput";
import CktextareaInput from "./fields/CKEditorTextArea";
import FileUploaderInput from "./fields/FileUploaderInput";
import KeywordsInput from "./fields/KeywordsInput";
import ImageInput from "./fields/ImageInput";
import { Loader } from "../Loader";
import "./FormGenerator.css";
import ProgressIndicator, { ProgressStyle, ProgressType } from "../progress/Progress";
import { FormErrorFields } from "../../../project/new/components/FormValidations";
import AddDatasetButtons from "../addDatasetButtons/AddDatasetButtons";

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function SubmitButtonGroup(props) {
  const { submitCallback, submitLoader, btnName } = props;
  const { onCancel, cancelBtnName } = props;
  const submitButton = submitCallback !== undefined ?
    <Button type="submit" disabled={submitLoader} className="float-end mt-1" color="secondary">
      {btnName}
    </Button>
    : null;
  const cancelButton = onCancel !== undefined ?
    <Button disabled={submitLoader} className="float-end mt-1 me-1"
      color="secondary" outline onClick={(e)=>onCancel(e, props.handlers)}>
      {cancelBtnName ? cancelBtnName : "Cancel"}
    </Button>
    : null;

  return <div>
    { submitButton }
    { cancelButton }
  </div>;
}

function FormPanel({
  btnName, draft, edit, formLocation, formatServerErrorsAndWarnings, handlers, inputs, loading,
  onCancel, setInputs, setSubmit, submitCallback, addDatasetOptionSelected, versionUrl,
  toggleNewDataset, showAddDatasetOptions
}) {

  const submitLoader = draft?.submitLoader && draft?.submitLoader.value;
  const hideButtons = draft?.hideButtons;
  const serverErrors = draft?.serverErrors;
  const serverWarnings = draft?.serverWarnings;
  const secondaryButtonText = draft?.secondaryButton;
  const disableAll = draft?.disableAll;

  const Components = {
    CktextareaInput,
    CreatorsInput,
    FileUploaderInput,
    ImageInput,
    KeywordsInput,
    SelectInput,
    TextInput,
    TextareaInput,
  };

  const renderInput = input => {
    const Component = Components[capitalize(input.type) + "Input"];
    const disabled = submitLoader || (input.edit === false && edit) || disableAll;
    return (
      <Component {...input}
        className="field-group"
        disabled={disabled}
        formLocation={formLocation}
        handlers={handlers}
        key={input.name}
        setInputs={setInputs}
        value={input.value}
        versionUrl={versionUrl}
      />
    );
  };

  const extractErrorsAndWarnings = (errorOrWarning, isError) => {
    let content;
    let formattedErrorOrWarning = formatServerErrorsAndWarnings ?
      formatServerErrorsAndWarnings(errorOrWarning, isError) : errorOrWarning;

    var htmlRegex = new RegExp(/^/);
    if (typeof formattedErrorOrWarning === "string") {
      content = <p>{formattedErrorOrWarning}</p>;
    }
    else {
      if (htmlRegex.test(formattedErrorOrWarning)) { content = formattedErrorOrWarning; }
      else {
      //this could be improve to extract better the error message
      //ideally we could map backend and frontend fields and put the error under the field
        content = Object.keys(formattedErrorOrWarning).map(error =>
          (<p key={error}>{`${error}: ${JSON.stringify(formattedErrorOrWarning[error])}`}</p>)
        );
      }
    }
    const topMessage = isError ?
      "Errors occurred while performing this operation."
      : "The operation was successful but there are some warning messages.";
    return (<div>
      <p>{topMessage}</p>
      {content}
    </div>);
  };

  if (!inputs || inputs.length === 0 || loading)
    return <Loader />;

  const errorFields = inputs.filter(input => (input.alert != null) && (input.edit !== false));

  const errorMessage = (errorFields.length > 0) ?
    <FormErrorFields errorFields={errorFields.map(d => d.label)} /> :
    null;


  // add dataset options buttons (addDataset or ImportDataset)
  const addDatasetButtons = showAddDatasetOptions && !submitLoader && (
    <AddDatasetButtons
      optionSelected={addDatasetOptionSelected ?? "addDataset"}
      toggleNewDataset={toggleNewDataset} />
  );

  // customize the progress indicator when add/modify a dataset
  const titleProgress = edit ? "Editing dataset" : "Creating Dataset...";
  const feedbackProgress = edit ?
    "Once the process is completed, you will be redirected to the page " +
    "of the dataset."
    : "You'll be redirected to the new dataset page when the creation is completed.";

  return (
    <Col>
      {submitLoader ? (
        <ProgressIndicator
          type={ProgressType.Indeterminate}
          style={ProgressStyle.Dark}
          title={titleProgress}
          description="We've received your dataset information. This may take a while."
          currentStatus=""
          feedback={feedbackProgress}
        />
      ) : (
        <Form onSubmit={setSubmit}>
          <div className="d-flex flex-column">
            {addDatasetButtons}
            {inputs.map(input => renderInput(input))}
            {serverErrors ? <UncontrolledAlert color="danger">
              {extractErrorsAndWarnings(serverErrors, true)}</UncontrolledAlert> : null}
            {serverWarnings ? <UncontrolledAlert color="warning">
              {extractErrorsAndWarnings(serverWarnings, false)}</UncontrolledAlert> : null}
            {hideButtons === true ?
              null
              :
              <SubmitButtonGroup
                submitCallback={submitCallback} submitLoader={submitLoader} btnName={btnName} errorFields={errorFields}
                onCancel={onCancel} cancelBtnName={secondaryButtonText} handlers={handlers}
              />
            }
            {errorMessage}
          </div>
        </Form>
      )}
    </Col>
  );
}

export default FormPanel;
export { capitalize };
