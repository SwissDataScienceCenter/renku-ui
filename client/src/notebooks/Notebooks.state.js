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

import { parseINIString } from "../utils/helpers/HelperFunctions";

const POLLING_INTERVAL = 3000;
const RENKU_INI_SECTION_LEGACY = `renku "interactive"`;
const RENKU_INI_SECTION = "interactive";

const CI_TYPES = {
  anonymous: "anonymous",
  pinned: "pinned",
  logged: "logged",
  owner: "owner",
};

const CI_STAGES = {
  starting: "starting",
  image: "image",
  pipelines: "pipelines",
  jobs: "jobs",
  looping: "looping",
};

const CI_STATUSES = {
  wrong: "wrong",
  success: "success",
  running: "running",
  failure: "failure",
};

const VALID_SETTINGS = [
  "image",
  "cpu_request",
  "memory_request",
  "disk_request",
  "gpu_request",
];

const SESSIONS_PREFIX = "interactive.";

const ExpectedAnnotations = {
  domain: "renku.io",
  "renku.io": {
    required: [
      "branch",
      "commit-sha",
      "default_image_used",
      "namespace",
      "gitlabProjectId",
      "projectName",
      "repository",
      "resourceClassId",
      "hibernation",
      "hibernationBranch",
      "hibernationCommitSha",
      "hibernationDate",
      "hibernationDirty",
      "hibernationSynchronized",
      "hibernatedSecondsThreshold",
    ],
    default: {
      branch: "unknown",
      "commit-sha": "00000000",
      default_image_used: false,
      namespace: "unknown",
      gitlabProjectId: 0,
      projectName: "unknown",
      repository: "https://none",
      resourceClassId: "0",
      hibernation: {},
      hibernationBranch: "",
      hibernationCommitSha: "",
      hibernationDate: "",
      hibernationDirty: false,
      hibernationSynchronized: false,
      hibernatedSecondsThreshold: "0",
    },
  },
};

