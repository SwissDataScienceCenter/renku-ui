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

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom-v5-compat";

import { useLoginUrl } from "../../authentication/useLoginUrl.hook";
import { Loader } from "../../components/Loader";
import { newProjectSchema } from "../../model/RenkuModels";
import AppContext from "../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../utils/context/appParams.constants";
import useGetNamespaces from "../../utils/customHooks/UseGetNamespaces";
import useGetUserProjects from "../../utils/customHooks/UseGetProjects";
import useGetVisibilities from "../../utils/customHooks/UseGetVisibilities";
import useLegacySelector from "../../utils/customHooks/useLegacySelector.hook";
import { arrayStringEquals } from "../../utils/helpers/ArrayUtils";
import { atobUTF8, btoaUTF8 } from "../../utils/helpers/Encoding";
import {
  gitLabUrlFromProfileUrl,
  slugFromTitle,
} from "../../utils/helpers/HelperFunctions";
import { Url, getSearchParams } from "../../utils/helpers/url";
import {
  ForkProject as ForkProjectPresent,
  NewProject as NewProjectPresent,
} from "./ProjectNew.present";
import {
  NewProjectCoordinator,
  checkTitleDuplicates,
  validateTitle,
} from "./ProjectNew.state";

const CUSTOM_REPO_NAME = "Custom";

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
  const { logged, data: { username } = null } = useLegacySelector(
    (state) => state.stateModel.user
  );

  const loginUrl = useLoginUrl();

  const navigate = useNavigate();

  useEffect(() => {
    if (!logged) {
      window.location.assign(loginUrl);
    }
  }, [logged, loginUrl]);

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
  }, [fullNamespace, availableVisibilities, isFetchingVisibilities]);

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
          verboseError = "Indexing error: ";
          verboseError =
            "the forked project is available, but indexing will need to be activated manually.";
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
        navigate(newUrl);
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

function NewProjectWrapper(props) {
  const { client, model } = useContext(AppContext);

  const user = useLegacySelector((state) => state.stateModel.user);

  const coordinator = useMemo(
    () =>
      new NewProjectCoordinator(
        client,
        model.subModel("newProject"),
        model.subModel("projects")
      ),
    [client, model]
  );

  if (!client || !model) return <Loader />;
  return (
    <NewProject
      {...props}
      model={model}
      user={user}
      client={client}
      coordinator={coordinator}
    />
  );
}

