/*!
 * Copyright 2019 - Swiss Data Science Center (SDSC)
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
 *  Notebooks.state.js
 *  Notebooks controller code.
 */

import { API_ERRORS } from "../api-client/errors";
import { parseINIString } from "../utils/helpers/HelperFunctions";

const POLLING_INTERVAL = 3000;
const IMAGE_BUILD_JOB = "image_build";
const RENKU_INI_PATH = ".renku/renku.ini";
const RENKU_INI_SECTION_LEGACY = `renku "interactive"`;
const RENKU_INI_SECTION = "interactive";

const PIPELINE_TYPES = {
  anonymous: "registries",
  logged: "jobs",
  customImage: "none"
};

const VALID_SETTINGS = [
  "image"
];

const SESSIONS_PREFIX = "interactive.";

const ExpectedAnnotations = {
  domain: "renku.io",
  "renku.io": {
    required: [
      "branch", "commit-sha", "default_image_used", "namespace", "gitlabProjectId", "projectName", "repository"
    ],
    default: {
      "branch": "unknown",
      "commit-sha": "00000000",
      "default_image_used": false,
      "namespace": "unknown",
      "gitlabProjectId": 0,
      "projectName": "unknown",
      "repository": "https://none"
    }
  }
};

const NotebooksHelper = {
  /**
   * Compute the status of a notebook
   *
   * @param {Object} data - either the notebook or the notebook.status object as returned
   *   by the GET /servers API
   */
  getStatus: (data) => {
    let status = data;
    if (data.status)
      status = data.status;

    if (status.ready)
      return "running";
    if (status.stopping)
      return "stopping";
    if (status.step === "Unschedulable")
      return "error";
    return "pending";
  },

  /**
   * Add missing annotations from the notebook servers
   *
   * @param {object} annotations
   * @param {string} [domain]
   */
  cleanAnnotations: (annotations, domain = ExpectedAnnotations.domain) => {
    let cleaned = {};
    const prefix = `${domain}/`;
    ExpectedAnnotations[domain].required.forEach(annotation => {
      if (annotations[prefix + annotation] !== undefined) {
        let value = annotations[prefix + annotation];
        // convert text boolean where a boolean is expected
        if (annotation === "default_image_used") {
          const origValue = annotations[prefix + annotation];
          if (origValue && typeof origValue === "string" && origValue.toLowerCase() === "true")
            value = true;
          else
            value = false;
        }
        cleaned[annotation] = value;
      }
      else {
        cleaned[annotation] = ExpectedAnnotations[domain].default[annotation];
      }
    });

    return { ...cleaned };
  },

  /**
   * Get options and default values from notebooks and project options
   *
   * @param {object} notebooksOptions - notebook options as return by the "GET server_options" API.
   * @param {object} projectOptions - project options as returned by the "GET config.show" API.
   * @param {string} [projectPrefix] - project option key prefix used by config to identify session options.
   */
  getProjectDefault: (notebooksOptions, projectOptions, projectPrefix = SESSIONS_PREFIX) => {
    let returnObject = {};
    if (!notebooksOptions || !projectOptions)
      return returnObject;

    // Conversion helper
    const convert = (value) => {
      // return boolean
      if (value === true || value === false)
        return value;

      // convert stringy boolean
      if (value && value.toLowerCase() === "true")
        return true;

      else if (value && value.toLowerCase() === "false")
        return false;

      // convert stringy number
      else if (!isNaN(value))
        return parseFloat(value);

      return value;
    };

    // Define options
    const sortedOptions = Object.keys(notebooksOptions)
      .sort((a, b) => parseInt(notebooksOptions[a].order) - parseInt(notebooksOptions[b].order));
    let unknownOptions = [];

    // Get RenkuLab defaults
    let globalDefaults = [...sortedOptions].reduce((defaults, option) => {
      if ("default" in notebooksOptions[option])
        defaults[option] = notebooksOptions[option].default;
      return defaults;
    }, {});

    // Overwrite renku defaults
    if (projectOptions && projectOptions.default && Object.keys(projectOptions.default)) {
      for (const [key, value] of Object.entries(projectOptions.default)) {
        if (key.startsWith(projectPrefix)) {
          const option = key.substring(projectPrefix.length);
          if (!sortedOptions.includes(option))
            unknownOptions.push(option);
          globalDefaults[option] = convert(value);
        }
      }
    }

    // Get project defaults
    let projectDefaults = [];
    if (projectOptions && projectOptions.config && Object.keys(projectOptions.config)) {
      for (const [key, value] of Object.entries(projectOptions.config)) {
        if (key.startsWith(projectPrefix)) {
          const option = key.substring(projectPrefix.length);
          if (!sortedOptions.includes(option))
            unknownOptions.push(option);
          projectDefaults[option] = convert(value);
        }
      }
    }

    return {
      defaults: {
        global: globalDefaults,
        project: projectDefaults
      },
      options: {
        known: sortedOptions,
        unknown: unknownOptions
      }
    };
  },

  /**
   * Parse project options raw data from the .ini file to a JS object
   *
   * @param {string} data - raw file content
   */
  // TODO: use the getProjectDefault function after switching to the "GET config.show" API
  parseProjectOptions: (data) => {
    let projectOptions = {};

    // try to parse the data
    let parsedData;
    try {
      parsedData = parseINIString(data);
    }
    catch (error) {
      parsedData = {};
    }
    // check single props when the environment sections is available
    let parsedOptions = parsedData[RENKU_INI_SECTION];
    // check also the previous section name for compatibility reasons
    if (!parsedOptions)
      parsedOptions = parsedData[RENKU_INI_SECTION_LEGACY];
    if (parsedOptions) {
      Object.keys(parsedOptions).forEach(parsedOption => {
        // treat "defaultUrl" as "default_url" to allow name consistency in the the .ini file
        let option = parsedOption;
        if (parsedOption === "defaultUrl")
          option = "default_url";

        // convert boolean and numbers
        let value = parsedOptions[parsedOption];
        if (value && value.toLowerCase() === "true")
          projectOptions[option] = true;

        else if (value && value.toLowerCase() === "false")
          projectOptions[option] = false;

        else if (!isNaN(value))
          projectOptions[option] = parseFloat(value);

        else
          projectOptions[option] = value;

      });
    }

    return projectOptions;
  },

  /**
   * Check if a project option can be applied according to the deployment global options
   *
   * @param {object} globalOptions - global options object
   * @param {string} currentOption - current project option name
   * @param {string} currentValue - current project option value
   */
  checkOptionValidity: (globalOptions, currentOption, currentValue) => {
    // default_url is a special case and any string will fit
    if (currentOption === "default_url") {
      if (typeof currentValue === "string")
        return true;
      return false;
    }

    const globalOption = globalOptions[currentOption];
    // the project option must be part of the global options
    if (!globalOption)
      return false;

    // non-enum options require only type-check
    if (globalOption.type !== "enum") {
      if (globalOption.type === "boolean") {
        if (typeof currentValue === "boolean")
          return true;
        return false;
      }
      else if (globalOption.type === "float" || globalOption.type === "int") {
        if (typeof currentValue === "number")
          return true;
        return false;
      }
      return false;
    }

    // enum options must have a value valid for the corresponding global options
    if (globalOption.options && globalOption.options.length && globalOption.options.includes(currentValue))
      return true;

    return false;
  },

  /**
   * Check if a project setting is valid
   *
   * @param {string} name - setting name
   * @param {string} value - setting value
   */
  checkSettingValidity: (name, value) => {
    if (!name || typeof name !== "string" || !name.length)
      return false;
    if (!VALID_SETTINGS.includes(name))
      return false;
    if (!value || typeof value !== "string" || !value.length)
      return false;

    return true;
  },

  /**
   * Check whether the image is available or not. This is done by checking the pipeline object, but it's not
   * intuitive how to verify it when the user has no permissions (registry data are stored in the pipeline in
   * that case)
   *
   * @param {object} pipelines - pipelines object as stored in redux.
   * @returns {boolean} image availability.
   */
  checkPipelineAvailability: (pipelines) => {
    const mainPipeline = pipelines.main;

    if (pipelines.type === PIPELINE_TYPES.customImage)
      return true;

    if (pipelines.type === PIPELINE_TYPES.logged) {
      if (mainPipeline.status === "success")
        return true;
    }
    else if (pipelines.type === PIPELINE_TYPES.anonymous) {
      if (mainPipeline && mainPipeline.path)
        return true;
    }

    return false;
  },

  pipelineTypes: PIPELINE_TYPES,
  pollingInterval: POLLING_INTERVAL,
  sessionConfigPrefix: SESSIONS_PREFIX,
  validSettings: VALID_SETTINGS
};

