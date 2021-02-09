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

import { FormGeneratorCoordinator } from "./FormGenerator.state";
import FormPanel from "./FormPanel";


class FormGenerator extends Component {

  constructor(props) {
    super(props);
    this.model = props.modelTop.subModel("formGenerator");
    this.coordinator = new FormGeneratorCoordinator(props.client, this.model, props.formLocation);
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
      getFormDraftInternalValuesProperty: this.getFormDraftInternalValuesProperty.bind(this)
    };
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
    return {
      handlers: this.handlers,
      draft: state.formGenerator.formDrafts[this.props.formLocation]
    };
  }

  render() {
    const VisibleFormGenerator = connect(this.mapStateToProps.bind(this))(FormPanel);
    return (<VisibleFormGenerator
      {...this.props}
      store={this.model.reduxStore}
    />);
  }
}
export default FormGenerator;
