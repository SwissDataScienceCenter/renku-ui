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
 *  Url.js
 *  Url helper object.
 */

/** Class to represent a set of rules to derive a specific URL */
class UrlRule {
  /**
   * Create a set of metadata to construct and validate URLs, throwing early errors to help developers in
   * preventing bugs.
   *
   * @param {function} output - function to derive the relative URL. If any member is required, it must have one
   *   argument, used to assign a data object.
   * @param {string[]} [required] - array of strings corresponding to the required members of the data object, if any.
   * @param {function} [validation] - function to further validate the data parameters. Must return `true` to succeed.
   *   Throw meaningful errors otherwise.
   * @param {string[]} examples - a list of valid URLs. Useful as a reference for the developers, especially when
   *   the output function consumes a lots of data parameters.
   */
  constructor(output, required = [], validation = null, examples = []) {
    // check required
    if (!Array.isArray(required))
      throw new Error("The <required> parameter must be an array.");
    else if (required.some(v => typeof v !== "string"))
      throw new Error("The <required> parameter must contain only strings representing the required data fields.");
    else
      this.required = required;

    // check output
    if (typeof output !== "function")
      throw new Error("The required <output> parameter must be a function.");
    else if (required.length && output.length !== 1)
      throw new Error("The <output> function must have an argument to assign an object since fields are required.");
    else
      this.output = output;

    // check validation
    if (validation) {
      if (typeof validation !== "function")
        throw new Error("The optional <validation> parameter must be a function.");
      else
        this.validation = validation;
    }

    // check examples
    if (examples) {
      if (!Array.isArray(examples))
        throw new Error("The optional <examples> parameter must be an array.");
      else if (examples.some(v => typeof v !== "string"))
        throw new Error("The <examples> parameter must contain only strings representing valid URLs.");
      else
        this.examples = examples;
    }
  }

  /**
   * Get the url given the data parameters, where required
   *
   * @param {object} [data] - context data for the url creation
   */
  get(data = {}) {
    // Verify data is an object
    if (data != null && typeof data !== "object")
      throw new Error(`The <data> object, when provided, must be an object.`);

    // Check data are passed.
    if (this.required.length) {
      const providedFields = Object.keys(data);
      for (const required of this.required) {
        if (!providedFields.includes(required))
          throw new Error(`The <data> object must include a <${required}> field.`);
      }
    }

    // Further validate data if a custom function is specified.
    if (this.validation) {
      const valid = this.validation(data);
      if (!valid) {
        const functionCode = this.validation.toString();
        throw new Error(`Invalid data, reason unspecified. You can inspect the validation function: ${functionCode}`);
      }
    }

    // create and return final url
    return this.output(data);
  }
}


/**
 * Validate that all arguments for a search are provided.
 * @param {object} data
 */
function searchValidation(data) {
  const allowedParams = [
    "q", "query", "page", "perPage", "orderBy", "orderSearchAsc", "searchIn", "ascending", "targetUser", "usersOrGroup"
  ];
  const receivedParams = Object.keys(data);
  for (const param of receivedParams) {
    if (!allowedParams.includes(param))
      throw new Error(`The <data> variable can't include ${param}.`);
  }
  return true;
}

/**
 * Construct a URL for a projects search page.
 * @param {string} subSection
 * @returns {function} A function to construct a URL from data.
 */
function projectsSearchUrlBuilder(subSection) {
  return (data) => {
    // create base url
    let url = subSection ?
        `/projects/${subSection}` :
      "/projects";

    // add optional parameters
    if (!data || !Object.keys(data).length)
      return url;
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(data))
      search.append(key, value);
    return `${url}?${search.toString()}`;
  };
}

/**
 * Construct a URL for a project creation page.
 * @returns {function} A function to construct a URL from data.
 */
function projectNewUrlBuilder() {
  return (data) => {
    // create base url
    let url = "/projects/new";
    if (!data || !data.data)
      return url;
    const search = new URLSearchParams();
    search.append("data", data.data);
    return `${url}?${search.toString()}`;
  };
}

/**
 * Construct a URL for a project page.
 * @returns {function} A function to construct a URL from data.
 * @param {string} subSection
 */
function projectPageUrlBuilder(subSection) {
  return (data) => {
    let url = `/projects/${data.namespace}/${data.path}`;
    if (subSection)
      return url + subSection;
    return url;
  };
}

