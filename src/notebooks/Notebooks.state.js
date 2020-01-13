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

import { API_ERRORS } from '../api-client/errors';
import { parseINIString } from '../utils/HelperFunctions';

const POLLING_INTERVAL = 3000;
const IMAGE_BUILD_JOB = "image_build";
const RENKU_INI_PATH = ".renku/renku.ini";
const RENKU_INI_SECTION = `renku "interactive"`;

const ExpectedAnnotations = {
  "renku.io": {
    required: ["branch", "commit-sha", "namespace", "projectId", "projectName"],
    default: {
      "branch": "unknown",
      "commit-sha": "00000000",
      "namespace": "unknown",
      "projectId": 0,
      "projectName": "unknown"
    }
  }
}

const NotebooksHelper = {
  /**
   * compute the status of a notebook
   *
   * @param {Object} either the notebook or the notebook.status object as returned by the GET /servers API
   */
  getStatus: (data) => {
    let status = data;
    if (data.status)
      status = data.status;

    if (status.ready)
      return "running";
    if (status.step === "Unschedulable")
      return "error";
    return "pending";
  },
  /**
   * add missing annotations from the notebook servers
   *
   * @param {object} annotations
   * @param {string} domain
   */
  cleanAnnotations(annotations, domain = "renku.io") {
    let cleaned = {};
    const prefix = `${domain}/`;
    ExpectedAnnotations[domain].required.forEach(annotation => {
      cleaned[annotation] = annotations[prefix + annotation] !== undefined ?
        annotations[prefix + annotation] :
        ExpectedAnnotations[domain].default[annotation];
    });

    return { ...cleaned };
  }
};

