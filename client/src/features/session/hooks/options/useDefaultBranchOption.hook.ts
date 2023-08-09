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

import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router";
import { GitLabRepositoryBranch } from "../../../project/GitLab.types";
import { setError } from "../../startSession.slice";
import { setBranch } from "../../startSessionOptionsSlice";

interface UseDefaultBranchOptionArgs {
  branches: GitLabRepositoryBranch[] | undefined;
  defaultBranch: string;
}

export default function useDefaultBranchOption({
  branches,
  defaultBranch,
}: UseDefaultBranchOptionArgs): void {
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const branchFromUrl = searchParams.get("branch") ?? "";

  const dispatch = useDispatch();

  // Select the default branch
  useEffect(() => {
    if (branches == null) {
      return;
    }

    if (branches.length == 0) {
      dispatch(setError({ error: "no-commit" }));
      return;
    }

    if (branchFromUrl !== "") {
      const matchedBranch = branches.find(
        (branch) => branch.name === branchFromUrl
      );
      if (matchedBranch != null) {
        dispatch(setBranch(matchedBranch.name));
        return;
      }

      dispatch(
        setError({ error: "invalid-branch", errorMessage: branchFromUrl })
      );
      // Continue with the code below so that we set the branch to the default
    }

    const matchedDefaultBranch = branches.find(
      (branch) => branch.name === defaultBranch
    );
    const branch = matchedDefaultBranch ?? branches[0];
    dispatch(setBranch(branch.name));
  }, [branchFromUrl, branches, defaultBranch, dispatch]);
}
