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
import { setError } from "../../startSession.slice";
import { setCommit } from "../../startSessionOptionsSlice";
import { GitLabRepositoryCommit } from "../../../project/GitLab.types";

interface UseDefaultCommitOptionArgs {
  commits: GitLabRepositoryCommit[] | undefined;
}

export default function useDefaultCommitOption({
  commits,
}: UseDefaultCommitOptionArgs): void {
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const commitFromUrl = searchParams.get("commit") ?? "";

  const dispatch = useDispatch();

  // Select the default commit
  useEffect(() => {
    if (commits == null) {
      return;
    }

    if (commits.length == 0) {
      dispatch(setError({ error: "no-commit" }));
      return;
    }

    if (commitFromUrl !== "") {
      const matchedCommit = commits.find(
        (commit) => commit.id === commitFromUrl
      );
      if (matchedCommit != null) {
        dispatch(setCommit(matchedCommit.id));
        return;
      }

      dispatch(
        setError({ error: "invalid-commit", errorMessage: commitFromUrl })
      );
      // Continue with the code below so that we set the commit to the latest one
    }

    dispatch(setCommit(commits[0].id));
  }, [commitFromUrl, commits, dispatch]);
}