/**
 * Construct a URL for a project page.
 * @returns {function} A function to construct a URL from data.
 */
function projectSessionUrlBuilder() {
  return (data) => {
    return `/projects/${data.namespace}/${data.path}/sessions/show/${data.server}`;
  };
}

/**
 * Construct a URL object for a project page.
 * @returns {function} A function to construct a URL object.
 */
function loginUrlObject() {
  return (data) => {
    const url = "/login";
    const pathname = data.pathname ?
      data.pathname :
      document.location.pathname;
    const search = data.search ?
      data.search :
      document.location.search;
    return {
      pathname: url,
      state: {
        previous: pathname + search
      }
    };
  };
}


/** Module-level variable for the base URL. Set only once */
let baseUrl = null;

/**
 * Set the base url for the full paths. This must be invoked only once at startup.
 *
 * @param {string} url - base url
 */
function setBaseUrl(url) {
  if (baseUrl != null)
    throw new Error("The base url can't be set multiple times");
  const cleanUrl = url.trim();
  baseUrl = cleanUrl.endsWith("/") ?
    url.slice(0, -1) :
    url;
}


/**
 * Create a Url based on the target page. Depending on the specific page, it may require context data.
 *
 * @param {object | string} target - the page you are targeting, as contained in the `pages`  member
 *   (e.g. pages.landing, pages.project.stats, ...).
 * @param {object} [data] - the context data you need to provide, if any
 *   (e.g. for project, you need to provide a `namespace` and a `path`).
 * @param {boolean} [full] - switch between full or relative path. The default is `false`.
 */
function get(target, data, full = false) {
  // One can always omit the final `base` node. In that case, add it automatically.
  if (typeof target === "object" && !(target instanceof UrlRule) && target.base)
    target = target.base;

  // Return url or throw error based on the type of target.
  let url;
  if (typeof target === "string")
    url = target;
  else if (typeof target === "object" && target instanceof UrlRule)
    url = target.get(data);
  else
    throw new Error("Unexpected <target>. Please pick one from the static object <Url.pages>");

  // Add the base url when needed and available.
  if (full) {
    if (baseUrl == null)
      throw new Error("The base url is not properly set");
    return baseUrl + url;
  }
  return url;
}

