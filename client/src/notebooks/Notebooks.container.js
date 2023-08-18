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

import React, { Component } from "react";
import { connect } from "react-redux";
import { CheckNotebookIcon } from "./NotebookStart.present";
import { NotebooksCoordinator } from "./Notebooks.state";

function mapNotebookStatusStateToProps(state) {
  const subState = state.stateModel.notebooks;

  const notebookKeys = Object.keys(subState.notebooks.all);
  const notebook =
    notebookKeys.length > 0 ? subState.notebooks.all[notebookKeys] : null;

  return {
    fetched: subState.notebooks.fetched,
    fetching: subState.notebooks.fetching,
    notebook,
  };
}

const VisibleNotebookIcon = connect(mapNotebookStatusStateToProps)(
  CheckNotebookIcon
);

/**
 * Display the connect to Jupyter icon
 *
 * @param {Object} client - api-client used to query the gateway
 * @param {Object} model - global model for the ui
 * @param {string} filePath - relative path of the target notebook file
 * @param {string} launchNotebookUrl - launch notebook url
 * @param {Object} scope - object containing filtering parameters
 * @param {string} scope.namespace - full path of the reference namespace
 * @param {string} scope.project - path of the reference project
 * @param {string} scope.branch - branch name
 * @param {string} scope.defaultBranch - default branch of the project
 * @param {string} scope.commit - commit full id or "latest"
 * @param {Object} [location] - react location object
 * @param {number} [pollingInterval] - polling timeout interval in seconds
 */
class CheckNotebookStatus extends Component {
  constructor(props) {
    super(props);
    this.model = props.model.subModel("notebooks");
    this.userModel = props.model.subModel("user");
    this.coordinator = new NotebooksCoordinator(
      props.client,
      this.model,
      this.userModel
    );

    // temporarily reset data since notebooks model was not designed to be static
    this.coordinator.reset();

    if (props.scope) this.coordinator.setNotebookFilters(props.scope);
  }

  async componentDidMount() {
    let { scope } = this.props;
    if (!scope.branch) return;
    this.coordinator.setNotebookFilters(scope);

    const pollingInterval = this.props.pollingInterval
      ? parseInt(this.props.pollingInterval) * 1000
      : 5000;

    this.coordinator.startNotebookPolling(pollingInterval);
  }

  componentWillUnmount() {
    this.coordinator.stopNotebookPolling();
  }

  mapStateToProps(state) {
    const subState = state.stateModel.notebooks;

    const notebookKeys = Object.keys(subState.notebooks.all);
    const notebook =
      notebookKeys.length > 0 ? subState.notebooks.all[notebookKeys] : null;

    return {
      fetched: subState.notebooks.fetched,
      fetching: subState.notebooks.fetching,
      notebook,
    };
  }

  render() {
    return (
      <VisibleNotebookIcon store={this.model.reduxStore} {...this.props} />
    );
  }
}

export { CheckNotebookStatus };