class NotebooksCoordinator {
  constructor(client, model) {
    this.client = client;
    this.model = model;
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
        options: { $set: {} }
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
   * @param {string|Object} data.commit - commit full id or commit data as return by gitlab api
   */
  setNotebookFilters(data = {}) {
    let filters = {};
    if (data.namespace !== undefined)
      filters.namespace = data.namespace;
    if (data.project !== undefined)
      filters.project = data.project;
    if (data.branch !== undefined)
      data.branch instanceof Object ? filters.branch = data.branch : filters.branch = { name: data.branch }
    if (data.commit !== undefined)
      data.commit instanceof Object ? filters.commit = data.commit : filters.commit = { id: data.commit }

    this.model.setObject({ filters });
  }

  setBranch(branch) {
    this.model.setObject({
      notebooks: { fetched: null },
      filters: { branch: { $set: branch } }
    });
    this.fetchNotebooks();
  }

  setCommit(commit) {
    this.model.setObject({
      notebooks: { fetched: null },
      filters: { commit: { $set: commit } }
    });
    this.fetchNotebooks();
  }

  setMergedBranches(value) {
    this.model.set('filters.includeMergedBranches', value);
  }

  setDisplayedCommits(value) {
    this.model.set('filters.displayedCommits', value);
  }

  setNotebookOptions(option, value) {
    this.model.set(`filters.options.${option}`, value);
  }

  getQueryFilters() {
    const filters = this.model.get('filters');
    return {
      namespace: filters.namespace,
      project: filters.project,
      branch: filters.branch.name ? filters.branch.name : null,
      commit: filters.commit.id ? filters.commit.id : null
    };
  }


  // * Fetch data * //
  fetchNotebooks() {
    const fetching = this.model.get('notebooks.fetching');
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

    // get notebooks
    return this.client.getNotebookServers(filters.namespace, filters.project, filters.branch, filters.commit)
      .then(resp => {
        let updatedNotebooks = { fetching: false };
        // check if result is still valid
        if (!this.model.get('filters.discard')) {
          const filters = this.getQueryFilters();
          if (this.model.get('notebooks.lastParameters') === JSON.stringify(filters)) {
            updatedNotebooks.fetched = new Date();
            updatedNotebooks.all = { $set: resp.data };
          }
          // TODO: re-invoke `fetchNotebooks()` immediatly if parameters are outdated
        }
        this.model.setObject({ notebooks: updatedNotebooks });
        return resp.data;
      })
      .catch(error => {
        this.model.set('notebooks.fetching', false);
        throw error;
      });
  }

  fetchNotebookOptions() {
    this.fetchProjectOptions();
    const oldData = this.model.get('options.global');
    if (Object.keys(oldData).length !== 0)
      return;

    return this.client.getNotebookServerOptions().then((globalOptions) => {
      this.model.set('options.global', globalOptions);
      this.setDefaultOptions(globalOptions, null);

      return globalOptions;
    });
  }

  fetchProjectOptions() {
    // cleanup missing project options warning
    const warnings = this.model.get('options.warnings');
    if (warnings && warnings.length) {
      this.model.set('options.warnings', []);
    }

    const filters = this.getQueryFilters();
    const requestFilters = JSON.stringify(filters); // keep these to verify answer validity
    const projectId = `${encodeURIComponent(filters.namespace)}%2F${filters.project}`;
    this.model.setObject({
      options: {
        fetching: true,
        warnings: { $set: [] }
      }
    });
    this.client.getRepositoryFile(projectId, RENKU_INI_PATH, filters.commit, 'raw')
      .then(data => {
        // verify if received data are not stale
        if (requestFilters !== JSON.stringify(this.getQueryFilters()))
          return;

        const parsedData = parseINIString(data);
        if (parsedData[RENKU_INI_SECTION]) {
          // create project options object
          const parsedOptions = parsedData[RENKU_INI_SECTION];
          let projectOptions = {};
          Object.keys(parsedOptions).forEach(parsedOption => {
            let option = parsedOption;
            if (parsedOption === "default_url")
              option = "defaultUrl";
            let value = parsedOptions[parsedOption];
            if (value && value.toLowerCase() === "true") {
              value = true;
            }
            else if (value && value.toLowerCase() === "false") {
              value = false;
            }
            else if (!isNaN(value)) {
              value = parseFloat(value);
            }

            projectOptions[option] = value;
          })

          // save options and try to set user-selected options
          const optionsObject = {
            fetching: false,
            fetched: new Date(),
            project: { $set: projectOptions }
          };
          this.model.setObject({ options: optionsObject });

          this.setDefaultOptions(null, projectOptions);
          return projectOptions;
        }
      })
      .catch(error => {
        const optionsObject = {
          fetching: false,
          fetched: new Date(),
          project: { $set: {} }
        };
        this.model.setObject({ options: optionsObject });
        if (error.case !== API_ERRORS.notFoundError)
          throw error;

        this.setDefaultOptions(null, {});
        return {};
      });
  }

  setDefaultOptions(globalOptions, projectOptions) {
    // verify if all the pieces are available and get what's missing
    if (!globalOptions) {
      const pendingGlobalOptions = this.model.get('options.global') === {} ? true : false;
      if (pendingGlobalOptions)
        return;
      globalOptions = this.model.get('options.global');
    }
    if (!projectOptions) {
      const pendingProjectOptions = this.model.get('options.fetching');
      if (pendingProjectOptions)
        return;
      projectOptions = this.model.get('options.project')
    }

    // get previously selected options and add missing ones
    let filterOptions = this.model.get('filters.options');
    const filledOptions = Object.keys(filterOptions);
    Object.keys(globalOptions).forEach(option => {
      if (!filledOptions.includes(option)) {
        filterOptions[option] = globalOptions[option].default;
      }
    })

    // try to overwrite default options with project options
    let warnings = [];
    Object.keys(projectOptions).forEach(option => {
      const optionValue = projectOptions[option];
      if (
        (globalOptions[option] && globalOptions[option].type !== "enum") ||
        (globalOptions[option] && globalOptions[option].options && globalOptions[option].options.length && globalOptions[option].options.includes(optionValue)) ||
        (option === "defaultUrl")
      ) {
        filterOptions[option] = optionValue;
      }
      else {
        warnings = warnings.concat(option);
      }
    });
    this.model.setObject({
      filters: { options: { $set: filterOptions } },
      options: { warnings: { $set: warnings } }
    });
  }

  fetchLogs(serverName) {
    let logs = { fetching: true };
    if (this.model.get('logs.reference') !== serverName) {
      logs.reference = serverName;
      logs.data = { $set: [] };
      logs.fetched = null;
    }
    this.model.setObject({ logs });

    return this.client.getNotebookServerLogs(serverName).then((data) => {
      const lines = data.split("\n");
      this.model.setObject({
        logs: {
          fetched: new Date(),
          fetching: false,
          data: { $set: lines }
        }
      });
      return data;
    }).catch((e) => {
      const response = ["Logs currently not available. Try again in a minute..."];
      this.model.setObject({
        logs: {
          fetched: new Date(),
          fetching: false,
          data: { $set: response }
        }
      });
      return response;
    });
  }

  async fetchPipeline() {
    // check if already fetching data
    const fetching = this.model.get('pipelines.fetching');
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
      this.model.set('pipelines.fetching', false);
      throw error;
    });

