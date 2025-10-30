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

import type { ProjectConfig } from "~/features/project/project.types";
import type { ResourceClassWithId } from "~/features/sessionsV2/api/computeResources.api";
import type { ProjectStatistics } from "~/notebooks/components/session.types";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import { useEffect } from "react";

import { setError } from "../../startSession.slice";
import { setStorage } from "../../startSessionOptionsSlice";
import {
  computeRequestedStorageSize,
  validateStorageAmount,
} from "../../utils/sessionOptions.utils";

interface UseDefaultStorageOptionArgs {
  currentSessionClass: ResourceClassWithId | null;
  lfsAutoFetch: boolean;
  projectConfig: ProjectConfig | undefined;
  statistics: ProjectStatistics | null | undefined;
}

export default function useDefaultStorageOption({
  currentSessionClass,
  lfsAutoFetch,
  projectConfig,
  statistics,
}: UseDefaultStorageOptionArgs): void {
  const dispatch = useAppDispatch();

  // Set initial storage if configured
  useEffect(() => {
    if (projectConfig == null || currentSessionClass == null) {
      return;
    }

    const requestedStorage = computeRequestedStorageSize({
      defaultStorage: currentSessionClass.default_storage,
      lfsAutoFetch,
      maxStorage: currentSessionClass.max_storage,
      statistics,
    });

    const desiredValue =
      projectConfig.config.sessions?.storage ??
      projectConfig.default.sessions?.storage ??
      requestedStorage;
    const newValue = validateStorageAmount({
      value: desiredValue,
      maxValue: currentSessionClass.max_storage,
    });

    if (desiredValue != newValue) {
      dispatch(setError({ error: "session-class" }));
      return;
    }

    dispatch(setStorage(newValue));
  }, [currentSessionClass, dispatch, lfsAutoFetch, projectConfig, statistics]);
}
