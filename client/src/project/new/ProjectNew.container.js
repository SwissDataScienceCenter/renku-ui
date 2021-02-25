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

import React, { Component, useEffect, useState, useRef } from "react";
// TODO: switch to useSelector
import { connect } from "react-redux";

import { NewProject as NewProjectPresent, ForkProject as ForkProjectPresent } from "./ProjectNew.present";
import { NewProjectCoordinator, validateTitle, checkTitleDuplicates } from "./ProjectNew.state";
import { ProjectsCoordinator } from "../shared";
import { gitLabUrlFromProfileUrl, slugFromTitle, refreshIfNecessary } from "../../utils/HelperFunctions";
import { Url } from "../../utils/url";

const CUSTOM_REPO_NAME = "Custom";


/** helper function -- fork notifications */
function addForkNotification(notifications, url, info, startingLocation, success = true, excludeStarting = false) {
  if (success) {
    const locations = excludeStarting ?
      [url] :
      [url, startingLocation];
    notifications.addSuccess(
      notifications.Topics.PROJECT_FORKED,
      `Project ${info.name} successfully created.`,
      url, "Show project",
      locations,
      `The project has been successfully forked to ${info.namespace}/${info.path}`
    );
  }
  else {
    const locations = excludeStarting ?
      [] :
      [startingLocation];
    notifications.addError(
      notifications.Topics.PROJECT_FORKED,
      "Forking operation did not complete.",
      startingLocation, "Try again",
      locations,
      "The fork operation did not run to completion. It is possible the project has been created, but some" +
      "elements may have not been cloned properly."
    );
  }
}


/**
 * This component is needed to map properties from the redux store and keep local states cleared by the
 * mapping function. We can remove it when we switch to the useSelector hook
 *
 * @param {object} props.client - client object
 * @param {object} props.model - redux model
 * @param {object} props.history - react history object
 * @param {object} props.notifications - notifications object
 * @param {string} props.title - reference project title
 * @param {number} props.id - reference project id
 * @param {function} props.toggleModal - function to toggle the modal on and off
 */
class ForkProjectMapper extends Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.projectsCoordinator = new ProjectsCoordinator(props.client, this.model.subModel("projects"));

    this.handlers = {
      getNamespaces: this.getNamespaces.bind(this),
      getProjects: this.getProjects.bind(this),
    };
  }

  componentDidMount() {
    // fetch if not yet available and refresh if older than 10 seconds
    const currentState = this.model.get("projects");
    refreshIfNecessary(
      currentState.namespaces.fetching, currentState.namespaces.fetched, () => { this.getNamespaces(); }
    );
    refreshIfNecessary(
      currentState.featured.fetching, currentState.featured.fetched, () => { this.getProjects(); }
    );
  }

  async getNamespaces() {
    return await this.projectsCoordinator.getNamespaces();
  }

  async getProjects() {
    return await this.projectsCoordinator.getFeatured();
  }

  mapStateToProps(state, ownProps) {
    return {
      handlers: this.handlers,
      namespaces: { ...state.projects.namespaces },
      // We need only a selection of the featured projects. Replicate the namespaces structure fetched/fetching/list
      projects: {
        fetched: state.projects.featured.fetched,
        fetching: state.projects.featured.fetching,
        list: state.projects.featured.member,
      }
    };
  }

  render() {
    const { client, id, history, notifications, title, toggleModal } = this.props;

    const ForkProjectMapped = connect(this.mapStateToProps.bind(this))(ForkProject);
    return (
      <ForkProjectMapped
        store={this.model.reduxStore}
        client={client}
        forkedId={id}
        forkedTitle={title}
        toggleModal={toggleModal}
        notifications={notifications}
        history={history} />
    );
  }
}


