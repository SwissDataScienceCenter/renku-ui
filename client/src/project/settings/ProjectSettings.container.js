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

import React, { Component, useState } from "react";
import { connect } from "react-redux";

import { ProjectSettingsSessions as ProjectSettingsSessionsPresent } from "./ProjectSettings.present";
import { NotebooksCoordinator } from "../../notebooks";
import { refreshIfNecessary } from "../../utils/HelperFunctions";

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
    const url = repositoryUrl ?
      repositoryUrl :
      this.props.externalUrl;
    return await this.projectCoordinator.fetchProjectConfig(url);
  }

  refreshOptions() {
    return this.notebooksCoordinator.fetchNotebookOptions(true);
  }

  mapStateToProps(state, ownProps) {
    return {
      options: state.notebooks.options,
      metadata: state.project.metadata,
      config: state.project.config,
      user: state.user
    };
  }
  render() {
    const ProjectSettingsSessionsConnected = connect(this.mapStateToProps.bind(this))(ProjectSettingsSessions);
    return (
      <ProjectSettingsSessionsConnected
        projectCoordinator={this.projectCoordinator}
        store={this.model.reduxStore}
        handlers={this.handlers}
        location={this.props.location}
        client={this.props.client}
        repositoryUrl={this.props.externalUrl}
      />
    );
  }
}

/**
 * Component to manage project level sessions settings.
 */
function ProjectSettingsSessions(props) {
  const { client, config, handlers, location, metadata, options, repositoryUrl, user } = props;

  const pristineNewConfig = {
    updating: false,
    keyName: null,
    value: null,
    updated: false,
    error: null
  };
  const [newConfig, setNewConfig] = useState({ ...pristineNewConfig });

  // Set target project config value
  const setConfig = async (key, value, keyName) => {
    setNewConfig({ ...pristineNewConfig, keyName, updating: true });
    try {
      const config = { [key]: value };
      const response = await client.setProjectConfig(repositoryUrl, config);
      if (response.data.error) {
        setNewConfig({ ...newConfig, updating: false, keyName, error: response.data.error.reason });
      }
      else {
        const value = response.data.result.config[Object.keys(response.data.result.config)[0]];
        setNewConfig({ ...newConfig, updating: false, updated: true, keyName, value });
      }
    }
    catch (error) {
      setNewConfig({ ...newConfig, keyName, error: error.message });
    }
    finally {
      await handlers.refreshConfig();
    }
  };

  return (
    <ProjectSettingsSessionsPresent
      config={config}
      location={location}
      metadata={metadata}
      newConfig={newConfig}
      options={options}
      setConfig={setConfig}
      user={user}
    />
  );
}

export { ProjectSettingsSessionsMapper as ProjectSettingsSessions };
