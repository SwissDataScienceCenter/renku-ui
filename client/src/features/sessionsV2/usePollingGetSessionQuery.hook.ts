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

import { useEffect, useMemo, useState } from "react";

import { useGetSessionsQuery } from "./api/sessionsV2.api";

const SESSION_NOT_RUNNING_POLLING_INTERVAL = 5000;

/**
 * Custom hook to poll for a specific session's status.
 * If the session is running, it stops polling.
 * If the session is not running, it polls at a defined interval.
 */
export default function usePollingGetSessionQuery({
  sessionName,
}: {
  sessionName: string;
}) {
  const [pollingInterval, setPollingInterval] = useState<number | undefined>(
    SESSION_NOT_RUNNING_POLLING_INTERVAL
  );
  const {
    data: sessions,
    isFetching,
    isLoading,
  } = useGetSessionsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    pollingInterval,
  });

  const thisSession = useMemo(() => {
    if (sessions == null) {
      return undefined;
    }
    return sessions.find(({ name }) => name === sessionName);
  }, [sessionName, sessions]);

  useEffect(() => {
    if (thisSession?.status.state === "running") {
      // If the session is running, we do not need to poll
      setPollingInterval(undefined);
    } else {
      // If the session is not running,
      setPollingInterval(SESSION_NOT_RUNNING_POLLING_INTERVAL);
    }
  }, [thisSession?.status.state]);

  return {
    isFetching,
    isLoading,
    session: thisSession,
  };
}