function NewProject(props) {
  const { model, importingDataset, startImportDataset, coordinator } = props;
  const { params } = useContext(AppContext);
  const navigate = useNavigate();
  const user = useLegacySelector((state) => state.stateModel.user);
  const newProject = useLegacySelector((state) => state.stateModel.newProject);
  const [namespace, setNamespace] = useState(null);
  const [automatedData, setAutomatedData] = useState(null);
  const namespaces = useGetNamespaces(true);
  const { projectsMember, isFetchingProjects, refetchUserProjects } =
    useGetUserProjects();
  const { availableVisibilities, isFetchingVisibilities } =
    useGetVisibilities(namespace);
  const [metaValidation, setMetaValidation] = useState({
    errors: {},
    warnings: {},
  });

  const validateForm = useCallback(
    (newInput = null, newTemplates = null) => {
      const projects = {
        members: projectsMember,
        fetching: isFetchingProjects,
      };
      if (coordinator == null) return;
      const result = coordinator.validate(
        newInput,
        newTemplates,
        false, // we manage validation state locally, not in the coordinator
        projects,
        namespaces,
        isFetchingVisibilities
      );
      const { errors, warnings } = result;
      const mv = { errors: errors.$set, warnings: warnings.$set };
      if (
        arrayStringEquals(
          Object.keys(mv.errors),
          Object.keys(metaValidation.errors)
        ) &&
        arrayStringEquals(
          Object.keys(mv.warnings),
          Object.keys(metaValidation.warnings)
        ) &&
        arrayStringEquals(
          Object.values(mv.errors),
          Object.values(metaValidation.errors)
        ) &&
        arrayStringEquals(
          Object.values(mv.warnings),
          Object.values(metaValidation.warnings)
        )
      )
        return;
      setMetaValidation(mv);
    },
    [
      coordinator,
      isFetchingProjects,
      isFetchingVisibilities,
      namespaces,
      projectsMember,
      metaValidation,
    ]
  );

  const extractAutomatedData = useCallback(() => {
    const searchParams = getSearchParams();
    try {
      const data = getDataFromParams(searchParams);
      if (data) {
        setAutomatedData(data);
        if (!importingDataset) {
          const newUrl = Url.get(Url.pages.project.new);
          navigate(newUrl);
        }
      }
    } catch (e) {
      // This usually happens when the link is wrong and the base64 string is broken
      coordinator.setAutomated(null, e);
    }
  }, [coordinator, importingDataset, navigate]);

  const removeAutomated = useCallback(
    (manuallyReset = true) => {
      coordinator?.resetAutomated(manuallyReset);
    },
    [coordinator]
  );

  /*
   * Start fetching templates and get automatedData. We can execute that only once
   */
  useEffect(() => {
    removeAutomated();
    if (!coordinator || !user.logged) return;
    const templates = params?.TEMPLATES ?? DEFAULT_APP_PARAMS.TEMPLATES;
    coordinator.setConfig(templates.custom, templates.repositories);
    coordinator.resetInput();
    coordinator.getTemplates();
    extractAutomatedData();
  }, [coordinator, extractAutomatedData, user, params, removeAutomated]);

  /*
   * Start Auto fill form when namespaces are ready
   */
  useEffect(() => {
    if (
      !automatedData ||
      newProject.automated.finished ||
      !namespaces.fetched ||
      availableVisibilities == null
    )
      return;
    coordinator?.setAutomated(
      automatedData,
      undefined,
      namespaces,
      availableVisibilities,
      setNamespace
    );
  }, [
    automatedData,
    namespaces,
    availableVisibilities,
    coordinator,
    newProject.automated.finished,
  ]);

  /*
   * Validate form when projects/namespace are ready or the auto fill form finished
   */
  useEffect(() => {
    if (!user.logged) return;
    if (
      !namespaces.fetched ||
      (newProject.automated.received && !newProject.automated.finished)
    )
      return;
    validateForm(null, null);
  }, [
    user.logged,
    validateForm,
    namespaces.fetched,
    newProject.automated.received,
    newProject.automated.finished,
  ]);

  const setProperty = useCallback(
    (property, value) => {
      coordinator?.setProperty(property, value);
      let updateObj = { input: { [property]: value } };
      validateForm(updateObj, null);
    },
    [coordinator, validateForm]
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
    if (newProject.input.namespace !== namespace.full_path) {
      setProperty("namespace", namespace.full_path);
      setProperty("visibility", availableVisibilities.default);
    }
    if (
      !availableVisibilities.visibilities.includes(newProject.input.visibility)
    ) {
      setProperty("visibility", availableVisibilities.default);
    }
  }, [
    availableVisibilities,
    coordinator,
    isFetchingVisibilities,
    namespace,
    newProject.input.namespace,
    newProject.input.visibility,
    setProperty,
    user.logged,
  ]);

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
    navigate(`/projects/${slug}`);
  };

  const sendProjectToAddDataset = (projectPath) => {
    if (projectPath) startImportDataset(projectPath);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // validate -- we do this cause we don't show errors on pristine variables
    if (coordinator?.invalidatePristine()) return;
    if (
      Object.keys(metaValidation.errors).length ||
      Object.keys(metaValidation.warnings).length
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
          else navigate(`/projects/${slug}`);
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
  const newProjectMeta = {
    ...newProject.meta,
    ...{ validation: metaValidation },
  };
  const mergedNewProject = {
    ...newProject,
    ...{ meta: newProjectMeta },
  };
  const newProps = {
    ...mergedNewProject,
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

export { CUSTOM_REPO_NAME, ForkProject, NewProjectWrapper as NewProject };
// test only
export { getDataFromParams };
