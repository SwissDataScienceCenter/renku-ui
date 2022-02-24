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
import { gitLabUrlFromProfileUrl, slugFromTitle, refreshIfNecessary } from "../../utils/helpers/HelperFunctions";
import { Url, getSearchParams } from "../../utils/helpers/url";
import { atobUTF8, btoaUTF8 } from "../../utils/helpers/Encoding";
import { newProjectSchema } from "../../model/RenkuModels";

const CUSTOM_REPO_NAME = "Custom";


/** helper function -- fork notifications */
// TODO: restore after #1585
// eslint-disable-next-line
function addForkNotification(notifications, url, info, startingLocation, success = true,
  excludeStarting = false, visibilityException = false) {
  if (success && !visibilityException) {
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
  else if (visibilityException) {
    const locations = excludeStarting ?
      [url] :
      [url, startingLocation];
    notifications.addWarning(
      notifications.Topics.PROJECT_FORKED,
      `Project ${info.name} has been created with an exception.`,
      url, "Show project",
      locations,
      `The project has been successfully forked to ${info.namespace}/${info.path}
      although it was not possible to configure the visibility${visibilityException?.message}`
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
      getVisibilities: this.getVisibilities.bind(this),
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

  async getVisibilities(namespace) {
    return await this.projectsCoordinator.getVisibilities(namespace, this.props.projectVisibility);
  }

  mapStateToProps(state, ownProps) {
    return {
      namespaces: { ...state.projects.namespaces },
      // We need only a selection of the featured projects. Replicate the namespaces structure fetched/fetching/list
      projects: {
        fetched: state.projects.featured.fetched,
        fetching: state.projects.featured.fetching,
        list: state.projects.featured.member,
      },
      user: {
        logged: state.user.logged,
        username: state.user.data && state.user.data.username ? state.user.data.username : null
      }
    };
  }

  render() {
    const { client, id, history, notifications, title, toggleModal } = this.props;

    const ForkProjectMapped = connect(this.mapStateToProps.bind(this))(ForkProject);
    return (
      <ForkProjectMapped
        client={client}
        forkedId={id}
        forkedTitle={title}
        handlers={this.handlers}
        history={history}
        notifications={notifications}
        store={this.model.reduxStore}
        toggleModal={toggleModal}
      />
    );
  }
}


function ForkProject(props) {
  const { forkedTitle, handlers, namespaces, projects, toggleModal, user } = props;

  const [title, setTitle] = useState(forkedTitle);
  const [namespace, setNamespace] = useState("");
  const [fullNamespace, setFullNamespace] = useState(null);
  const [visibilities, setVisibilities] = useState(null);
  const [visibility, setVisibility] = useState(null);
  const [projectsPaths, setProjectsPaths] = useState([]);
  const [error, setError] = useState(null);

  const [forking, setForking] = useState(false);
  const [forkError, setForkError] = useState(null);
  const [forkVisibilityError, setForkVisibilityError] = useState(null);
  const [forkUrl, setForkUrl] = useState(null);

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

  // monitor namespace changes to calculate visibility
  useEffect(() => {
    const getVisibilities = async (namespace) => {
      // empty values to display fetching
      setVisibilities(null);
      setVisibility(null);

      // calculate visibilities values
      const availableVisibilities = await handlers.getVisibilities(namespace);
      setVisibilities(availableVisibilities?.visibilities ?? null);
      setVisibility(availableVisibilities?.default ?? null);
    };
    if (fullNamespace) {
      getVisibilities(fullNamespace);
    }
    else {
      setVisibilities(null);
      setVisibility(null);
    }
    // the useEffect uses the function handlers.getVisibility,
    // if we include it as a dependency the effect will be trigger many times
    // since the function changes in each rendering.
  }, [fullNamespace]); // eslint-disable-line

  // Monitor component mounted state -- helper to prevent illegal action when the fork takes long
  const mounted = useRef(false);
  useEffect(() => {
    // this keeps track of the component status
    mounted.current = true;
    return () => { mounted.current = false; };
  });

  // fork operations including fork, status check, redirect
  const fork = async () => {
    // TODO: re-add notifications after #1585 is addressed-- for some reason the project's sub-components
    // TODO: ("mrView", "issuesVIew", ...) trigger a re-render after adding a notification, losing local states.
    const { client, forkedId, history } = props;

    const path = slugFromTitle(title, true);
    // const startingLocation = history.location.pathname;
    setForking(true);
    setForkError(null);
    setForkUrl(null);
    try {
      const forked = await client.forkProject(forkedId, title, path, namespace);

      // handle non-blocking errors from pipelines and hooks
      if (forked.project.id && (forked.pipeline.errorData || forked.webhook.errorData)) {
        // build the final URL -- that requires forked.project(.id) to be available
        let newProjectData = { namespace: forked.project.namespace.full_path, path: forked.project.path };
        setForkUrl(Url.get(Url.pages.project, newProjectData));

        let verboseError; // = "Project forked, but ";
        if (forked.pipeline.errorData) {
          verboseError = "Pipeline creation failed: ";
          verboseError += "the forked project is available, but sessions may require building a Docker image.";
          throw new Error(verboseError);
        }
        if (forked.webhook.errorData) {
          verboseError = "Knowledge graph error: ";
          verboseError = "the forked project is available, but the knowledge graph needs to be activated later.";
          throw new Error(verboseError);
        }

        return null;
      }

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

      // set visibility value forked project
      let visibilityError;
      let visibilityErrorMessage;
      await client.setVisibility(forked.project.id, visibility)
        .catch((e) => {
          visibilityError = true;
          visibilityErrorMessage = e.errorData.message?.visibility_level ?
            `, ${e.errorData.message?.visibility_level[0]}` :
            `, not supported ${visibility} visibility.`;
          setForkVisibilityError(visibilityErrorMessage);
        });

      // Add notification. Mark it as read and redirect automatically only when the modal is still open
      let newProjectData = { namespace: forked.project.namespace.full_path, path: forked.project.path };
      const newUrl = Url.get(Url.pages.project, newProjectData);
      newProjectData.name = forked.project.name;

      if (mounted.current && !visibilityError) {
        // addForkNotification(notifications, newUrl, newProjectData, startingLocation, true, false);
        history.push(newUrl);
      }
      else if (mounted.current && visibilityError) {
        setForking(false); // finish forking
        setForkUrl(newUrl); // allow display the button to go to the forked project
        return;
      }
      else {
        // addForkNotification(notifications, newUrl, newProjectData, startingLocation, true, true,
        //  visibilityError ? { message: visibilityErrorMessage } : false);
      }
      return null; // this prevents further operations on non-mounted components
    }
    catch (e) {
      if (mounted.current) {
        setForkError(e.message);
        // addForkNotification(notifications, null, null, startingLocation, false, false);
      }
      else {
        // addForkNotification(notifications, null, null, startingLocation, false, true);
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

    if (target === "visibility") {
      const localValue = value ? value : "";
      setVisibility(localValue);
    }

    // ? reset fork error and url when typing
    setForkError(null);
    setForkUrl(null);
  };

  const setNamespaceP = (value) => {
    // it is necessary to save the complete namespace data to obtain the type for visibility purposes
    setFullNamespace(value);
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
      forkVisibilityError={forkVisibilityError}
      forkUrl={forkUrl}
      forking={forking}
      handlers={adjustedHandlers}
      namespace={namespace}
      namespaces={namespaces}
      projects={projects}
      title={title}
      toggleModal={toggleModal}
      user={user}
      visibilities={visibilities}
      visibility={visibility}
    />
  );
}

/**
 * Validate and decode query params.
 *
 * @param {object} params - query params
 * @returns {object} parsed parameters, validated and ready to be be used to pre-fill fields.
 */
function getDataFromParams(params) {
  // Unrecognized params: should we notify? Let's start without notifications.
  if (!params || !Object.keys(params).length || !params.data)
    return;
  const data = JSON.parse(atobUTF8(params.data));
  if (!data || !Object.keys(data).length)
    return;
  // validate metadata
  const validKeys = Object.keys(newProjectSchema.createEmpty().automated.data);
  const keys = Object.keys(data);
  for (let key of keys) {
    if (!validKeys.includes(key))
      throw new Error("unexpected project field in the encoded metadata: " + key);
  }
  return data;
}

class NewProject extends Component {
  constructor(props) {
    super(props);
    // Create model and reset inputs
    this.model = props.model;
    this.coordinator = new NewProjectCoordinator(props.client, this.model.subModel("newProject"),
      this.model.subModel("projects"));
    this.coordinator.setConfig(props.templates.custom, props.templates.repositories);
    this.projectsCoordinator = new ProjectsCoordinator(props.client, this.model.subModel("projects"));
    this.coordinator.resetInput();
    this.removeAutomated();
    if (!props.user.logged)
      this.coordinator.resetAutomated();

    // create handlers
    this.handlers = {
      createEncodedUrl: this.createEncodedUrl.bind(this),
      getNamespaces: this.getNamespaces.bind(this),
      getTemplates: this.getTemplates.bind(this),
      getUserTemplates: this.getUserTemplates.bind(this),
      goToProject: this.goToProject.bind(this),
      onSubmit: this.onSubmit.bind(this),
      removeAutomated: this.removeAutomated.bind(this),
      setNamespace: this.setNamespace.bind(this),
      setProperty: this.setProperty.bind(this),
      setTemplateProperty: this.setTemplateProperty.bind(this),
      setVariable: this.setVariable.bind(this),
    };

    // Handle optional param used to pre-fill inputs
    if (!props.user.logged)
      return;
    const params = getSearchParams();
    try {
      const data = getDataFromParams(params);
      if (data)
        this.coordinator.setAutomated(data);

      // do not update url if is importing a dataset
      if (!props.importingDataset) {
        const newUrl = Url.get(Url.pages.project.new);
        this.props.history.push(newUrl);
      }
    }
    catch (e) {
      this.coordinator.setAutomated(null, e);
    }
  }

  removeAutomated(manuallyReset = true) {
    this.coordinator.resetAutomated(manuallyReset);
  }

  createEncodedUrl(data) {
    if (!data || !Object.keys(data).length)
      return Url.get(Url.pages.project.new, {}, true);
    const encodedContent = btoaUTF8(JSON.stringify(data));
    return Url.get(Url.pages.project.new, { data: encodedContent }, true);
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

  async calculateVisibilities(namespace) {
    // temporarily reset visibility metadata
    this.coordinator.resetVisibility(namespace);
    const availableVisibilities = await this.projectsCoordinator.getVisibilities(namespace);
    this.coordinator.setVisibilities(availableVisibilities, namespace);
  }

  refreshUserProjects() {
    this.projectsCoordinator.getFeatured();
  }

  setProperty(property, value) {
    this.coordinator.setProperty(property, value);
  }

  setNamespace(namespace) {
    this.setProperty("namespace", namespace.full_path);
    this.calculateVisibilities(namespace);
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

  sendProjectToAddDataset(projectPath) {
    if (projectPath)
      this.props.startImportDataset(projectPath);
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
          const slug = `${creation.newNamespace}/${creation.newNameSlug}`;
          if (this.props.importingDataset) {
            this.sendProjectToAddDataset(slug);
          }
          else {
            // continue regular process
            this.props.history.push(`/projects/${slug}`);
          }
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
        logged: state.user.logged,
        username: state.user.data && state.user.data.username ? state.user.data.username : null
      },
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
      importingDataset={this.props.importingDataset}
    />;
  }
}


export { NewProject, CUSTOM_REPO_NAME, ForkProjectMapper as ForkProject };

// test only
export { getDataFromParams };
