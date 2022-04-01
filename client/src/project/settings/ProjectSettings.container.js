/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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
 *  ProjectSettings.container.js
 *  Project settings container components.
 */

import React, { Component } from "react";
import { connect } from "react-redux";

import { ProjectSettingsSessions as ProjectSettingsSessionsPresent } from "./ProjectSettings.present";
import { NotebooksCoordinator } from "../../notebooks";
import { refreshIfNecessary } from "../../utils/helpers/HelperFunctions";

/**
 * Mapper component for ProjectSettingsSessions.
 *
 * @param {Object} props.projectCoordinator - project coordinator
 * @param {Object} props.model - model object
 * @param {Object} props.location - react location object
 * @param {object} props.client - client object
 */
class ProjectSettingsSessionsMapper extends Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.projectCoordinator = props.projectCoordinator;

    // add notebooks coordinator
    const notebooksModel = props.model.subModel("notebooks");
    const userModel = props.model.subModel("user");
    this.notebooksCoordinator = new NotebooksCoordinator(props.client, notebooksModel, userModel);

    // add handlers
    this.handlers = {
      refreshConfig: this.refreshConfig.bind(this)
    };
    this.setConfig = this.setConfig.bind(this);
  }

  setConfigValue(key, value) {
    const config = this.projectCoordinator.get("config.data.config");
    config[key] = value;
    this.projectCoordinator.set("config.data.config", config);
  }

  async setConfig(key, value, keyName) {
    const pristineNewConfig = {
      updating: false,
      keyName: null,
      value: null,
      updated: false,
      error: null
    };

    const currentConfig = this.projectCoordinator.get("config.data.config");
    const previousValue = currentConfig[key];
    this.setConfigValue(key, value);
    this.setState({ ...pristineNewConfig, keyName, key, updating: true, error: null });
    try {
      const config = { [key]: value };
      const response = await this.props.client
        .setProjectConfig(this.props.externalUrl, config, this.props?.migration?.core?.versionUrl);
      if (response?.data?.error) {
        this.setConfigValue(key, previousValue);
        this.setState({ ...this.state, keyName, key, updating: false, error: response.data.error });
      }
      else {
        const value = response.data.result.config[Object.keys(response.data.result.config)[0]];
        this.setState({ ...this.state, updating: false, updated: true, error: null, keyName, key, value });
      }
    }
    catch (error) {
      this.setConfigValue(key, previousValue);
      this.setState({ ...this.state, keyName, key, error: error?.message ? error.message : "Unexpected error." });
    }
  }

  // Refresh on update since componentDidMount may still need operations to finish
  componentDidUpdate(prevProps) {
    if (!prevProps.migration.core.fetched && this.props.migration.core.fetched) {
      const currentConfig = this.model.get("project.config");
      refreshIfNecessary(
        currentConfig.fetching, currentConfig.fetched, () => { this.refreshConfig(); }
      );
    }
  }

  componentDidMount() {
    // Refresh project configuration for logged user
    if (!this.model.get("user.logged"))
      return null;
    const currentConfig = this.model.get("project.config");
    refreshIfNecessary(
      currentConfig.fetching, currentConfig.fetched, () => { this.refreshConfig(); }
    );
    const currentOptions = this.model.get("notebooks.options");
    refreshIfNecessary(
      currentOptions.fetching, currentOptions.fetched, () => { this.refreshOptions(); }
    );

    this.refreshOptions();
  }

  async refreshConfig(repositoryUrl = null) {
    // Prevent refreshing when not possible
    const backend = this.model.get("project.migration.core");
    if (!backend.fetched || !backend.backendAvailable)
      return;
    const url = repositoryUrl ?
      repositoryUrl :
      this.props.externalUrl;
    // Check if the project is locked
    await this.projectCoordinator.fetchProjectLockStatus();
    return await this.projectCoordinator.fetchProjectConfig(url);
  }

  refreshOptions() {
    return this.notebooksCoordinator.fetchNotebookOptions(true);
  }

  mapStateToProps(state, ownProps) {
    return {
      backend: state.stateModel.project.migration.core,
      options: state.stateModel.notebooks.options,
      metadata: state.stateModel.project.metadata,
      config: state.stateModel.project.config,
      user: state.stateModel.user
    };
  }
  render() {
    const ProjectSettingsSessionsConnected = connect(this.mapStateToProps.bind(this))(ProjectSettingsSessionsPresent);
    return (
      <ProjectSettingsSessionsConnected
        location={this.props.location}
        lockStatus={this.props.lockStatus}
        newConfig={this.state}
        setConfig={this.setConfig}
      />
    );
  }
}

export { ProjectSettingsSessionsMapper as ProjectSettingsSessions };
