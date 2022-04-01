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
 *  FormGenerator.container.js
 *  Container components for form generator
 */

import React, { Component } from "react";
import { connect } from "react-redux";

import useForm from "./UseForm";
import { FormGeneratorCoordinator } from "./FormGenerator.state";
import FormPanel from "./FormGenerator.present";
import _ from "lodash";
import { simpleHash } from "../../helpers/HelperFunctions";

function locationToLocationHash(loc) { return "uid_" + simpleHash(loc); }

function mapStateToProps(state, props) {
  const currentDraft = state.stateModel.formGenerator.formDrafts[props.locationHash];
  return {
    draft: currentDraft,
    ...props
  };
}

const VisibleFormGenerator = connect(mapStateToProps)(FormPanel);

function FormGeneratorWrapper(props) {
  const draft = props.model.get("formDrafts")[props.locationHash];
  const [inputs, setInputs, setSubmit] = useForm(props.submitCallback, props.handlers, draft);
  return (<VisibleFormGenerator
    {...props}
    handlers={props.handlers}
    inputs={inputs}
    loading={props.isLoading}
    locationHash={props.locationHash}
    modelValues={props.modelValues}
    setInputs={setInputs}
    setSubmit={setSubmit}
    store={props.store}
    versionUrl={props.versionUrl}
  />);
}

class FormGenerator extends Component {

  constructor(props) {
    super(props);
    this.model = props.modelTop.subModel("formGenerator");
    this.locationHash = locationToLocationHash(props.formLocation);
    this.coordinator = new FormGeneratorCoordinator(props.client, this.model, props.formLocation, this.locationHash);
    this.handlers = {
      addDraft: this.addDraft.bind(this),
      removeDraft: this.removeDraft.bind(this),
      getFormDraftFieldProperty: this.getFormDraftFieldProperty.bind(this),
      setFormDraftFieldValue: this.setFormDraftFieldValue.bind(this),
      setSubmitLoader: this.setSubmitLoader.bind(this),
      setServerErrors: this.setServerErrors.bind(this),
      setDisableAll: this.setDisableAll.bind(this),
      setServerWarnings: this.setServerWarnings.bind(this),
      setSecondaryButtonText: this.setSecondaryButtonText.bind(this),
      setFormDraftInternalValuesProperty: this.setFormDraftInternalValuesProperty.bind(this),
      getFormDraftInternalValuesProperty: this.getFormDraftInternalValuesProperty.bind(this),
      hideButtons: this.hideButtons.bind(this)
    };
  }

  componentDidMount() {
    const currentDraft = this.getDraft();
    const modelValues = currentDraft ?
      currentDraft.currentFormModel : _.cloneDeep(Object.values(this.props.model));

    if (modelValues) {
      if (this.props.initializeFunction) {
        this.props.initializeFunction( modelValues, this.handlers);
        this.addDraft(modelValues);
      }
      else if (currentDraft === undefined) {
        modelValues.map(field=> {
          if (field.initial)
            field.value = field.initial;
          return field;
        });
        this.addDraft(modelValues);
      }
    }
  }

  addDraft(formDraft) {
    return this.coordinator.addFormDraft(formDraft);
  }

  getDraft() {
    return this.coordinator.getFormDraft();
  }

  removeDraft() {
    return this.coordinator.removeFormDraft();
  }

  setSubmitLoader(submitLoader) {
    return this.coordinator.setDraftProperty( "submitLoader", submitLoader);
  }

  hideButtons(hideButtons) {
    return this.coordinator.setDraftProperty("hideButtons", hideButtons);
  }

  setServerErrors(serverErrors) {
    return this.coordinator.setDraftProperty( "serverErrors", serverErrors);
  }

  setServerWarnings(serverWarnings) {
    return this.coordinator.setDraftProperty( "serverWarnings", serverWarnings);
  }

  setDisableAll(disableAll) {
    return this.coordinator.setDraftProperty("disableAll", disableAll);
  }

  setSecondaryButtonText(text) {
    return this.coordinator.setDraftProperty("secondaryButton", text);
  }

  getFormDraftFieldProperty(fieldName, property) {
    return this.coordinator.getFormDraftFieldProperty(fieldName, property);
  }

  setFormDraftFieldValue(fieldName, value) {
    return this.coordinator.setFormDraftFieldValue(fieldName, value);
  }

  setFormDraftInternalValuesProperty(fieldName, property, value) {
    return this.coordinator.setFormDraftInternalValuesProperty(fieldName, property, value);
  }

  getFormDraftInternalValuesProperty(fieldName, property) {
    return this.coordinator.getFormDraftInternalValuesProperty(fieldName, property);
  }

  render() {
    const draft = this.model.get("formDrafts")[this.locationHash];
    return <FormGeneratorWrapper
      {...this.props}
      draft={draft}
      handlers={this.handlers}
      loading={this.getDraft() === undefined}
      locationHash={this.locationHash}
      model={this.model}
      modelValues={this.getDraft()}
      store={this.model.reduxStore}
      versionUrl={this.props.versionUrl ? this.props.versionUrl : ""}
    />;
  }
}
export default FormGenerator;
