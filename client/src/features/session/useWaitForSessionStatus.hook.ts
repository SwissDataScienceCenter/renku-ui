/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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
import { useGetSessionsQuery as useGetSessionsQueryV2 } from "../sessionsV2/api/sessionsV2.api";
import { useGetSessionsQuery } from "./sessions.api";
import { SessionStatusState } from "./sessions.types";

const DEFAULT_POLLING_INTERVAL_MS = 5_000;

interface UseWaitForSessionStatusArgs {
  desiredStatus: SessionStatusState | SessionStatusState[];
  pollingInterval?: number;
  sessionName: string;
  skip?: boolean;
}

export default function useWaitForSessionStatus({
  desiredStatus,
  pollingInterval = DEFAULT_POLLING_INTERVAL_MS,
  sessionName,
  skip,
}: UseWaitForSessionStatusArgs) {
  const [isWaiting, setIsWaiting] = useState(false);

  const result = useGetSessionsQuery(undefined, {
    pollingInterval,
    skip: skip || !isWaiting,
  });
  const session = useMemo(() => {
    if (result.data == null) {
      return undefined;
    }
    return Object.values(result.data).find(({ name }) => name === sessionName);
  }, [result.data, sessionName]);

  useEffect(() => {
    if (skip) {
      setIsWaiting(false);
    }
  }, [skip]);

  useEffect(() => {
    if (skip) {
      return;
    }
    const desiredStatuses =
      typeof desiredStatus === "string" ? [desiredStatus] : desiredStatus;
    const isWaiting =
      (session != null && !desiredStatuses.includes(session.status.state)) ||
      (session == null && !desiredStatuses.includes("stopping"));
    setIsWaiting(isWaiting);
  }, [desiredStatus, session, skip]);

  return { isWaiting, session };
}

export function useWaitForSessionStatusV2({
  desiredStatus,
  pollingInterval = DEFAULT_POLLING_INTERVAL_MS,
  sessionName,
  skip,
}: UseWaitForSessionStatusArgs) {
  const [isWaiting, setIsWaiting] = useState(false);

  const result = useGetSessionsQueryV2(undefined, {
    pollingInterval,
    skip: skip || !isWaiting,
  });
  const session = useMemo(() => {
    if (result.data == null) {
      return undefined;
    }
    return Object.values(result.data).find(({ name }) => name === sessionName);
  }, [result.data, sessionName]);

  useEffect(() => {
    if (skip) {
      setIsWaiting(false);
    }
  }, [skip]);

  useEffect(() => {
    if (skip) {
      return;
    }
    const desiredStatuses =
      typeof desiredStatus === "string" ? [desiredStatus] : desiredStatus;
    const isWaiting =
      (session != null && !desiredStatuses.includes(session.status.state)) ||
      (session == null && !desiredStatuses.includes("stopping"));
    setIsWaiting(isWaiting);
  }, [desiredStatus, session, skip]);

  return { isWaiting, session };
}
