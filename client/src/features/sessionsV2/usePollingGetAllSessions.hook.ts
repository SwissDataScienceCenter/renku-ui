/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

import { useEffect, useState } from "react";

import { useGetSessionsQuery } from "./api/sessionsV2.api";

const SESSION_IN_TRANSITION_POLLING_INTERVAL = 5000;
const DEFAULT_SESSION_POLLING_INTERVAL = 60000;

/**
 * Custom hook to poll for a specific session's status.
 * If the session is running, it stops polling.
 * If the session is not running, it polls at a defined interval.
 */
export default function usePollingGetAllSessionsQuery() {
  const [pollingInterval, setPollingInterval] = useState<number | undefined>(
    DEFAULT_SESSION_POLLING_INTERVAL
  );
  const {
    data: sessions,
    error,
    isFetching,
    isLoading,
  } = useGetSessionsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    pollingInterval,
  });

  useEffect(() => {
    let newPollingInterval = DEFAULT_SESSION_POLLING_INTERVAL;
    for (const session of sessions ?? []) {
      if (
        session.status.state == "starting" ||
        session.status.state == "stopping"
      ) {
        newPollingInterval = SESSION_IN_TRANSITION_POLLING_INTERVAL;
        break;
      }
    }
    setPollingInterval(newPollingInterval);
  }, [sessions]);

  return {
    error,
    isFetching,
    isLoading,
    sessions: sessions ?? [],
  };
}
