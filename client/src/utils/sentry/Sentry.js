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
 *  Sentry.js
 *  Sentry configuration object.
 */

import * as SentryLib from "@sentry/browser";


const NAMESPACE_DEFAULT = "unknown";
const VERSION_DEFAULT = "unknown";
const RELEASE_UNKNOWN = "unknown";
const RELEASE_DEV = "-dev";
const UI_COMPONENT = "renku-ui";
const EXCLUDED_URLS = [
  /extensions\//i, // Chrome extensions 1
  /^chrome:\/\//i, // Chrome extensions 2
];

// module variables
let uiVersion = VERSION_DEFAULT;
let sentryInitialized = false;
let sentryUrl = null;
let sentryNamespace = NAMESPACE_DEFAULT;
let sentryDenyUrls = [
  ...EXCLUDED_URLS,
];

// module functions
/**
 * Initialize listener to send frontend exceptions to Sentry. This can invoked only once.
 *
 * @param {string} url - Sentry full URL to log errors. This is provided by Sentry when creating
 *   a new project.
 * @param {string} [namespace] - Current Namespace used to assign the error a proper tag. If not
 *   provided, a default value will be used instead.
 * @param {object} [userPromise] - Optional promise expected to resolve in an abject containing user
 *   data. When provided, the user metadata will be added to the exception metadata.
 * @param {string} [version] - UI version.
 * @param {bool} [telepresence] - whether the UI is running on telepresence
 */
function sentryInit(url, namespace = null, userPromise = null, version = null, telepresence = false) {
  // Prevent re-initializing
  if (sentryInitialized)
    throw new Error("Cannot re-initialize the Sentry client.");

  // Check url
  if (!url || typeof url !== "string")
    throw new Error("Please provide a Sentry URL to initialize the client.");

  // Check namespace
  if (namespace != null) {
    if (typeof namespace !== "string" || !namespace.length)
      throw new Error("The optional <namespace> must be a valid string identifying the current namespace.");
    sentryNamespace = namespace;
  }

  // Check userPromise
  if (userPromise != null) {
    if (typeof userPromise !== "object" || !userPromise.then)
      throw new Error("The optional <userPromise> must be a valid promise resolving with user's data.");
  }

  // Check version
  if (version != null) {
    if (typeof version !== "string" || !version.length)
      throw new Error("The optional <version> must be a valid string identifying the UI version.");
    uiVersion = version;
  }

  // Save data
  sentryUrl = url;
  sentryNamespace = namespace;

  // Initialize client
  // ? Reference: https://docs.sentry.io/platforms/javascript/configuration/options/
  SentryLib.init({
    dsn: sentryUrl,
    environment: sentryNamespace,
    release: getRelease(uiVersion),
    beforeSend: (event) => hookBeforeSend(event),
    denyUrls: sentryDenyUrls
  });
  SentryLib.setTags({
    component: UI_COMPONENT,
    telepresence: telepresence ? true : false
  });

  // Handle user data
  if (userPromise != null) {
    userPromise.then(data => {
      const user = data && data.id ?
        { logged: true, id: data.id, username: data.username, email: data.email, signIn: data.current_sign_in_at } :
        { logged: false, id: 0, username: "0" };
      SentryLib.setUser(user);

      // Add username as tag to simplify search
      SentryLib.setTag("user.username", user.username);
    });
  }

  // Finalize and return SentryLib to allow further customization
  sentryInitialized = true;
  return SentryLib;
}

// helper functions
function hookBeforeSend(event) {
  // *** Filters ***
  // errors while previewing the notebooks
  if (event.request.url.includes("/files/blob/") && event.request.url.endsWith(".ipynb"))
    return null;

  return event;
}

/**
 * Return the release definition.
 *
 * @param {string} [version] - UI version in the format "<major>.<minor>.<patch>-<short-SHA>".
 */
function getRelease(version) {
  // Check input validity
  if (!version || typeof version !== "string")
    return RELEASE_UNKNOWN;

  // Check format validity
  const regValid = new RegExp(/^\d*(\.\d*){0,2}(-[a-f0-9]{7,32})?$/);
  const resValid = version.match(regValid);
  if (!resValid || !resValid[0])
    return RELEASE_UNKNOWN;

  // Extract information
  const regRelease = new RegExp(/^\d*(\.\d*){0,2}/);
  const resRelease = version.match(regRelease);
  const release = (!resRelease || !resRelease[0]) ?
    RELEASE_UNKNOWN :
    resRelease[0];
  const regPatch = new RegExp(/-[a-f0-9]{6,32}$/);
  const resPatch = version.match(regPatch);
  const patch = (!resPatch || !resPatch[0]) ?
    "" :
    RELEASE_DEV;
  return release + patch;
}

// exported object
const SentrySettings = {
  initialized: sentryInitialized,
  url: sentryUrl,
  namespace: sentryNamespace,
  init: sentryInit
};


export { SentrySettings as Sentry };

// test only
export { getRelease };
