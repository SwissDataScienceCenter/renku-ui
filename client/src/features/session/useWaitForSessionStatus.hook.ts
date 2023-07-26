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

import { useEffect, useState } from "react";
import { useGetSessionQuery } from "./sessions.api";
import { SessionStatusState } from "./sessions.types";

const DEFAULT_POLLING_INTERVAL = 1_000;

interface UseWaitForSessionStatusArgs {
  desiredStatus: SessionStatusState;
  pollingInterval?: number;
  sessionName: string;
  skip?: boolean;
}

export default function useWaitForSessionStatus({
  desiredStatus,
  pollingInterval = DEFAULT_POLLING_INTERVAL,
  sessionName,
  skip,
}: UseWaitForSessionStatusArgs) {
  const [isWaiting, setIsWaiting] = useState(false);

  const result = useGetSessionQuery(
    { sessionName },
    { pollingInterval, skip: skip || !isWaiting }
  );

  useEffect(() => {
    if (skip) {
      setIsWaiting(false);
    }
  }, [skip]);

  useEffect(() => {
    if (skip) {
      return;
    }
    const isWaiting =
      result.currentData?.status.state !== desiredStatus ||
      (result.currentData == null && desiredStatus === "stopping");
    setIsWaiting(isWaiting);
  }, [desiredStatus, result.currentData, skip]);

  return { isWaiting, getSessionQuery: result };
}
