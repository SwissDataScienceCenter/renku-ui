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

import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  Component,
} from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useHistory } from "react-router";

import {
  NewProject as NewProjectPresent,
  ForkProject as ForkProjectPresent,
} from "./ProjectNew.present";
import {
  validateTitle,
  checkTitleDuplicates,
  NewProjectCoordinator,
} from "./ProjectNew.state";
import {
  gitLabUrlFromProfileUrl,
  slugFromTitle,
} from "../../utils/helpers/HelperFunctions";
import { Url, getSearchParams } from "../../utils/helpers/url";
import { atobUTF8, btoaUTF8 } from "../../utils/helpers/Encoding";
import { newProjectSchema } from "../../model/RenkuModels";
import AppContext from "../../utils/context/appContext";
import useGetNamespaces from "../../utils/customHooks/UseGetNamespaces";
import useGetUserProjects from "../../utils/customHooks/UseGetProjects";
import useGetVisibilities from "../../utils/customHooks/UseGetVisibilities";
import { Loader } from "../../components/Loader";

const CUSTOM_REPO_NAME = "Custom";

/** helper function -- fork notifications */
// TODO: restore after #1585
// eslint-disable-next-line
function addForkNotification(
  notifications,
  url,
  info,
  startingLocation,
  success = true,
  excludeStarting = false,
  visibilityException = false
) {
  if (success && !visibilityException) {
    const locations = excludeStarting ? [url] : [url, startingLocation];
    notifications.addSuccess(
      notifications.Topics.PROJECT_FORKED,
      `Project ${info.name} successfully created.`,
      url,
      "Show project",
      locations,
      `The project has been successfully forked to ${info.namespace}/${info.path}`
    );
  } else if (visibilityException) {
    const locations = excludeStarting ? [url] : [url, startingLocation];
    notifications.addWarning(
      notifications.Topics.PROJECT_FORKED,
      `Project ${info.name} has been created with an exception.`,
      url,
      "Show project",
      locations,
      `The project has been successfully forked to ${info.namespace}/${info.path}
      although it was not possible to configure the visibility${visibilityException?.message}`
    );
  } else {
    const locations = excludeStarting ? [] : [startingLocation];
    notifications.addError(
      notifications.Topics.PROJECT_FORKED,
      "Forking operation did not complete.",
      startingLocation,
      "Try again",
      locations,
      "The fork operation did not run to completion. It is possible the project has been created, but some" +
        "elements may have not been cloned properly."
    );
  }
}