class NotebooksCoordinator {
  constructor(client, model, userModel) {
    this.client = client;
    this.model = model;
    this.userModel = userModel;
  }

  /**
   * Reset notebook Schema. Controller logic may be improved to avoid invoking this
   */
  reset() {
    this.model.setObject({
      notebooks: {
        fetched: null,
        lastParameters: null
      },
      filters: {
        namespace: null,
        project: null,
        branch: { $set: {} },
        commit: { $set: {} },
        options: { $set: {} },
        objectStoresConfiguration: { $set: [] },
      },
      pipelines: {
        fetched: null,
        lastParameters: null,
        lastMainId: null
      },
      options: {
        fetched: null
      }
    });
  }

  // * Filters * //
  /**
   * Set filtering parameters
   *
   * @param {Object} data - the filters to be set
   * @param {string} data.namespace - full namespace path
   * @param {string} data.project - full project path
   * @param {string|Object} data.branch - branch name or branch data as return by gitlab api
   * @param {string|Object} data.defaultBranch - default branch of the project
   * @param {string|Object} data.commit - commit full id or commit data as return by gitlab api
   */
  setNotebookFilters(data = {}) {
    let filters = {};
    if (data.namespace !== undefined)
      filters.namespace = data.namespace;
    if (data.project !== undefined)
      filters.project = data.project;
    if (data.defaultBranch)
      filters.defaultBranch = data.defaultBranch;
    if (data.branch !== undefined)
      data.branch instanceof Object ? filters.branch = data.branch : filters.branch = { name: data.branch };
    if (data.commit !== undefined)
      data.commit instanceof Object ? filters.commit = data.commit : filters.commit = { id: data.commit };

    this.model.setObject({ filters });
  }

