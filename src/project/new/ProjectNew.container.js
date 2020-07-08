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
 *  ProjectNew.container.js
 *  Container components for new project
 */

import React, { Component } from "react";
import { connect } from "react-redux";

import { NewProject as NewProjectPresent } from "./ProjectNew.present";
import { NewProjectCoordinator } from "./ProjectNew.state";
import { ProjectsCoordinator } from "../shared";
import { gitLabUrlFromProfileUrl } from "../../utils/HelperFunctions";


class NewProject extends Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.coordinator = new NewProjectCoordinator(props.client, this.model.subModel("newProject"));
    this.coordinator.setConfig(props.templates.custom, props.templates.repositories);
    this.projectsCoordinator = new ProjectsCoordinator(props.client, props.model.subModel("projects"));
    this.coordinator.resetInput();

    this.handlers = {
      onSubmit: this.onSubmit.bind(this),
      getNamespaces: this.getNamespaces.bind(this),
      getTemplates: this.getTemplates.bind(this),
      setProperty: this.setProperty.bind(this),
      setNamespace: this.setNamespace.bind(this),
      setVariable: this.setVariable.bind(this),
      goToProject: this.goToProject.bind(this)
    };
  }

  async getNamespaces() {
    // we pass the projects object but we pre-set loading to get proper validation
    let projects = this.model.get("projects");
    projects = { ...projects, namespaces: { ...projects.namespaces, fetching: true } };
    this.coordinator.validate(projects, null, null, true);
    const namespaces = await this.projectsCoordinator.getNamespaces();
    projects = this.model.get("projects");
    this.coordinator.validate(projects, null, null, true);
    return namespaces;
  }

  async getTemplates() {
    return this.coordinator.getTemplates();
  }

  refreshUserProjects() {
    this.projectsCoordinator.getFeatured();
  }

  setProperty(property, value) {
    // projects data are provided for full validation
    this.coordinator.setProperty(property, value, this.model.get("projects"));
  }

  setNamespace(namespace) {
    this.setProperty("namespace", namespace.full_path);
    this.coordinator.getVisibilities(namespace);
  }

  setVariable(variable, value) {
    this.coordinator.setVariable(variable, value);
  }

  goToProject() {
    const slug = this.coordinator.getSlugAndReset();
    this.props.history.push(`/projects/${slug}`);
  }

  onSubmit(e) {
    e.preventDefault();

    // validate -- we do this cause we don't show errors on pristine variables
    if (this.coordinator.invalidatePristine())
      return;
    let validation = this.coordinator.getValidation();
    if (Object.keys(validation.errors).length || Object.keys(validation.warnings).length)
      return;

    // submit
    const gitlabUrl = gitLabUrlFromProfileUrl(this.props.user.data.web_url);
    this.coordinator.postProject(gitlabUrl).then(result => {
      const { creation } = result.meta;
      if (creation.created) {
        this.refreshUserProjects();
        if (!creation.kgError && !creation.projectError) {
          const slug = `${creation.newNamespace}/${creation.newName}`;
          this.props.history.push(`/projects/${slug}`);
        }
      }
    });
  }

  mapStateToProps(state, ownProps) {
    // map minimal projects and user information
    const additional = {
      projects: {
        fetched: state.projects.featured.fetched,
        fetching: state.projects.featured.fetching,
        list: state.projects.featured.member
      },
      namespaces: {
        fetched: state.projects.namespaces.fetched,
        fetching: state.projects.namespaces.fetching,
        list: state.projects.namespaces.list
      },
      user: {
        logged: state.user.logged
      }
    };

    return {
      ...additional,
      ...state.newProject,
      handlers: this.handlers
    };
  }

  render() {
    const ConnectedNewProject = connect(this.mapStateToProps.bind(this))(NewProjectPresent);

    return <ConnectedNewProject
      store={this.model.reduxStore}
      location={this.props.location}
    />;
  }
}


export { NewProject };
