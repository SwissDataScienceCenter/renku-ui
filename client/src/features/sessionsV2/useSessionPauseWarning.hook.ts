/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
 * limitations under the License
 */

import { skipToken } from "@reduxjs/toolkit/query/react";
import { useEffect, useState } from "react";

import {
  useGetClassesByClassIdQuery,
  useGetResourcePoolsByResourcePoolIdQuery,
} from "./api/computeResources.api";
import { PAUSE_SESSION_WARNING_GRACE_PERIOD_SECONDS } from "./session.constants";

interface StartPauseWarningProps {
  classId?: number;
}

export default function useSessionPauseWarning({
  classId,
}: StartPauseWarningProps) {
  const [isDone, setIsDone] = useState(false);
  const [pauseWarningSeconds, setPauseWarningSeconds] = useState<
    number | undefined
  >(undefined);
  const resourceClasses = useGetClassesByClassIdQuery(
    classId ? { classId: classId.toString() } : skipToken
  );

  const resourcePool = useGetResourcePoolsByResourcePoolIdQuery(
    resourceClasses.data?.id ? { resourcePoolId: 2 } : skipToken
  );

  useEffect(() => {
    if (!classId || resourceClasses.isLoading || resourcePool.isLoading) {
      return;
    }
    if (resourceClasses.isError || resourcePool.isError) {
      setPauseWarningSeconds(PAUSE_SESSION_WARNING_GRACE_PERIOD_SECONDS);
      setIsDone(true);
      return;
    }
    if (
      resourcePool.isSuccess &&
      resourcePool?.data.hibernation_warning_period
    ) {
      setPauseWarningSeconds(resourcePool.data.hibernation_warning_period);
    } else {
      setPauseWarningSeconds(PAUSE_SESSION_WARNING_GRACE_PERIOD_SECONDS);
    }
    setIsDone(true);
  }, [
    classId,
    resourceClasses.isError,
    resourcePool.isError,
    resourceClasses.isLoading,
    resourcePool.isLoading,
    resourcePool.isSuccess,
    resourcePool.data,
  ]);

  return {
    isError: resourceClasses.isError || resourcePool.isError,
    isLoading: resourceClasses.isLoading || resourcePool.isLoading,
    isDone,
    pauseWarningSeconds,
  };
}