const LOG_ERROR_KEY = "__error";

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
    ExpectedAnnotations[domain].required.forEach((annotation) => {
      if (
        annotations[prefix + annotation] !== undefined ||
        annotations[annotation] !== undefined
      ) {
        let value = annotations[prefix + annotation] ?? annotations[annotation];
        // convert text boolean where a boolean is expected
        if (
          annotation === "default_image_used" ||
          annotation === "hibernationDirty" ||
          annotation === "hibernationSynchronized"
        ) {
          const origValue =
            annotations[prefix + annotation] ?? annotations[annotation];
          if (
            (origValue &&
              typeof origValue === "string" &&
              origValue.toLowerCase() === "true") ||
            origValue === true
          )
            value = true;
          else value = false;
        }
        // convert text json
        if (annotation === "hibernation") {
          try {
            value = JSON.parse(value);
          } catch (error) {
            if (error instanceof SyntaxError) {
              value = {};
            } else {
              throw error;
            }
          }
        }
        cleaned[annotation] = value;
      } else {
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
  getProjectDefault: (
    notebooksOptions,
    projectOptions,
    projectPrefix = SESSIONS_PREFIX
  ) => {
    let returnObject = {};
    if (!notebooksOptions || !projectOptions) return returnObject;

    // Conversion helper
    const convert = (value) => {
      // return boolean
      if (value === true || value === false) return value;

      // convert stringy boolean
      if (value && value.toLowerCase() === "true") return true;
      else if (value && value.toLowerCase() === "false") return false;
      // convert stringy number
      else if (!isNaN(value)) return parseFloat(value);

      return value;
    };

    // Define options
    const sortedOptions = Object.keys(notebooksOptions).sort(
      (a, b) =>
        parseInt(notebooksOptions[a].order) -
        parseInt(notebooksOptions[b].order)
    );
    let unknownOptions = [];

    // Get RenkuLab defaults
    let globalDefaults = [...sortedOptions].reduce((defaults, option) => {
      if ("default" in notebooksOptions[option])
        defaults[option] = notebooksOptions[option].default;
      return defaults;
    }, {});

    // Overwrite renku defaults
    if (
      projectOptions &&
      projectOptions.default &&
      Object.keys(projectOptions.default)
    ) {
      for (const [key, value] of Object.entries(projectOptions.default)) {
        if (key.startsWith(projectPrefix)) {
          const option = key.substring(projectPrefix.length);
          if (!sortedOptions.includes(option)) unknownOptions.push(option);
          globalDefaults[option] = convert(value);
        }
      }
    }

    // Get project defaults
    let projectDefaults = [];
    if (
      projectOptions &&
      projectOptions.config &&
      Object.keys(projectOptions.config)
    ) {
      for (const [key, value] of Object.entries(projectOptions.config)) {
        if (key.startsWith(projectPrefix)) {
          const option = key.substring(projectPrefix.length);
          if (!sortedOptions.includes(option)) unknownOptions.push(option);
          projectDefaults[option] = convert(value);
        }
      }
    }

    return {
      defaults: {
        global: globalDefaults,
        project: projectDefaults,
      },
      options: {
        known: sortedOptions,
        unknown: unknownOptions,
      },
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
    } catch (error) {
      parsedData = {};
    }
    // check single props when the environment sections is available
    let parsedOptions = parsedData[RENKU_INI_SECTION];
    // check also the previous section name for compatibility reasons
    if (!parsedOptions) parsedOptions = parsedData[RENKU_INI_SECTION_LEGACY];
    if (parsedOptions) {
      Object.keys(parsedOptions).forEach((parsedOption) => {
        // treat "defaultUrl" as "default_url" to allow name consistency in the the .ini file
        let option = parsedOption;
        if (parsedOption === "defaultUrl") option = "default_url";

        // convert boolean and numbers
        let value = parsedOptions[parsedOption];
        if (value && value.toLowerCase() === "true")
          projectOptions[option] = true;
        else if (value && value.toLowerCase() === "false")
          projectOptions[option] = false;
        else if (!isNaN(value)) projectOptions[option] = parseFloat(value);
        else projectOptions[option] = value;
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
      if (typeof currentValue === "string") return true;
      return false;
    }

    const globalOption = globalOptions[currentOption];
    // the project option must be part of the global options
    if (!globalOption) return false;

    // non-enum options require only type-check
    if (globalOption.type !== "enum") {
      if (globalOption.type === "boolean") {
        if (typeof currentValue === "boolean") return true;
        return false;
      } else if (globalOption.type === "float" || globalOption.type === "int") {
        if (typeof currentValue === "number") return true;
        return false;
      }
      return false;
    }

    // enum options must have a value valid for the corresponding global options
    if (
      globalOption.options &&
      globalOption.options.length &&
      globalOption.options.includes(currentValue)
    )
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
    if (!name || typeof name !== "string" || !name.length) return false;
    if (!VALID_SETTINGS.includes(name)) return false;
    if (!value || typeof value !== "string" || !value.length) return false;

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
      available: false,
    };

    if (ci.stage == null) return returnObject;
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
    } else if (!currentCi.fetched) {
      returnObject.ongoing = true;
    } else if (ci.stage === CI_STAGES.image || ci.stage === CI_STAGES.looping) {
      // Can't be available if we are checking pipelines in another stage
      returnObject.available = currentCi.available ? true : false;
    }
    // We don't use `fetching` because some stages keep polling
    returnObject.ongoing = currentCi.fetched ? false : true;

    return returnObject;
  },

  getCiJobStatus: (job) => {
    if (job && job["id"]) {
      if (job.status === "success") return CI_STATUSES.success;
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
  validSettings: VALID_SETTINGS,
};

export { LOG_ERROR_KEY, NotebooksHelper, ExpectedAnnotations };
