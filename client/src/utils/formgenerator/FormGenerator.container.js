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
    this.model = props.model_top.subModel("formGenerator");
    this.coordinator = new FormGeneratorCoordinator(props.client, this.model);
    // this.getLocation = () => props.getLocation();
    this.handlers = {
      addDraft: this.addDraft.bind(this),
      getDraft: this.getDraft.bind(this),
      removeDraft: this.removeDraft.bind(this),
      getFormDraftProperty: this.getFormDraftProperty.bind(this),
      getFormDraftFieldValue: this.getFormDraftFieldValue.bind(this),
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

  addDraft(formDraft, mounted, submitLoader, location = this.props.location.pathname) {
    return this.coordinator.addFormDraft(location, formDraft, mounted, submitLoader);
  }

  getDraft(location = this.props.location.pathname) {
    return this.coordinator.getFormDraft(location);
  }

  removeDraft(location = this.props.location.pathname) {
    return this.coordinator.removeFormDraft(location);
  }

  setSubmitLoader(submitLoader, location = this.props.location.pathname) {
    return this.coordinator.setSubmitLoader(location, submitLoader);
  }

  getSubmitLoader(location = this.props.location.pathname) {
    return this.coordinator.getSubmitLoader(location);
  }

  setServerErrors(serverErrors, location = this.props.location.pathname) {
    return this.coordinator.setServerErrors(location, serverErrors);
  }

  getServerErrors(location = this.props.location.pathname) {
    return this.coordinator.getServerErrors(location);
  }

  setServerWarnings(serverWarnings, location = this.props.location.pathname) {
    return this.coordinator.setServerWarnings(location, serverWarnings);
  }

  getServerWarnings(location = this.props.location.pathname) {
    return this.coordinator.getServerWarnings(location);
  }

  setDisableAll(disableAll, location = this.props.location.pathname) {
    return this.coordinator.setDisableAll(location, disableAll);
  }

  getDisableAll(location = this.props.location.pathname) {
    return this.coordinator.getDisableAll(location);
  }

  setSecondaryButtonText(text, location = this.props.location.pathname) {
    return this.coordinator.setSecondaryButtonText(location, text);
  }

  getSecondaryButtonText(location = this.props.location.pathname) {
    return this.coordinator.getSecondaryButtonText(location);
  }

  isMounted(location = this.props.location.pathname) {
    return this.coordinator.isMounted(location);
  }

  getFormDraftProperty(location = this.props.location.pathname, fieldName, property) {
    return this.coordinator.getFormDraftProperty(location, fieldName, property);
  }

  setFormDraftInternalValuesProperty(location = this.props.location.pathname, fieldName, property, value) {
    return this.coordinator.setFormDraftInternalValuesProperty(location, fieldName, property, value);
  }

  getFormDraftInternalValuesProperty(location = this.props.location.pathname, fieldName, property) {
    return this.coordinator.getFormDraftInternalValuesProperty(location, fieldName, property);
  }

  getFormDraftFieldValue(location = this.props.location.pathname, fieldName) {
    return this.coordinator.getFormDraftFieldValue(location, fieldName);
  }

  mapStateToProps(state) {
    return {
      handlers: this.handlers,
      drafts: state.formGenerator,
      formLocation: this.props.location.pathname,
      //getLocation: () => this.props.location.pathname
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