/** Helper object to handle URLs */
const Url = {
  // One of these pages will be provided by the user as `target` argument in the `get` function.
  // Mind that the final `base` can be omitted. E.G. `pages.help` is equivalent to `pages.help.base`.
  // Please assign only strings or UrlRule objects.
  pages: {
    landing: "/",
    search: "/search",
    help: {
      base: "/help",
      documentation: "/help/docs",
      features: "/help/features",
      status: "/help/status",
      changes: "/help/changes",
    },
    login: {
      base: "/login",
      link: new UrlRule(
        loginUrlObject(), [], null, [
          "{ pathname: '/login', state: { previous: '/projects' } }",
          "{ pathname: '/login', state: { previous: '/projects/new?data=eyJ0aXRsZSI6InRlCc3QifQ==' } }"
        ]
      ),
    },
    projects: {
      base: new UrlRule(
        projectsSearchUrlBuilder(), [], searchValidation, [
          "/projects",
          "/projects?q=test&page=1&orderBy=last_activity_at&orderSearchAsc=false&searchIn=projects"
        ]
      ),
      all: new UrlRule(
        projectsSearchUrlBuilder("all"), [], searchValidation, [
          "/projects/all",
          "/projects/all?q=test&page=1&orderBy=last_activity_at&orderSearchAsc=false&searchIn=projects"
        ]
      ),
      starred: new UrlRule(
        projectsSearchUrlBuilder("starred"), [], searchValidation, [
          "/projects/starred",
          "/projects/starred?q=test&page=1&orderBy=last_activity_at&orderSearchAsc=false&searchIn=projects"
        ]
      )
    },
    project: {
      base: new UrlRule(
        projectPageUrlBuilder(""), ["namespace", "path"], null, [
          "/projects/namespace/path",
          "/projects/group/subgroup/path",
        ]
      ),
      new: new UrlRule(
        projectNewUrlBuilder(), [], null, [
          "/projects/new",
          "/projects/new?data=eyJ0aXRsZSI6InRlC3QifQ==",
        ]
      ),
      session: {
        base: new UrlRule(
          projectPageUrlBuilder("/sessions"), ["namespace", "path"], null, [
            "/projects/namespace/path/sessions",
            "/projects/group/subgroup/path/sessions",
          ]
        ),
        new: new UrlRule(
          projectPageUrlBuilder("/sessions/new"), ["namespace", "path"], null, [
            "/projects/namespace/path/sessions/new",
            "/projects/group/subgroup/path/sessions/new",
          ]
        ),
        autostart: new UrlRule(
          projectPageUrlBuilder("/sessions/new?autostart=1"), ["namespace", "path"], null, [
            "/projects/namespace/path/sessions/new?autostart=1",
            "/projects/group/subgroup/path/sessions/new?autostart=1",
          ]
        ),
        show: new UrlRule(
          projectSessionUrlBuilder(), ["namespace", "path", "server"], null, [
            "/projects/namespace/path/sessions/show/server-id",
            "/projects/group/subgroup/path/sessions/show/server-id",
          ]
        )
      },
      overview: {
        base: new UrlRule(
          projectPageUrlBuilder(""), ["namespace", "path"], null, [
            "/projects/namespace/path",
            "/projects/group/subgroup/path",
          ]
        ),
        stats: new UrlRule(
          projectPageUrlBuilder("/overview/stats"), ["namespace", "path"], null, [
            "/projects/namespace/path/overview/stats",
            "/projects/group/subgroup/path/overview/stats",
          ]
        ),
        commits: new UrlRule(
          projectPageUrlBuilder("/overview/commits"), ["namespace", "path"], null, [
            "/projects/namespace/path/overview/commits",
            "/projects/group/subgroup/path/overview/commits",
          ]
        ),
        status: new UrlRule(
          projectPageUrlBuilder("/overview/status"), ["namespace", "path"], null, [
            "/projects/namespace/path/overview/status",
            "/projects/group/subgroup/path/overview/status",
          ]
        )
      }
    },
    sessions: {
      base: "/sessions",
    },
    datasets: {
      base: "/datasets",
    }
  },

  setBaseUrl: setBaseUrl,
  get: get
};


/**
 * Get and object (dictionary-like) containing the available query parameters and their values.
 *
 * @param {object} [expectedParams] - dictionary-like object with expected query parameters and their default value.
 *   They will be added when the query parameters are missing.
 * @param {object} [convertParams] - Uses the input object (dictionary-like) to convert parameter names. This is
 *   useful to support old parameter names. Newer params have always precedence.
 * @param {bool} [convertTypes] - Convert boolean and numbers automatically instead of leaving them as strings.
 *   Case insensitive. Default is `true`.
 * @returns {object} dictionary-like object containing the query parameters.
 */
function getSearchParams(expectedParams = null, convertParams = null, convertTypes = true) {
  const search = new URLSearchParams(window.location.search);
  let parameters = {};

  // Assign the parameters
  for (const [key, value] of search.entries()) {
    let finalValue = value;
    if (convertTypes) {
      if (!isNaN(value) && !isNaN(parseFloat(value))) // ? REF: https://stackoverflow.com/a/175787/1303090
        finalValue = parseFloat(value);
      else if (value.toLowerCase() === "true")
        finalValue = true;
      else if (value.toLowerCase() === "false")
        finalValue = false;
    }
    parameters[key] = finalValue;
  }

  // Convert the parameters
  if (convertParams && typeof convertParams === "object" && Object.keys(convertParams).length) {
    const currentParams = Object.keys(parameters);
    for (const [convertForm, convertTo] of Object.entries(convertParams)) {
      if (currentParams.includes(convertForm)) {
        if (!currentParams.includes(convertTo))
          parameters[convertTo] = parameters[convertForm];
        delete parameters[convertForm];
      }
    }
  }

  // Add missing parameters
  if (expectedParams && typeof expectedParams === "object" && Object.keys(expectedParams).length) {
    const currentParams = Object.keys(parameters);
    for (const [key, value] of Object.entries(expectedParams)) {
      if (!currentParams.includes(key))
        parameters[key] = value;
    }
  }

  return parameters;
}

export { Url, getSearchParams };

// testing only
export { UrlRule };
