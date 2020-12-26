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

// /**
//  * Notifications object - it's not a React component.
//  *
//  * @param {Object} client - api-client used to query the gateway
//  * @param {Object} model - global model for the ui
//  * @param {function} getLocation - function to invoke to get the up-to-date react location object
//  */
// class FormGeneratorManager {
//   constructor(model, client, getLocation) {
//     this.model = model.subModel("formGenerator");
//     this.client = client;
//     this.getLocation = getLocation;
//     this.coordinator = new FormGeneratorCoordinator(this.client, this.model);
//   }

//   /**
//    * Add a form draft to the list
//    *
//    * @param {string} formDraft - form draft to be stored
//    */
//   addDraft(formDraft) {
//     const draft = this.coordinator.addFormDraft(this.getLocation(), formDraft);
//     return draft;
//   }

//   getDraft() {
//     return this.coordinator.getFormDraft(this.getLocation());
//   }

// }


class FormGenerator extends Component {

  constructor(props) {
    super(props);
    this.model = props.model_top.subModel("formGenerator");
    this.coordinator = new FormGeneratorCoordinator(props.client, this.model);
    this.handlers = {
      addDraft: this.addDraft.bind(this),
      getDraft: this.getDraft.bind(this),
    };
  }

  addDraft(formDraft) {
    const draft = this.coordinator.addFormDraft(this.props.location.pathname, formDraft);
    return draft;
  }

  getDraft() {
    return this.coordinator.getFormDraft(this.props.location.pathname);
  }

  mapStateToProps(state) {
    return {
      handlers: this.handlers,
      drafts: state.formGenerator
    };
  }

  render() {
    const VisibleFormGenerator = connect(this.mapStateToProps.bind(this))(FormPanel);
    return (<VisibleFormGenerator
      {...this.props}
      store={this.model.reduxStore}
      location={this.props.location}
    />);
  }
}
export default FormGenerator;
// export { FormGeneratorManager };
