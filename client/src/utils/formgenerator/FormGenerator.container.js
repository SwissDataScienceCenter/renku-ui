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
    this.coordinator = new FormGeneratorCoordinator(props.client, this.model);
    this.handlers = {
      addDraft: this.addDraft.bind(this),
      getDraft: this.getDraft.bind(this),
      removeDraft: this.removeDraft.bind(this),
      getFormDraftFieldProperty: this.getFormDraftFieldProperty.bind(this),
      setFormDraftFieldValue: this.setFormDraftFieldValue.bind(this),
      setSubmitLoader: this.setSubmitLoader.bind(this),
      getSubmitLoader: this.getSubmitLoader.bind(this),
      getServerErrors: this.getServerErrors.bind(this),
      setServerErrors: this.setServerErrors.bind(this),
      getDisableAll: this.getDisableAll.bind(this),
      setDisableAll: this.setDisableAll.bind(this),
      getServerWarnings: this.getServerWarnings.bind(this),
      setServerWarnings: this.setServerWarnings.bind(this),
      getSecondaryButtonText: this.getSecondaryButtonText.bind(this),
      setSecondaryButtonText: this.setSecondaryButtonText.bind(this),
      isMounted: this.isMounted.bind(this),
      setFormDraftInternalValuesProperty: this.setFormDraftInternalValuesProperty.bind(this),
      getFormDraftInternalValuesProperty: this.getFormDraftInternalValuesProperty.bind(this)
    };
  }

  addDraft(formDraft, mounted, formLocation = this.props.formLocation) {
    return this.coordinator.addFormDraft(formLocation, formDraft, mounted);
  }

  getDraft( formLocation = this.props.formLocation) {
    return this.coordinator.getFormDraft(formLocation);
  }

  removeDraft( formLocation = this.props.formLocation) {
    return this.coordinator.removeFormDraft(formLocation);
  }

  setSubmitLoader(submitLoader, formLocation = this.props.formLocation) {
    return this.coordinator.setDraftProperty(formLocation, "submitLoader", submitLoader);
  }

  getSubmitLoader( formLocation = this.props.formLocation) {
    return this.coordinator.getDraftProperty(formLocation, "submitLoader");
  }

  setServerErrors(serverErrors, formLocation = this.props.formLocation) {
    return this.coordinator.setDraftProperty(formLocation, "serverErrors", serverErrors);
  }

  getServerErrors( formLocation = this.props.formLocation) {
    return this.coordinator.getDraftProperty(formLocation, "serverErrors");

  }

  setServerWarnings(serverWarnings, formLocation = this.props.formLocation) {
    return this.coordinator.setDraftProperty(formLocation, "serverWarnings", serverWarnings);
  }

  getServerWarnings( formLocation = this.props.formLocation) {
    return this.coordinator.getDraftProperty(formLocation, "serverWarnings");
  }

  setDisableAll(disableAll, formLocation = this.props.formLocation) {
    return this.coordinator.setDraftProperty(formLocation, "disableAll", disableAll);
  }

  getDisableAll( formLocation = this.props.formLocation) {
    return this.coordinator.getDraftProperty(formLocation, "disableAll");
  }

  setSecondaryButtonText(text, formLocation = this.props.formLocation) {
    return this.coordinator.setDraftProperty(formLocation, "secondaryButton", text);
  }

  getSecondaryButtonText( formLocation = this.props.formLocation) {
    return this.coordinator.getDraftProperty(formLocation, "secondaryButton");
  }

  isMounted( formLocation = this.props.formLocation) {
    return this.coordinator.getDraftProperty(formLocation, "mounted");
  }

  getFormDraftFieldProperty( formLocation = this.props.formLocation, fieldName, property) {
    return this.coordinator.getFormDraftFieldProperty(formLocation, fieldName, property);
  }

  setFormDraftFieldValue(formLocation = this.props.formLocation, fieldName, value) {
    return this.coordinator.setFormDraftFieldValue(formLocation, fieldName, value);
  }

  setFormDraftInternalValuesProperty( formLocation = this.props.formLocation, fieldName, property, value) {
    return this.coordinator.setFormDraftInternalValuesProperty(formLocation, fieldName, property, value);
  }

  getFormDraftInternalValuesProperty( formLocation = this.props.formLocation, fieldName, property) {
    return this.coordinator.getFormDraftInternalValuesProperty(formLocation, fieldName, property);
  }

  mapStateToProps(state) {
    return {
      handlers: this.handlers,
      drafts: state.formGenerator,
      formLocation: this.props.formLocation
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