function ForkProject(props) {
  const { forkedTitle, handlers, namespaces, projects, toggleModal } = props;

  const [title, setTitle] = useState(forkedTitle + " - copy");
  const [namespace, setNamespace] = useState(""); // TODO - pick the default namespace if available
  const [projectsPaths, setProjectsPaths] = useState([]);
  const [error, setError] = useState(null);

  const [forking, setForking] = useState(false);
  const [forkError, setForkError] = useState(null);

  // Monitor changes to projects list
  useEffect(() => {
    if (!projects.list || !projects.list.length)
      setProjectsPaths([]);
    else
      setProjectsPaths(projects.list.map(project => project.path_with_namespace.toLowerCase()));
  }, [projects.list]);

  // Monitor changes to title, namespace or projects slug list to check for errors
  useEffect(() => {
    // no errors if I can't check all of the fields -- should be transitory
    if (title == null || namespace == null || projectsPaths == null) {
      setError(null);
      return;
    }
    const validationError = validateTitle(title);
    if (validationError) {
      setError(validationError);
      return;
    }
    const duplicateError = checkTitleDuplicates(title, namespace, projectsPaths);
    if (duplicateError) {
      setError(
        "Title produces a project identifier (" + slugFromTitle(title, true) +
        ") that is already taken in the selected namespace. Please select a different title or namespace."
      );
      return;
    }
    setError(null);
  }, [title, namespace, projectsPaths]);

  // Monitor component mounted state -- helper to prevent illegal action when the fork takes long
  const mounted = useRef(false);
  useEffect(() => {
    // this keeps track of the component status
    mounted.current = true;
    return () => { mounted.current = false; };
  });

  // fork operations including fork, status check, redirect
  const fork = async () => {
    const { client, forkedId, history, notifications } = props;

    const path = slugFromTitle(title, true);
    const startingLocation = history.location.pathname;
    setForking(true);
    setForkError(null);
    try {
      const forked = await client.forkProject(forkedId, title, path, namespace);

      // wait for operations to finish
      let count;
      const THRESHOLD = 100, DELTA = 3000;
      for (count = 0; count < THRESHOLD; count++) {
        await new Promise(r => setTimeout(r, DELTA)); // sleep
        const forkOperation = await client.getProjectStatus(forked.project.id);
        if (forkOperation === "finished")
          break;
        else if (forkOperation === "failed" || forkOperation === "error")
          throw new Error("Cloning operation failed");
        else if (count === THRESHOLD - 1)
          throw new Error("Cloning is taking too long");
      }

      // Add notification. Mark it as read and redirect automatically only when the modal is still open
      let newProjectData = { namespace: forked.project.namespace.full_path, path: forked.project.path };
      const newUrl = Url.get(Url.pages.project, newProjectData);
      newProjectData.name = forked.project.name;
      if (mounted.current) {
        addForkNotification(notifications, newUrl, newProjectData, startingLocation, true, false);
        history.push(newUrl);
      }
      else {
        addForkNotification(notifications, newUrl, newProjectData, startingLocation, true, true);
      }
      return null; // this prevents further operations on non-mounted components
    }
    catch (e) {
      if (mounted.current) {
        addForkNotification(notifications, null, null, startingLocation, false, false);
        setForkError(e.message);
      }
      else {
        addForkNotification(notifications, null, null, startingLocation, false, true);
      }
    }
    if (mounted.current)
      setForking(false);
  };

  // compatibility layer to re-use the UI components from new project creation
  const setPropertyP = (target, value) => {
    if (target === "title") {
      const localValue = value ? value : "";
      setTitle(localValue);
    }
    setForkError(null); // reset fork error when typing
  };

  const setNamespaceP = (value) => {
    setNamespace(value.full_path);
  };

  const adjustedHandlers = {
    getNamespaces: handlers.getNamespaces,
    setNamespace: setNamespaceP,
    setProperty: setPropertyP
  };

  return (
    <ForkProjectPresent
      error={error}
      fork={fork}
      forkedTitle={forkedTitle}
      forkError={forkError}
      forking={forking}
      handlers={adjustedHandlers}
      namespace={namespace}
      namespaces={namespaces}
      projects={projects}
      title={title}
      toggleModal={toggleModal}
    />
  );
}

class NewProject extends Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.coordinator = new NewProjectCoordinator(props.client, this.model.subModel("newProject"),
      this.model.subModel("projects"));
    this.coordinator.setConfig(props.templates.custom, props.templates.repositories);
    this.projectsCoordinator = new ProjectsCoordinator(props.client, this.model.subModel("projects"));
    this.coordinator.resetInput();

    this.handlers = {
      onSubmit: this.onSubmit.bind(this),
      getNamespaces: this.getNamespaces.bind(this),
      getTemplates: this.getTemplates.bind(this),
      getUserTemplates: this.getUserTemplates.bind(this),
      setProperty: this.setProperty.bind(this),
      setTemplateProperty: this.setTemplateProperty.bind(this),
      setNamespace: this.setNamespace.bind(this),
      setVariable: this.setVariable.bind(this),
      goToProject: this.goToProject.bind(this)
    };
  }

  async getNamespaces() {
    // we pass the projects object but we pre-set loading to get proper validation
    let projects = this.model.get("projects");
    projects = { ...projects, namespaces: { ...projects.namespaces, fetching: true } };
    this.coordinator.validate(null, null, true, projects);
    const namespaces = await this.projectsCoordinator.getNamespaces();
    this.coordinator.validate(null, null, true);
    return namespaces;
  }

  async getTemplates() {
    return this.coordinator.getTemplates(this.model, false);
  }

  async getUserTemplates() {
    const targetRepository = this.model.get("newProject.meta.userTemplates");
    const repositories = [{
      name: CUSTOM_REPO_NAME,
      url: targetRepository.url,
      ref: targetRepository.ref
    }];
    return this.coordinator.getTemplates(repositories, true);
  }

  refreshUserProjects() {
    this.projectsCoordinator.getFeatured();
  }

  setProperty(property, value) {
    this.coordinator.setProperty(property, value);
  }

  setNamespace(namespace) {
    this.setProperty("namespace", namespace.full_path);
    this.coordinator.getVisibilities(namespace);
  }

  setTemplateProperty(property, value) {
    this.coordinator.setTemplateProperty(property, value);
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


export { NewProject, CUSTOM_REPO_NAME, ForkProjectMapper as ForkProject };
