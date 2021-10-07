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


import { simpleHash } from "../HelperFunctions";
import { FormGeneratorCoordinator } from "./FormGenerator.state";
import FormPanel from "./FormGenerator.present";
import _ from "lodash";


class FormGenerator extends Component {

  constructor(props) {
    super(props);
    this.model = props.modelTop.subModel("formGenerator");
    this.locationHash = "uid_" + simpleHash(props.formLocation);
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

  mapStateToProps(state) {
    const currentDraft = state.formGenerator.formDrafts[this.locationHash];
    const [inputs, setInputs, setSubmit] = useForm(this.props.submitCallback, this.handlers, currentDraft);
    return {
      handlers: this.handlers,
      draft: currentDraft,
      modelValues: this.getDraft(),
      inputs: inputs,
      setInputs: setInputs,
      setSubmit: setSubmit,
      loading: this.getDraft() === undefined
    };
  }


  render() {
    const VisibleFormGenerator = connect(this.mapStateToProps.bind(this))(FormPanel);
    return (<VisibleFormGenerator
      {...this.props}
      store={this.model.reduxStore}
      loading={this.getDraft() === undefined}
    />);
  }
}
export default FormGenerator;