  setBranch(branch) {
    this.model.setObject({
      notebooks: { fetched: null },
      filters: { branch: { $set: branch } }
    });
  }

  setCommit(commit) {
    this.model.setObject({
      notebooks: { fetched: null },
      pipelines: { fetched: null },
      filters: { commit: { $set: commit } }
    });
    this.fetchNotebooks();
  }

  setMergedBranches(value) {
    this.model.set("filters.includeMergedBranches", value);
  }

  setDisplayedCommits(value) {
    this.model.set("filters.displayedCommits", value);
  }

  setNotebookOptions(option, value) {
    this.model.set(`filters.options.${option}`, value);
  }

  setObjectStoresConfiguration(value) {
    this.model.set("filters.objectStoresConfiguration", value);
  }

  getQueryFilters() {
    const filters = this.model.get("filters");
    return {
      namespace: filters.namespace,
      project: filters.project,
      branch: filters.branch && filters.branch.name ? filters.branch.name : null,
      commit: filters.commit && filters.commit.id ? filters.commit.id : null
    };
  }


  // * Fetch data * //
  fetchNotebooks() {
    const fetching = this.model.get("notebooks.fetching");
    if (fetching)
      return;

    // get filters
    const filters = this.getQueryFilters();
    this.model.setObject({
      notebooks: {
        fetching: true,
        lastParameters: JSON.stringify(filters)
      }
    });

    // get user status
    const anonymous = this.userModel.get("logged") ?
      false :
      true;

    // get notebooks
    return this.client.getNotebookServers(
      filters.namespace, filters.project, filters.branch, null, anonymous)
      .then(resp => {
        let updatedNotebooks = { fetching: false };
        // check if result is still valid
        if (!this.model.get("filters.discard")) {
          const filters = this.getQueryFilters();
          if (this.model.get("notebooks.lastParameters") === JSON.stringify(filters)) {
            updatedNotebooks.fetched = new Date();
            const currentServers = this.model.get("notebooks.all");

            // check if the stopping status exist to attach to the current object
            // TODO: this should be removed once that status is returned by fetching notebooks
            for (const serverName in resp.data) {
              const currentStatus = currentServers[serverName]?.status;
              if (currentStatus && "stopping" in currentStatus)
                resp.data[serverName].status.stopping = true;
            }
            updatedNotebooks.all = { $set: resp.data };
          }
          // TODO: re-invoke `fetchNotebooks()` immediately if parameters are outdated
        }
        this.model.setObject({ notebooks: updatedNotebooks });
        return resp.data;
      })
      .catch(error => {
        this.model.set("notebooks.fetching", false);
        throw error;
      });
  }