function ForkProject(props) {
  const { client, forkedId, forkedTitle, projectVisibility, toggleModal } =
    props;
  const namespaces = useGetNamespaces(true);
  const { projectsMember, isFetchingProjects } = useGetUserProjects();

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

  const { availableVisibilities, isFetchingVisibilities } = useGetVisibilities(
    fullNamespace,
    projectVisibility
  );
  const { logged, data: { username } = null } = useSelector(
    (state) => state.stateModel.user
  );

  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (!logged) {
      const loginUrl = Url.get(Url.pages.login.link, {
        pathname: location.pathname,
      });
      history.push(loginUrl);
    }
  }, []); //eslint-disable-line

  // Monitor changes to projects list
  useEffect(() => {
    if (!projectsMember || !projectsMember.length) setProjectsPaths([]);
    else
      setProjectsPaths(
        projectsMember.map((project) =>
          project.path_with_namespace.toLowerCase()
        )
      );
  }, [projectsMember]);

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
    const duplicateError = checkTitleDuplicates(
      title,
      namespace,
      projectsPaths
    );
    if (duplicateError) {
      setError(
        "Title produces a project identifier (" +
          slugFromTitle(title, true) +
          ") that is already taken in the selected namespace. Please select a different title or namespace."
      );
      return;
    }
    setError(null);
  }, [title, namespace, projectsPaths]);

  // monitor namespace changes to calculate visibility
  useEffect(() => {
    const getVisibilities = async () => {
      // empty values to display fetching
      setVisibilities(null);
      setVisibility(null);

      // calculate visibilities values
      setVisibilities(availableVisibilities ?? null);
      setVisibility(availableVisibilities?.default ?? null);
    };
    if (fullNamespace && !isFetchingVisibilities) {
      getVisibilities(fullNamespace);
    } else {
      setVisibilities(null);
      setVisibility(null);
    }
  }, [fullNamespace, availableVisibilities, isFetchingVisibilities]); // eslint-disable-line

  // Monitor component mounted state -- helper to prevent illegal action when the fork takes long
  const mounted = useRef(false);
  useEffect(() => {
    // this keeps track of the component status
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  });

  // fork operations including fork, status check, redirect
  const fork = async () => {
    // TODO: re-add notifications after #1585 is addressed-- for some reason the project's sub-components

    const path = slugFromTitle(title, true);
    // const startingLocation = history.location.pathname;
    setForking(true);
    setForkError(null);
    setForkUrl(null);
    try {
      const forked = await client.forkProject(
        forkedId,
        title,
        path,
        namespace,
        props.model.reduxStore
      );

      // handle non-blocking errors from pipelines and hooks
      if (
        forked.project.id &&
        (forked.pipeline.errorData || forked.webhook.errorData)
      ) {
        // build the final URL -- that requires forked.project(.id) to be available
        let newProjectData = {
          namespace: forked.project.namespace.full_path,
          path: forked.project.path,
        };
        setForkUrl(Url.get(Url.pages.project, newProjectData));

        let verboseError; // = "Project forked, but ";
        if (forked.pipeline.errorData) {
          verboseError = "Pipeline creation failed: ";
          verboseError +=
            "the forked project is available, but sessions may require building a Docker image.";
          throw new Error(verboseError);
        }
        if (forked.webhook.errorData) {
          verboseError = "Knowledge graph error: ";
          verboseError =
            "the forked project is available, but the knowledge graph needs to be activated later.";
          throw new Error(verboseError);
        }

        return null;
      }

      // wait for operations to finish
      let count;
      const THRESHOLD = 100,
        DELTA = 3000;
      for (count = 0; count < THRESHOLD; count++) {
        await new Promise((r) => setTimeout(r, DELTA)); // sleep
        const forkOperation = await client.getProjectStatus(forked.project.id);
        if (forkOperation === "finished") break;
        else if (forkOperation === "failed" || forkOperation === "error")
          throw new Error("Cloning operation failed");
        else if (count === THRESHOLD - 1)
          throw new Error("Cloning is taking too long");
      }

      // set visibility value forked project
      let visibilityError;
      let visibilityErrorMessage;
      await client.setVisibility(forked.project.id, visibility).catch((e) => {
        visibilityError = true;
        visibilityErrorMessage = e.errorData.message?.visibility_level
          ? `, ${e.errorData.message?.visibility_level[0]}`
          : `, not supported ${visibility} visibility.`;
        setForkVisibilityError(visibilityErrorMessage);
      });

      // Add notification. Mark it as read and redirect automatically only when the modal is still open
      let newProjectData = {
        namespace: forked.project.namespace.full_path,
        path: forked.project.path,
      };
      const newUrl = Url.get(Url.pages.project, newProjectData);
      newProjectData.name = forked.project.name;

      if (mounted.current && !visibilityError) {
        // addForkNotification(notifications, newUrl, newProjectData, startingLocation, true, false);
        history.push(newUrl);
      } else if (mounted.current && visibilityError) {
        setForking(false); // finish forking
        setForkUrl(newUrl); // allow display the button to go to the forked project
        return;
      } else {
        // addForkNotification(notifications, newUrl, newProjectData, startingLocation, true, true,
        //  visibilityError ? { message: visibilityErrorMessage } : false);
      }
      return null; // this prevents further operations on non-mounted components
    } catch (e) {
      if (mounted.current) {
        setForkError(e.message);
        // addForkNotification(notifications, null, null, startingLocation, false, false);
      } else {
        // addForkNotification(notifications, null, null, startingLocation, false, true);
      }
    }
    if (mounted.current) setForking(false);
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
    getNamespaces: namespaces?.refetchNamespaces,
    setNamespace: setNamespaceP,
    setProperty: setPropertyP,
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
      projects={projectsMember}
      title={title}
      toggleModal={toggleModal}
      user={{ logged, username }}
      visibilities={visibilities}
      visibility={visibility}
      isFetchingProjects={isFetchingProjects}
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
  if (!params || !Object.keys(params).length || !params.data) return;
  const data = JSON.parse(atobUTF8(params.data));
  if (!data || !Object.keys(data).length) return;
  // validate metadata
  const validKeys = Object.keys(newProjectSchema.createEmpty().automated.data);
  const keys = Object.keys(data);
  for (let key of keys) {
    if (!validKeys.includes(key))
      throw new Error(
        "unexpected project field in the encoded metadata: " + key
      );
  }
  return data;
}

