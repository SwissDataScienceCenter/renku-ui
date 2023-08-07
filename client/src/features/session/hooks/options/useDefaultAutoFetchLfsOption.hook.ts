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
import { RepositoryBranch } from "../../../repository/repository.types";
import { setError } from "../../startSession.slice";
import { setBranch, setLfsAutoFetch } from "../../startSessionOptionsSlice";
import { ProjectConfig } from "../../../project/Project";

interface UseDefaultAutoFetchLfsOptionArgs {
  projectConfig: ProjectConfig | undefined;
}

export default function useDefaultAutoFetchLfsOption({
  projectConfig,
}: UseDefaultAutoFetchLfsOptionArgs): void {
  const dispatch = useDispatch();

  // Set initial value
  useEffect(() => {
    if (projectConfig == null) {
      return;
    }

    dispatch(
      setLfsAutoFetch(projectConfig.config.sessions?.lfsAutoFetch ?? false)
    );
  }, [dispatch, projectConfig]);
}