  async fetchNotebookOptions(skip = false) {
    if (!skip)
      await this.fetchProjectOptions();
    const oldData = this.model.get("options.global");
    if (Object.keys(oldData).length !== 0)
      return;

    // get user status
    const anonymous = this.userModel.get("logged") ?
      false :
      true;

    return this.client.getNotebookServerOptions(anonymous)
      .then((globalOptions) => {
        this.model.set("options.global", globalOptions);
        this.setDefaultOptions(globalOptions, null);

        return globalOptions;
      });
  }

  // TODO: switch to the "GET config.show" API. Adapt (or remove) also the following setDefaultOptions function
  async fetchProjectOptions() {
    // prepare query data and reset warnings
    const filters = this.getQueryFilters();
    const projectId = `${encodeURIComponent(filters.namespace)}%2F${filters.project}`;
    this.model.setObject({
      options: {
        fetching: true,
        warnings: { $set: [] }
      }
    });
    // keep track of filter data at query time
    const requestFiltersString = JSON.stringify(filters);
    await this.client.getRepositoryFile(projectId, RENKU_INI_PATH, filters.commit, "raw")
      .catch(error => {
        // treat a non existing file as an empty string
        if (error.case !== API_ERRORS.notFoundError)
          throw error;
        return "";
      })
      .then(data => {
        // verify that filter data at response time are not for an old query
        const currentFilters = this.getQueryFilters();
        if (requestFiltersString !== JSON.stringify(currentFilters))
          return;

        // parse data, save them and try to set user options
        const projectOptions = NotebooksHelper.parseProjectOptions(data);
        const optionsObject = {
          fetching: false,
          fetched: new Date(),
          project: { $set: projectOptions }
        };
        this.model.setObject({ options: optionsObject });

        this.setDefaultOptions(null, projectOptions);
        return projectOptions;
      });
  }

  setDefaultOptions(globalOptions, projectOptions) {
    // verify if all the pieces are available and get what's missing
    if (!globalOptions) {
      const pendingGlobalOptions = this.model.get("options.global") === {} ? true : false;
      if (pendingGlobalOptions)
        return;
      globalOptions = this.model.get("options.global");
    }
    if (!projectOptions) {
      const pendingProjectOptions = this.model.get("options.fetching");
      if (pendingProjectOptions)
        return;
      projectOptions = this.model.get("options.project");
    }

    // Apply default options without overwriting previous selection
    let filterOptions = this.model.get("filters.options");
    const filledOptions = Object.keys(filterOptions);
    Object.keys(globalOptions).forEach(option => {
      if (!filledOptions.includes(option))
        filterOptions[option] = globalOptions[option].default;

    });

    // Overwrite default options with project options wherever possible
    let warnings = [];
    Object.keys(projectOptions).forEach(option => {
      const optionValue = projectOptions[option];
      if (NotebooksHelper.checkOptionValidity(globalOptions, option, optionValue))
        filterOptions[option] = optionValue;
      else if (!NotebooksHelper.checkSettingValidity(option, optionValue))
        warnings = warnings.concat(option);
    });
    this.model.setObject({
      filters: { options: { $set: filterOptions } },
      options: { warnings: { $set: warnings } }
    });
  }