    // check if results are outdated
    let pipelinesState = { fetching: false };
    const lastParameters = this.model.get('pipelines.lastParameters');
    if (lastParameters !== JSON.stringify(filters)) {
      pipelinesState.fetched = null;
      this.model.setObject({ pipelines: pipelinesState });
      return {};
    }

    // stop if no pipelines are available
    let mainPipeline = {}
    pipelinesState.fetched = new Date();
    if (pipelines.length === 0) {
      pipelinesState.lastMainId = null;
      pipelinesState.main = { $set: mainPipeline };
      this.model.setObject({ pipelines: pipelinesState });
      return mainPipeline;
    }

    // try to use cached data to find image_build pipeline id
    const lastMainId = this.model.get('pipelines.lastMainId');
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
        this.model.set('pipelines.fetching', false);
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
    const currentMain = this.model.get('pipelines.main');
    if (currentMain && currentMain.id && !mainPipeline.id)
      this.model.set('pipelines.main', {});

    return mainPipeline;
  }


  // * Handle polling * //
  startNotebookPolling(interval = POLLING_INTERVAL) {
    const oldPoller = this.model.get('notebooks.poller');
    if (oldPoller == null) {
      const newPoller = setInterval(() => {
        this.fetchNotebooks();
      }, interval);
      this.model.set('notebooks.poller', newPoller);

      // fetch immediatly
      this.fetchNotebooks();
    }
  }

  stopNotebookPolling() {
    const poller = this.model.get('notebooks.poller');
    if (poller) {
      this.model.set('notebooks.poller', null);
      clearTimeout(poller);
    }
  }

  startPipelinePolling(interval = POLLING_INTERVAL) {
    // start polling or invalidate previous data
    const oldPoller = this.model.get('pipelines.poller');
    if (oldPoller == null) {
      const newPoller = setInterval(() => {
        this.fetchPipeline();
      }, interval);
      this.model.set('pipelines.poller', newPoller);

      // fetch immediatly
      return this.fetchPipeline();
    }
    else {
      this.model.set('pipelines.fetched', null);
    }
  }

  stopPipelinePolling() {
    const poller = this.model.get('pipelines.poller');
    if (poller) {
      this.model.set('pipelines.poller', null);
      clearTimeout(poller);
    }
  }


  // * Change notebook status * //
  startServer() {
    const options = {
      serverOptions: this.model.get('filters.options')
    };
    const filters = this.model.get('filters');
    const namespace = filters.namespace;
    const project = filters.project;
    const branch = filters.branch.name ? filters.branch.name : "master";
    const commit = filters.commit.id ? filters.commit.id : "latest";

    return this.client.startNotebook(namespace, project, branch, commit, options);
  }

  stopNotebook(serverName, force = false) {
    // manually set the state and temporarily throw away servers data until the promise resolves
    const updatedState = {
      filters: { discard: true },
      notebooks: { all: { [serverName]: { status: { ready: false } } } }
    };
    this.model.setObject(updatedState);
    return this.client.stopNotebookServer(serverName, force)
      .then(response => {
        this.model.set('filters.discard', false);
        return response;
      })
      .catch(error => {
        this.model.set('filters.discard', false);
        throw error;
      });
  }


  // * Fetch commits -- to be moved * //
  async fetchCommits() {
    this.model.set('data.fetching', true);
    const filters = this.model.get('filters');
    const projectPathWithNamespace = `${encodeURIComponent(filters.namespace)}%2F${filters.project}`;
    return this.client.getCommits(projectPathWithNamespace, filters.branch.name)
      .then(resp => {
        this.model.setObject({
          data: {
            fetching: false,
            fetched: new Date(),
            commits: { $set: resp.data }
          }
        })
        return resp.data;
      })
      .catch(error => {
        this.model.set('data.fetching', false);
        throw error;
      });
  }
}

export { NotebooksHelper, ExpectedAnnotations, NotebooksCoordinator }
