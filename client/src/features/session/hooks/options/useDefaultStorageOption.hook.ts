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

import { useEffect } from "react";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import { ResourceClass } from "../../../dataServices/dataServices.types";
import { ProjectConfig } from "../../../project/project.types";
import { setError } from "../../startSession.slice";
import { setStorage } from "../../startSessionOptionsSlice";
import {
  checkStorage,
  validateStorageAmount,
} from "../../utils/sessionOptions.utils";
import { ProjectStatistics } from "../../../../notebooks/components/session.types";

interface UseDefaultStorageOptionArgs {
  currentSessionClass: ResourceClass | null;
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

    const { minimumStorageGb, recommendedStorageGb } =
      checkStorage({ lfsAutoFetch, statistics }) ?? {};
    const clampedRecommended = recommendedStorageGb
      ? validateStorageAmount({
          value: recommendedStorageGb,
          maxValue: currentSessionClass.max_storage,
        })
      : null;
    const requestedStorage =
      clampedRecommended &&
      minimumStorageGb &&
      clampedRecommended > currentSessionClass.default_storage &&
      clampedRecommended > minimumStorageGb
        ? clampedRecommended
        : minimumStorageGb &&
          minimumStorageGb > currentSessionClass.default_storage
        ? minimumStorageGb
        : currentSessionClass.default_storage;

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