  fetchLogs(serverName, full = false) {
    let lines = 250;
    if (full)
      lines = 0;
    let logs = { fetching: true };
    if (this.model.get("logs.reference") !== serverName && !full) {
      logs.reference = serverName;
      logs.data = { $set: [] };
      logs.fetched = null;
    }
    this.model.setObject({ logs });
    return this.client.getNotebookServerLogs(serverName, lines)
      .catch(e => ["Logs currently not available. Try again in a minute..."])
      .then((data) => {
        let updatedLogs = { fetching: false };
        if (!full) {
          updatedLogs.fetched = new Date();
          updatedLogs.data = { $set: data };
        }
        this.model.setObject({ logs: updatedLogs });
        return data;
      });
  }

  async fetchCommit(serverName) {
    // get the commit for the target server
    const environments = this.model.get("notebooks.all");
    const target = environments[serverName];
    if (!target || !target.annotations)
      return;
    const annotations = NotebooksHelper.cleanAnnotations(target.annotations);
    if (!annotations || !annotations["commit-sha"] || !annotations["gitlabProjectId"])
      return;
    const commitSha = annotations["commit-sha"];
    const gitlabProjectId = annotations["gitlabProjectId"];

    // verify if the commit data are already cached
    const oldCommits = this.model.get("data.commits");
    if (Object.keys(oldCommits).includes(commitSha) &&
      oldCommits[commitSha].data &&
      oldCommits[commitSha].data.project_id)
      return { ...oldCommits[commitSha].data };

    let commitData = {};
    let commit = { data: commitData, fetched: false, fetching: true };
    this.model.setObject({ data: { commits: { [commitSha]: commit } } });

    let fetched = null;
    try {
      commitData = await this.client.getRepositoryCommit(gitlabProjectId, commitSha);
      fetched = new Date();
    }
    catch (error) {
      // TODO: add to notifications
    }
    finally {
      commit = { data: commitData, fetched, fetching: false };
      this.model.setObject({ data: { commits: { [commitSha]: commit } } });
    }

    return { ...commitData };
  }

  async fetchPipeline() {
    // check if already fetching data
    const fetching = this.model.get("pipelines.fetching");
    if (fetching)
      return;

    // get filters and stop fetching if not all parameters are available
    const filters = this.getQueryFilters();
    if (filters.branch === null || filters.commit === null) {
      this.stopPipelinePolling();
      return;
    }

    // update current state and start fetching
    this.model.setObject({
      pipelines: {
        fetching: true,
        lastParameters: JSON.stringify(filters)
      }
    });
    const projectId = `${encodeURIComponent(filters.namespace)}%2F${filters.project}`;
    const pipelines = await this.client.getPipelines(projectId, filters.commit).catch(error => {
      this.model.set("pipelines.fetching", false);
      throw error;
    });

    // check if results are outdated
    let pipelinesState = { fetching: false };
    const lastParameters = this.model.get("pipelines.lastParameters");
    if (lastParameters !== JSON.stringify(filters)) {
      pipelinesState.fetched = null;
      this.model.setObject({ pipelines: pipelinesState });
      return {};
    }

    // stop if no pipelines are available
    let mainPipeline = {};
    pipelinesState.fetched = new Date();
    if (pipelines.length === 0) {
      pipelinesState.lastMainId = null;
      pipelinesState.main = { $set: mainPipeline };
      this.model.setObject({ pipelines: pipelinesState });
      return mainPipeline;
    }

    // try to use cached data to find image_build pipeline id
    const lastMainId = this.model.get("pipelines.lastMainId");
    if (lastMainId) {
      const mainPipelines = pipelines.filter(pipeline => pipeline.id === lastMainId);
      if (mainPipelines.length === 1) {
        mainPipeline = mainPipelines[0];
        pipelinesState.main = mainPipeline;
        this.model.setObject({ pipelines: pipelinesState });
        return mainPipeline;
      }
    }

    // search for the proper pipeline
    for (let pipeline of pipelines) {
      // fetch jobs
      const jobs = await this.client.getPipelineJobs(projectId, pipeline.id).catch(error => {
        this.model.set("pipelines.fetching", false);
        throw error;
      });
      const imageJobs = jobs.filter(job => job.name === IMAGE_BUILD_JOB);
      if (imageJobs.length > 0) {
        mainPipeline = pipeline;
        pipelinesState.lastMainId = pipeline.id;
        pipelinesState.main = mainPipeline;
        this.model.setObject({ pipelines: pipelinesState });
        return mainPipeline;
      }
    }

    pipelinesState.lastMainId = null;
    pipelinesState.main = mainPipeline;
    this.model.setObject({ pipelines: pipelinesState });

    // reset pipelines.main object attributes if needed
    const currentMain = this.model.get("pipelines.main");
    if (currentMain && currentMain.id && !mainPipeline.id)
      this.model.set("pipelines.main", {});

    return mainPipeline;
  }

