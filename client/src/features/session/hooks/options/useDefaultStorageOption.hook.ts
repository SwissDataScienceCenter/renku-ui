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
import { useDispatch } from "react-redux";
import { ResourceClass } from "../../../dataServices/dataServices";
import { ProjectConfig } from "../../../project/Project";
import { setStorage } from "../../startSessionOptionsSlice";
import { validateStorageAmount } from "../../utils/sessionOptions.utils";
import { setError } from "../../startSession.slice";

interface UseDefaultStorageOptionArgs {
  currentSessionClass: ResourceClass | null;
  projectConfig: ProjectConfig | undefined;
}

export default function useDefaultStorageOption({
  currentSessionClass,
  projectConfig,
}: UseDefaultStorageOptionArgs): void {
  const dispatch = useDispatch();

  // Set initial storage if configured
  useEffect(() => {
    if (projectConfig == null || currentSessionClass == null) {
      return;
    }

    const desiredValue =
      projectConfig.config.sessions?.storage ??
      projectConfig.default.sessions?.storage ??
      currentSessionClass.default_storage;
    const newValue = validateStorageAmount({
      value: desiredValue,
      maxValue: currentSessionClass.max_storage,
    });

    if (desiredValue != newValue) {
      dispatch(setError({ error: "session-class" }));
      return;
    }

    dispatch(setStorage(newValue));
  }, [currentSessionClass, dispatch, projectConfig]);
}
