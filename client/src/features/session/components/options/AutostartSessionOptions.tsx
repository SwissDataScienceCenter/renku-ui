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

import React from "react";
import { RootStateOrAny, useSelector } from "react-redux";
import {
  useGetAllRepositoryBranchesQuery,
  useGetRepositoryCommitsQuery,
} from "../../../repository/repository.api";
import useDefaultBranchOption from "../../hooks/options/useDefaultBranchOption.hook";
import useDefaultCommitOption from "../../hooks/options/useDefaultCommitOption.hook";
import { useStartSessionOptionsSelector } from "../../startSessionOptionsSlice";
import SessionDockerImage from "./SessionDockerImage";

export default function AutostartSessionOptions() {
  useAutostartSessionOptions();

  // eslint-disable-next-line spellcheck/spell-checker
  // TODO(@leafty): refactor `SessionDockerImage` so that we can import hooks here
  return (
    <div className="d-none">
      <SessionDockerImage />
    </div>
  );
}

function useAutostartSessionOptions(): void {
  const defaultBranch = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.defaultBranch
  );
  const gitLabProjectId = useSelector<RootStateOrAny, number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );

  const currentBranch = useStartSessionOptionsSelector(({ branch }) => branch);

  const { data: branches } = useGetAllRepositoryBranchesQuery(
    {
      projectId: `${gitLabProjectId ?? 0}`,
    },
    { skip: !gitLabProjectId }
  );
  const { data: commits } = useGetRepositoryCommitsQuery(
    {
      branch: currentBranch || defaultBranch,
      projectId: `${gitLabProjectId ?? 0}`,
    },
    { skip: !gitLabProjectId }
  );

  // Select default options
  useDefaultBranchOption({ branches, defaultBranch });
  useDefaultCommitOption({ commits });
}