  async fetchRegistries() {
    // check if already fetching data
    const fetching = this.model.get("pipelines.fetching");
    if (fetching)
      return;

    // get filters and stop fetching if not all parameters are available
    let filters = this.getQueryFilters();
    if (filters.branch === null || filters.commit === null) {
      this.stopPipelinePolling();
      return;
    }
    const projectId = `${encodeURIComponent(filters.namespace)}%2F${filters.project}`;

    // verify if parameters have changed and if I have an id
    const lastParameters = this.model.get("pipelines.lastParameters");
    const lastMainId = this.model.get("pipelines.lastMainId");
    const newParameters = JSON.stringify(filters);
    let newMainId, pipelinesState = {};
    if (newParameters === lastParameters && lastMainId != null) {
      newMainId = lastMainId;
    }
    else {
      // update current state and start fetching
      this.model.setObject({
        pipelines: {
          fetching: true,
          lastParameters: newParameters
        }
      });
      const registries = await this.client.getRegistries(projectId)
        .catch(error => {
          this.model.set("pipelines.fetching", false);
          throw error;
        });

      // verify that a registry can be found
      pipelinesState = { fetching: false };
      if (registries.length === 0) {
        pipelinesState.fetched = true;
        pipelinesState.lastMainId = null;
        pipelinesState.main = { $set: {} };
        this.model.setObject({ pipelines: pipelinesState });
        return {};
      }

      newMainId = registries[0].id;
      pipelinesState.lastMainId = newMainId;
    }

    // use the registry id to get the image
    const tag_id = filters.commit.substring(0, 7);
    const tag = await this.client.getRegistryTag(projectId, newMainId, tag_id);
    pipelinesState.fetched = true;
    pipelinesState.main = tag ?
      tag :
      { $set: {} };

    this.model.setObject({ pipelines: pipelinesState });
    return pipelinesState;
  }

  async fetchAutosaves(force = false) {
    // prevent double fetch
    if (!force) {
      const fetching = this.model.get("autosaves.fetching");
      if (fetching)
        return;
    }

    // get filters
    const filters = this.getQueryFilters();
    if (!filters.namespace || !filters.project)
      return;
    this.model.set("autosaves.fetching", true);
    const response = await this.client.getProjectAutosaves(filters.namespace, filters.project);
    let autosavesData = { fetching: false, fetched: new Date() };
    if (response && response.autosaves) {
      autosavesData.error = null;
      autosavesData.list = { $set: response.autosaves };
      autosavesData.pvsSupport = response.pvsSupport;
    }
    else {
      autosavesData.error = response.error ?
        response.error :
        response.toString();
      autosavesData.list = { $set: [] };
      autosavesData.pvsSupport = null;
    }
    this.model.setObject({ autosaves: autosavesData });
    return autosavesData;
  }

