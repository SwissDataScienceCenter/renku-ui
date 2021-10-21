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
 *  StatuspageAPI.js
 */

/**
 *  Wrapper around statuspage.io
 *
 *  @param {string} pageId - the pageId for this application's status page
 */
class StatuspageAPI {

  constructor(pageId) {
    this.pageId = pageId;
    this.controller = null;
  }

  async summary() {
    const pageId = this.pageId;
    this.controller = new AbortController();
    const { signal } = this.controller;
    let headers = new Headers({
      "Accept": "application/json"
    });

    let queryParams = {
      method: "GET",
      headers: headers,
      signal
    };
    return fetch(`https://${pageId}.statuspage.io/api/v2/summary.json`, queryParams).then(r => r.json());
  }
}

function isStatusConfigured(statuspageId) {
  return statuspageId != null && statuspageId.length > 0;
}

function setStatusSummary(model, statusSummary) {
  model.setObject({ statuspage: { $set: statusSummary } });
}

const statusUpdateInterval = 1000 * 60 * 5; // Update every 5 minutes

function pollStatuspage(statuspageId, model) {
  const statusPage = new StatuspageAPI(statuspageId);

  if (!isStatusConfigured(statuspageId)) {
    setStatusSummary(model, { retrieved_at: new Date(), statuspage: null, error: null, not_configured: true });
    return null;
  }
  async function fetchIncidents() {
    try {
      const result = await statusPage.summary();
      setStatusSummary(model, { retrieved_at: new Date(), statuspage: result, error: null });
    }
    catch (error) {
      // we abort the fetch when the component is unmounted, so we can ignore this error
      if (error.name !== "AbortError")
        setStatusSummary(model, { retrieved_at: new Date(), error });
    }
  }

  // Do an initial fetch
  setTimeout(fetchIncidents, 0);

  // Start polling after the initial fetch returns
  let id = setInterval(fetchIncidents, statusUpdateInterval);
  return () => clearInterval(id);
}

export default StatuspageAPI;

export { isStatusConfigured, pollStatuspage };
