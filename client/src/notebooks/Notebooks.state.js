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

import _ from "lodash";

import { API_ERRORS } from "../api-client/errors";
import { notebooksSchema } from "../model";
import { parseINIString, sleep } from "../utils/helpers/HelperFunctions";


const POLLING_INTERVAL = 3000;
const IMAGE_BUILD_JOB = "image_build";
const RENKU_INI_PATH = ".renku/renku.ini";
const RENKU_INI_SECTION_LEGACY = `renku "interactive"`;
const RENKU_INI_SECTION = "interactive";

const CI_TYPES = {
  anonymous: "anonymous",
  pinned: "pinned",
  logged: "logged",
  owner: "owner"
};

const CI_STAGES = {
  starting: "starting",
  pipelines: "pipelines",
  jobs: "jobs",
  image: "image"
};

const CI_STATUSES = {
  wrong: "wrong",
  success: "success",
  running: "running",
  failure: "failure"
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
   * Check the CI status for the currently selected commit.
   *
   * @param {object} ci - ci object as stored in redux.
   * @returns {object} ci status, including `stage` ("starting" --> "pipelines" --> "jobs" --> "image"),
   *   `error` (null or <string>), ongoing (<bool>), finished (<bool>).
   *   The props should be check in order, so that a null stage means nothing has been checked, no matter
   *   what error contains. In the same way, when we get an error it does not matter what available says.
   */
  checkCiStatus: (ci) => {
    const returnObject = {
      stage: null,
      error: null,
      ongoing: null,
      available: false
    };

    if (ci.stage == null)
      return returnObject;
    if (ci.stage === CI_STAGES.starting) {
      returnObject.stage = CI_STAGES.starting;
      returnObject.ongoing = true;
      return returnObject;
    }

    returnObject.stage = ci.stage;
    const currentCi = ci[ci.stage];

    if (currentCi.error != null) {
      returnObject.error = currentCi.error;
      returnObject.ongoing = false;
    }
    else if (!currentCi.fetched) {
      returnObject.ongoing = true;
    }
    else if (ci.stage === CI_STAGES.pipelines) {
      returnObject.ongoing = currentCi.fetched ? false : true;
    }
    else if (ci.stage === CI_STAGES.jobs) {
      returnObject.ongoing = currentCi.fetched ? false : true;
    }
    else if (ci.stage === CI_STAGES.image) {
      returnObject.ongoing = currentCi.fetched ? false : true;
      returnObject.available = currentCi.available ? true : false;
    }

    return returnObject;
  },

  getCiJobStatus: (job) => {
    if (job && job["id"]) {
      if (job.status === "success")
        return CI_STATUSES.success;
      if (["running", "pending", "stopping"].includes(job.status))
        return CI_STATUSES.running;
      if (["failed", "canceled"].includes(job.status))
        return CI_STATUSES.failure;
    }
    return CI_STATUSES.wrong;
  },

  ciStatuses: CI_STATUSES,
  ciStages: CI_STAGES,
  ciTypes: CI_TYPES,
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
      ci: {
        type: null,
        stage: null,
        error: null
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
            if (!(_.isEqual(resp.data, currentServers)))
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
      .catch(e => "Logs currently not available. Try again in a minute...")
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


  // * Handle notebooks polling * //
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

  // * Handle CI, polling included * //

  /**
   * Verify if current target commit is still valid.
   * @param {string} expectedTarget - original commit when fetching CI was initiated
   * @returns {boolean}
   */
  _checkTarget(expectedTarget) {
    const currentTarget = this.model.get("ci.target");
    if (expectedTarget !== currentTarget)
      return false;
    return true;
  }

  /**
   * Create an error message from the current error.
   * @param {object} error - error object
   * @returns {string}
   */
  _getErrorMessage(error) {
    if (error?.errorData?.message)
      return error.errorData.message;
    if (error?.message)
      return error.message;
    if (error?.case)
      return error.case;
    return error ?
      error.toString() :
      false;
  }

  /**
   * Start checking the CI status according to the user status for the project.
   *
   * @param {boolean} force - whether the user is logged in or not
   * @param {boolean} logged - whether the user is logged in or not
   * @param {boolean} owner  - whether the user is project owner or not
   * @param {function} [problemCallback]  - callback to invoke when there is a problem
   */
  async fetchOrPollCi(force = false, logged = null, owner = null, problemCallback = null) {
    // Verify current commit and avoid re-fetching if not needed
    const filters = this.model.get("filters");
    const commit = filters?.commit?.id;
    if (!commit)
      return;
    const previousCi = this.model.get("ci");
    if (previousCi.target === commit && !force)
      return;

    // Get basic information
    const options = this.model.get("options.project");
    let ciType;
    if (options["image"])
      ciType = CI_TYPES.pinned;
    else if (!logged)
      ciType = CI_TYPES.anonymous;
    else if (!owner)
      ciType = CI_TYPES.logged;
    else
      ciType = CI_TYPES.owner;

    // set up the basic object
    let ciObject = notebooksSchema.createInitialized().ci;
    ciObject.type = ciType;
    ciObject.stage = CI_STAGES.starting;
    ciObject.target = commit;
    this.model.setObject({ ci: ciObject });

    // Trigger next step passing project info
    const projectId = `${encodeURIComponent(filters.namespace)}%2F${filters.project}`;
    if (ciType === CI_TYPES.pinned)
      this.checkRemoteImage(options["image"], commit, problemCallback);
    else if (ciType === CI_TYPES.anonymous)
      this.checkCiImage(projectId, commit, problemCallback);
    else
      this.checkCiPipelines(projectId, commit, problemCallback);
  }

  /**
   * Fetch pipelines and keep polling until we get one or an error
   * @param {string} projectId - target project id, already URI-encoded
   * @param {string} expectedTarget - original commit when fetching CI was initiated
   * @param {function} [problemCallback]  - callback to invoke when there is a problem
   */
  async checkCiPipelines(projectId, target, problemCallback = null) {
    // set state and fetch pipelines
    this.model.set("ci.stage", CI_STAGES.pipelines);
    let pipelinesList = await this.fetchCiPipeline(projectId, target);

    // keep fetching until we get a non-empty list or an error
    while (pipelinesList !== false && !pipelinesList?.length) {
      if (problemCallback) problemCallback();
      await sleep(POLLING_INTERVAL / 1000);
      pipelinesList = await this.fetchCiPipeline(projectId, target);
    }

    // invoke next step if the result is valid
    if (pipelinesList !== false)
      this.checkCiJobs(projectId, target, problemCallback);
  }

  /**
   * Fetch the pipeline if the current ci target is the same passed as argument
   * @param {string} projectId - target project id, already URI-encoded
   * @param {string} expectedTarget - original commit when fetching CI was initiated
   */
  async fetchCiPipeline(projectId, expectedTarget) {
    // block fetching and falsify when the current target has changed
    if (!this._checkTarget(expectedTarget))
      return false;

    let pipelineObject = { fetching: true };
    let pipelinesList = [];

    // return early if it's still fetching
    const fetching = this.model.get("ci.pipelines.fetching");
    if (fetching)
      return pipelinesList;

    // start fetching and wait for the result
    this.model.setObject({ ci: { pipelines: pipelineObject } });
    try {
      pipelinesList = await this.client.getPipelines(projectId, expectedTarget);
      pipelineObject.error = null;
    }
    catch (e) {
      pipelineObject.error = this._getErrorMessage(e);
    }
    pipelineObject.list = { $set: pipelinesList };
    pipelineObject.target = pipelinesList?.length === 1 ? pipelinesList[0] : null;
    pipelineObject.available = !pipelineObject.error && pipelinesList?.length ? true : false;
    pipelineObject.fetching = false;
    pipelineObject.fetched = new Date();
    this.model.setObject({ ci: { pipelines: pipelineObject } });

    // return either the list or false if any error occurred
    return pipelineObject.error ?
      false :
      pipelinesList;
  }

  /**
   * Fetch jobs and keep polling until we get a status confirmation or an error.
   * @param {string} projectId - target project id, already URI-encoded
   * @param {string} target - original commit when fetching CI was initiated
   * @param {function} [problemCallback]  - callback to invoke when there is a problem
   */
  async checkCiJobs(projectId, target, problemCallback = null) {
    this.model.set("ci.stage", CI_STAGES.jobs);

    // Get the pipelines, filtering for the one containing the target job (if any).
    const pipelines = this.model.get("ci.pipelines");
    let pipelinesList = pipelines.target?.id ?
      [pipelines.target] :
      pipelines.list;

    // Get jobs from the pipelines
    let jobs = await this.fetchCiJobs(projectId, target, pipelinesList);
    while (jobs !== false && !jobs.length) {
      if (problemCallback) problemCallback();
      await sleep(POLLING_INTERVAL / 1000);
      jobs = await this.fetchCiJobs(projectId, target, pipelinesList, true);
    }

    // check and keep checking job status if necessary
    if (jobs?.length === 1) {
      let status = NotebooksHelper.getCiJobStatus(jobs[0]);
      while (status === CI_STATUSES.running) {
        if (problemCallback) problemCallback();
        await sleep(POLLING_INTERVAL / 1000);
        const job = await this.fetchCiJob(projectId, target, jobs[0].id);
        status = NotebooksHelper.getCiJobStatus(job);
      }
      if (status === CI_STATUSES.success)
        this.checkCiImage(projectId, target, problemCallback);
      else if (problemCallback)
        problemCallback();
    }
    else {
      this.model.set("ci.jobs.error", "Unexpected errors with GitLab pipelines: duplicate jobs name");
      if (problemCallback) problemCallback();
    }
  }

  /**
   * Fetch the pipeline if the current ci target is the same passed as argument
   * @param {string} projectId - target project id, already URI-encoded
   * @param {string} expectedTarget - original commit when fetching CI was initiated
   * @param {object[]} pipelinesList - list of all the relevant pipelines
   * @param {boolean} reFetching -whether it's a re-try or not
   */
  async fetchCiJobs(projectId, expectedTarget, pipelinesList, reFetching = false) {
    // block fetching and falsify when the current target has changed
    if (!this._checkTarget(expectedTarget))
      return false;

    let jobsList = [];
    let jobsObject = {};
    if (reFetching)
      jobsObject.reFetching = true;
    else
      jobsObject.fetching = true;

    this.model.setObject({ ci: { jobs: jobsObject } });
    for (const pipeline of pipelinesList) {
      try {
        // check the jobs and break if we find the one we are looking for
        const pipelineJobs = await this.client.getPipelineJobs(projectId, pipeline.id);
        const imageJob = pipelineJobs.find(job => job.name === IMAGE_BUILD_JOB);
        jobsObject.error = null;
        if (imageJob) {
          jobsObject.target = imageJob;
          break;
        }
        else {
          jobsList = [...jobsList, ...pipelineJobs];
        }
      }
      // block on errors
      catch (e) {
        jobsObject.error = this._getErrorMessage(e);
        break;
      }
    }

    jobsObject.list = { $set: jobsList };
    jobsObject.fetching = false;
    jobsObject.reFetching = false;
    jobsObject.fetched = new Date();
    jobsObject.available = jobsObject.target || !jobsObject.error ? true : false;
    this.model.setObject({ ci: { jobs: jobsObject } });

    // return either an array with the target jobs (it's 1 or none) or false if error occurred
    if (jobsObject.error)
      return false;
    else if (jobsObject.target)
      return [jobsObject.target];
    return [];
  }

  /**
   * Fetch the pipeline if the current ci target is the same passed as argument
   * @param {string} projectId - target project id, already URI-encoded
   * @param {string} expectedTarget - original commit when fetching CI was initiated
   * @param {string} jobId - target jobId
   */
  async fetchCiJob(projectId, expectedTarget, jobId) {
    // block fetching and falsify when the current target has changed
    if (!this._checkTarget(expectedTarget))
      return false;

    let jobsObject = { reFetching: true };
    this.model.setObject({ ci: { jobs: jobsObject } });

    let job;
    try {
      job = await this.client.getProjectJob(projectId, jobId);
      jobsObject.error = null;
    }
    // block on errors
    catch (e) {
      jobsObject.error = this._getErrorMessage(e);
    }

    jobsObject.target = job;
    jobsObject.reFetching = false;
    jobsObject.fetched = new Date();
    this.model.setObject({ ci: { jobs: jobsObject } });
    return job?.id && !jobsObject.error ?
      job :
      false;
  }

  /**
   * Fetch CI image local registry and check Docker image status.
   * @param {string} projectId - target project id, already URI-encoded
   * @param {string} target - original commit when fetching CI was initiated
   * @param {function} [problemCallback]  - callback to invoke when there is a problem
   */
  async checkCiImage(projectId, target, problemCallback = null) {
    this.model.set("ci.stage", CI_STAGES.image);

    // fetch reference registry for the project. It should be 1 per project.
    let imageObject = { fetching: true };
    let registries = [];
    this.model.setObject({ ci: { image: imageObject } });
    try {
      registries = await this.client.getRegistries(projectId);
      // filter the ones without names?
      if (!registries?.length) {
        imageObject.error = "This project does not have any Docker image repository";
      }
      else if (registries?.length !== 1) {
        // ? try to use the no name registry. It's not guaranteed that it will work -- we should set a renku name
        const filteredRegistries = registries.find(registry => registry.name === "");
        if (filteredRegistries?.id) {
          registries = [filteredRegistries];
          imageObject.error = null;
        }
        else {
          imageObject.error = "The project has multiple Docker image repositories. We can't identify the correct one";
        }
      }
      else {
        imageObject.error = null;
      }
    }
    catch (e) {
      imageObject.error = this._getErrorMessage(e);
    }

    // stop here if there is any error.
    if (imageObject.error) {
      if (problemCallback) problemCallback();
      imageObject.available = false;
      imageObject.fetching = false;
      imageObject.fetched = true;
      this.model.setObject({ ci: { image: imageObject } });
      return;
    }

    const id = registries[0]?.id;
    let imageAvailable = await this.fetchCiImage(projectId, target, id);
    while (imageAvailable !== false && imageAvailable !== true) {
      if (problemCallback) problemCallback();
      await sleep(POLLING_INTERVAL / 1000);
      imageAvailable = await this.fetchCiImage(projectId, target, id);
    }
  }


  /**
   * Verify CI image from any v2 Docker registry.
   * @param {string} registryUrl - target registry full URL
   * @param {string} target - original commit when fetching CI was initiated
   * @param {function} [problemCallback]  - callback to invoke when there is a problem
   */
  async checkRemoteImage(registryUrl, target, problemCallback = null) {
    this.model.set("ci.stage", CI_STAGES.image);

    // fetch reference registry for the project. It should be 1 per project.
    let imageObject = { fetching: true };
    this.model.setObject({ ci: { image: imageObject } });
    try {
      await this.client.getImageStatus(registryUrl);
      imageObject.available = true;
      imageObject.error = null;
    }
    catch (e) {
      imageObject.available = false;
      const error = this._getErrorMessage(e);
      if (!error.includes("JSON.parse"))
        imageObject.error = error;
    }

    imageObject.fetching = false;
    imageObject.fetched = new Date();
    this.model.setObject({ ci: { image: imageObject } });

    if (!imageObject.available && problemCallback) problemCallback();
  }


  /**
   * Fetch the pipeline if the current ci target is the same passed as argument
   * @param {string} projectId - target project id, already URI-encoded
   * @param {string} expectedTarget - original commit when fetching CI was initiated
   * @param {string} registryId - target registry
   */
  async fetchCiImage(projectId, expectedTarget, registryId) {
    // block fetching and falsify when the current target has changed
    if (!this._checkTarget(expectedTarget))
      return false;

    let imageObject = { fetching: true };
    this.model.setObject({ ci: { image: imageObject } });

    let image;
    const commitShortSha = expectedTarget.substring(0, 7);
    try {
      image = await this.client.getRegistryTag(projectId, registryId, commitShortSha);
      imageObject.error = null;
    }
    // block on errors
    catch (e) {
      imageObject.error = this._getErrorMessage(e);
    }

    imageObject.fetching = false;
    imageObject.fetched = new Date();
    if (image?.location)
      imageObject.available = true;

    this.model.setObject({ ci: { image: imageObject } });
    if (imageObject.error)
      return false;
    if (imageObject.available)
      return true;
    return undefined;
  }

  /**
   * Stop the ci polling by cleaning up the schema. This works cause the ci.target is removed.
   */
  stopCiPolling() {
    this.model.set("ci", notebooksSchema.createInitialized().ci);
  }


  // * Change notebook status * //
  startServer() {
    const options = {
      serverOptions: this.model.get("filters.options"),
    };
    const cloudstorage = this.model.get("filters.objectStoresConfiguration");
    if (cloudstorage.length > 0)
      options["cloudstorage"] = cloudstorage;

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