  async deleteAutosave(autosave) {
    const filters = this.getQueryFilters();
    if (!filters.namespace || !filters.project)
      return;
    return await this.client.deleteProjectAutosave(filters.namespace, filters.project, autosave);
  }


  // * Handle polling * //
  startNotebookPolling(interval = POLLING_INTERVAL) {
    const oldPoller = this.model.get("notebooks.poller");
    if (oldPoller == null) {
      const newPoller = setInterval(() => {
        this.fetchNotebooks();
      }, interval);
      this.model.set("notebooks.poller", newPoller);

      // fetch immediately
      this.fetchNotebooks();
    }
  }

  stopNotebookPolling() {
    const poller = this.model.get("notebooks.poller");
    if (poller) {
      this.model.set("notebooks.poller", null);
      clearTimeout(poller);
    }
  }

  startPipelinePolling(interval = POLLING_INTERVAL) {
    // compute current data
    const projectOptions = this.model.get("options.project");
    const userLogged = this.userModel.get("logged");
    let newPipelinesType;
    if (projectOptions["image"])
      newPipelinesType = PIPELINE_TYPES.customImage;
    else if (userLogged)
      newPipelinesType = PIPELINE_TYPES.logged;
    else
      newPipelinesType = PIPELINE_TYPES.anonymous;

    // if poller type changes, stop the old one and re-invoke later
    const oldPoller = this.model.get("pipelines.poller");
    const oldPipelinesType = this.model.get("pipelines.type");
    if (oldPoller != null) {
      if (oldPipelinesType !== newPipelinesType) {
        this.model.set("pipelines.fetched", null);
        this.stopPipelinePolling();
        setTimeout(() => { this.startPipelinePolling(); }, 1000);
        return false;
      }
    }
    else {
      let newPipelines = {
        fetched: null,
        type: newPipelinesType
      };

      let returnValue;
      if (newPipelinesType === PIPELINE_TYPES.customImage) {
        newPipelines.poller = null;
        newPipelines.fetched = new Date();
        newPipelines.fetching = false;
        returnValue = true;
      }
      else if (newPipelinesType === PIPELINE_TYPES.logged) {
        const newPoller = setInterval(() => { this.fetchPipeline(); }, interval);
        newPipelines.poller = newPoller;
        returnValue = this.fetchPipeline();
      }
      else {
        const newPoller = setInterval(() => { this.fetchRegistries(); }, interval);
        newPipelines.poller = newPoller;
        returnValue = this.fetchRegistries();
      }

      this.model.setObject({ pipelines: newPipelines });
      return returnValue;
    }
  }

  stopPipelinePolling() {
    const poller = this.model.get("pipelines.poller");
    if (poller) {
      this.model.set("pipelines.poller", null);
      clearTimeout(poller);
    }
  }


  // * Change notebook status * //
  startServer() {
    const options = {
      serverOptions: this.model.get("filters.options"),
      s3mounts: this.model.get("filters.objectStoresConfiguration")
    };
    const filters = this.model.get("filters");
    const namespace = filters.namespace;
    const project = filters.project;
    const branch = filters.branch && filters.branch.name ? filters.branch.name : filters.defaultBranch;
    const commit = filters.commit && filters.commit.id ? filters.commit.id : "latest";
    const projectOptions = this.model.get("options.project");
    const image = projectOptions.image ?
      projectOptions.image :
      null;

    return this.client.startNotebook(namespace, project, branch, commit, image, options);
  }

  stopNotebook(serverName, force = false) {
    // manually set the state and temporarily throw away servers data until the promise resolves
    const updatedState = {
      filters: { discard: true },
      notebooks: { all: { [serverName]: { status: { ready: false, stopping: true } } } }
    };
    this.model.setObject(updatedState);
    return this.client.stopNotebookServer(serverName, force)
      .then(response => {
        this.model.set("filters.discard", false);
        return response;
      })
      .catch(error => {
        this.model.set("filters.discard", false);
        throw error;
      });
  }
}

export { NotebooksHelper, ExpectedAnnotations, NotebooksCoordinator };
