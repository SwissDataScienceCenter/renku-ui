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
 *  Statuspage.container
 *  Components for the displaying information from statuspage.io
 */

import React, { useState, useEffect } from "react";

import useInterval from "../utils/UseInterval";

import { StatuspageDisplay as DisplayPresent, StatuspageBanner as BannerPresent } from "./Statuspage.present";
import StatuspageAPI from "./StatuspageAPI";

function isStatusConfigured(statuspageId) {
  return statuspageId != null && statuspageId.length > 0;
}


const statusUpdateInterval = 1000 * 60 * 5; // Update every 5 minutes

function useStatuspage(statuspageId, model) {
  const [statusSummary, setStatusSummary] = useState({});
  // Do an initial fetch
  useEffect(() => {
    const statusPage = new StatuspageAPI(statuspageId);
    async function fetchIncidents() {
      if (!isStatusConfigured(statuspageId)) {
        setStatusSummary({ retrieved_at: new Date(), statuspage: null, error: null, not_configured: true });
        return;
      }
      try {
        const result = await statusPage.summary();
        setStatusSummary({ retrieved_at: new Date(), statuspage: result, error: null });
      }
      catch (error) {
        // we abort the fetch when the component is unmounted, so we can ignore this error
        if (error.name !== "AbortError")
          setStatusSummary({ error });
      }
    }
    fetchIncidents();
    // Abort the fetch on unmount, otherwise React complains
    return () => { if (statusPage.controller != null) statusPage.controller.abort(); };
  }, [statuspageId]);

  // Start polling after the initial fetch returns
  useInterval(() => {
    async function fetchIncidents() {
      const statusPage = new StatuspageAPI(statuspageId);
      const result = await statusPage.summary();
      setStatusSummary({ retrieved_at: new Date(), statuspage: result, error: null });
    }
    fetchIncidents();
  }, (statusSummary.retrieved_at != null) ? statusUpdateInterval : null);

  // Only status the status if there is something new there
  if (statusSummary.retrieved_at != null) {
    model.setObject(statusSummary);
    return statusSummary;
  }
  return model.get();
}

/**
 *
 * @param {string} props.statuspageId The id for the statuspage
 * @param {object} props.statuspageModel The model for the statuspage
 */
function StatuspageDisplay(props) {
  const statuspageId = props.statuspageId;
  const statusSummary = useStatuspage(statuspageId, props.statuspageModel);
  if (statusSummary.not_configured) return null;

  return <DisplayPresent statusSummary={statusSummary} />;
}

/**
 *
 * @param {string} props.statuspageId The id for the statuspage
 * @param {string} props.siteStatusUrl The URL for the site status page
 * @param {object} props.statuspageModel The model for the statuspage
 */
function StatuspageBanner(props) {
  const statuspageId = props.statuspageId;
  const statusSummary = useStatuspage(statuspageId, props.statuspageModel);
  if (statusSummary.not_configured) return null;

  return <BannerPresent statusSummary={statusSummary} siteStatusUrl={props.siteStatusUrl} />;
}


export { StatuspageDisplay, StatuspageBanner, isStatusConfigured };
