/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useMemo } from "react";
import { useWatch, type Control } from "react-hook-form";

import { WarnAlert } from "../../../../components/Alert";
import { Loader } from "../../../../components/Loader";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { useProject } from "../../../ProjectPageV2/ProjectPageContainer/ProjectPageContainer";
import { useGetRepositoriesProbesQuery } from "../../../repositories/repositories.api";
import type { SessionLauncherForm } from "../../sessionsV2.types";
import CodeRepositorySelector from "./CodeRepositorySelector";

interface BuilderEnvironmentFieldsProps {
  control: Control<SessionLauncherForm>;
}

export default function BuilderEnvironmentFields({
  control,
}: BuilderEnvironmentFieldsProps) {
  const { project } = useProject();
  const repositories = project.repositories ?? [];

  const {
    data: repositoriesDetails,
    isLoading,
    error,
  } = useGetRepositoriesProbesQuery(
    repositories.length > 0 ? { repositoriesUrls: repositories } : skipToken
  );

  const firstEligibleRepository = useMemo(
    () => repositoriesDetails?.findIndex(({ probe }) => probe),
    [repositoriesDetails]
  );

  const watchCodeRepository = useWatch({ control, name: "code_repository" });

  const content = isLoading ? (
    <p className="mb-0">
      <Loader className="me-1" inline size={16} />
      Checking project repositories...
    </p>
  ) : repositories?.length == 0 ? (
    <WarnAlert dismissible={false}>
      No repositories found in this project. Add a repository first before
      creating a session environment from one.
    </WarnAlert>
  ) : error || repositoriesDetails == null ? (
    <>
      <p className="mb-0">Error: could not check code repositories.</p>
      {error && <RtkOrNotebooksError error={error} dismissible={false} />}
    </>
  ) : firstEligibleRepository == null || firstEligibleRepository < 0 ? (
    <WarnAlert dismissible={false}>
      No publicly accessible code repositories found in this project. RenkuLab
      can only build session environments from public code repositories.
    </WarnAlert>
  ) : (
    <div>
      <CodeRepositorySelector
        name="code_repository"
        control={control}
        repositoriesDetails={repositoriesDetails}
      />
    </div>
  );

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <p className={cx("mb-0")}>
        Let RenkuLab create a customized environment from a code repository. A
        container image will be created based on the requirements found in the
        code repository.
      </p>
      {content}
      <p>
        Repo:
        <code>
          {'"'}
          {watchCodeRepository}
          {'"'}
        </code>
      </p>
    </div>
  );
}