// temporal solution to include coordinator
class NewProjectWrapper extends Component {
  constructor(props) {
    super(props);
    this.coordinator = new NewProjectCoordinator(
      this.props.client,
      this.props.model.subModel("newProject"),
      this.props.model.subModel("projects")
    );
  }

  render() {
    if (!this.props.client || !this.props.model) return <Loader />;
    return <NewProject {...this.props} coordinator={this.coordinator} />;
  }
}

function NewProject(props) {
  const { model, importingDataset, startImportDataset, coordinator } = props;
  const { params } = useContext(AppContext);
  const history = useHistory();
  const user = useSelector((state) => state.stateModel.user);
  const newProject = useSelector((state) => state.stateModel.newProject);
  const [namespace, setNamespace] = useState(null);
  const [automatedData, setAutomatedData] = useState(null);
  const namespaces = useGetNamespaces(true);
  const { projectsMember, isFetchingProjects, refetchUserProjects } =
    useGetUserProjects();
  const { availableVisibilities, isFetchingVisibilities } =
    useGetVisibilities(namespace);

  /*
   * Start fetching templates and get automatedData
   */
  useEffect(() => {
    if (!coordinator || !user.logged) return;
    coordinator.setConfig(
      params["TEMPLATES"].custom,
      params["TEMPLATES"].repositories
    );
    coordinator.resetInput();
    coordinator.getTemplates();
    removeAutomated();
    extractAutomatedData();
  }, []); // eslint-disable-line  react-hooks/exhaustive-deps

  /*
   * Start Auto fill form when namespaces are ready
   */
  useEffect(
    () => {
      if (
        automatedData &&
        !namespaces?.fetching &&
        !newProject.automated.finished
      )
        coordinator?.setAutomated(
          automatedData,
          undefined,
          namespaces,
          availableVisibilities,
          setNamespace
        );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      automatedData,
      namespaces.list,
      namespaces.fetching,
      newProject.automated.finished,
    ]
  );

  /*
   * Validate form when projects/namespace are ready or the auto fill form finished
   */
  useEffect(
    () => {
      if (
        !user.logged ||
        namespaces.fetching ||
        (newProject.automated.received && !newProject.automated.finished)
      )
        return;
      validateForm(null, null, true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      namespaces.list,
      namespaces.fetching,
      projectsMember,
      isFetchingProjects,
      newProject.automated.received,
      newProject.automated.finished,
    ]
  );

  /*
   * Calculate visibilities when namespace change
   */
  useEffect(() => {
    if (!namespace || !user.logged) return;

    if (!availableVisibilities || isFetchingVisibilities) {
      coordinator?.resetVisibility(namespace);
      return;
    }
    coordinator?.setVisibilities(availableVisibilities, namespace);
    setProperty("namespace", namespace.full_path);
    setProperty("visibility", availableVisibilities.default);
  }, [namespace, availableVisibilities, isFetchingVisibilities]); // eslint-disable-line react-hooks/exhaustive-deps

  const extractAutomatedData = () => {
    const searchParams = getSearchParams();
    try {
      const data = getDataFromParams(searchParams);
      if (data) {
        setAutomatedData(data);
        if (!importingDataset) {
          const newUrl = Url.get(Url.pages.project.new);
          history.push(newUrl);
        }
      }
    } catch (e) {
      coordinator.setAutomated(null, e);
    }
  };

  const removeAutomated = (manuallyReset = true) => {
    coordinator?.resetAutomated(manuallyReset);
  };

  const validateForm = (
    newInput = null,
    newTemplates = null,
    update = null
  ) => {
    const projects = { members: projectsMember, fetching: isFetchingProjects };
    coordinator?.validate(
      newInput,
      newTemplates,
      update,
      projects,
      namespaces,
      isFetchingVisibilities
    );
  };

  const createEncodedUrl = (data) => {
    if (!data || !Object.keys(data).length)
      return Url.get(Url.pages.project.new, {}, true);
    const encodedContent = btoaUTF8(JSON.stringify(data));
    return Url.get(Url.pages.project.new, { data: encodedContent }, true);
  };

  const getNamespaces = () => {
    namespaces?.refetchNamespaces();
  };

  const getTemplates = async () => {
    return await coordinator?.getTemplates(null, false);
  };

  const getUserTemplates = () => {
    const targetRepository = model.get("newProject.meta.userTemplates");
    const repositories = [
      {
        name: CUSTOM_REPO_NAME,
        url: targetRepository.url,
        ref: targetRepository.ref,
      },
    ];
    return coordinator.getTemplates(repositories, true);
  };

  const refreshUserProjects = () => {
    refetchUserProjects();
  };

  const setProperty = (property, value) => {
    coordinator?.setProperty(property, value);
    let updateObj = { input: { [property]: value } };
    validateForm(updateObj, null, true);
  };

  const setNamespaceProperty = (namespace) => {
    setNamespace(namespace);
    setProperty("namespace", namespace.full_path);
  };

  const setTemplateProperty = (property, value) => {
    coordinator?.setTemplateProperty(property, value);
  };

  const setVariable = (variable, value) => {
    coordinator?.setVariable(variable, value);
  };

  const resetCreationResult = () => {
    coordinator?.resetCreationResult();
  };

  const goToProject = () => {
    const slug = coordinator?.getSlugAndReset();
    history.push(`/projects/${slug}`);
  };

  const sendProjectToAddDataset = (projectPath) => {
    if (projectPath) startImportDataset(projectPath);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // validate -- we do this cause we don't show errors on pristine variables
    if (coordinator?.invalidatePristine()) return;
    let validation = coordinator?.getValidation();
    if (
      Object.keys(validation.errors).length ||
      Object.keys(validation.warnings).length
    )
      return;

    // submit
    const gitlabUrl = gitLabUrlFromProfileUrl(user.data.web_url);
    coordinator?.postProject(gitlabUrl).then((result) => {
      const { creation } = result.meta;
      if (creation.created) {
        refreshUserProjects();
        if (!creation.kgError && !creation.projectError) {
          const slug = `${creation.newNamespace}/${creation.newNameSlug}`;
          if (importingDataset) sendProjectToAddDataset(slug);
          else history.push(`/projects/${slug}`);
          resetCreationResult();
        }
      }
    });
  };

  const onAvatarChange = (avatarFile) => {
    setProperty("avatar", avatarFile);
  };

  // create handlers
  const handlers = {
    createEncodedUrl,
    getNamespaces,
    getTemplates,
    getUserTemplates,
    goToProject,
    onAvatarChange,
    onSubmit,
    removeAutomated,
    resetCreationResult,
    setNamespace: setNamespaceProperty,
    setProperty,
    setTemplateProperty,
    setVariable,
  };

  const newProps = {
    ...newProject,
    handlers,
    importingDataset,
    isFetchingProjects,
    namespaces,
    user: {
      logged: user.logged,
      username: user.data && user.data.username ? user.data.username : null,
    },
  };

  if (!coordinator) return <Loader />;

  return <NewProjectPresent {...newProps} />;
}

export { NewProjectWrapper as NewProject, CUSTOM_REPO_NAME, ForkProject };
// test only
export { getDataFromParams };
