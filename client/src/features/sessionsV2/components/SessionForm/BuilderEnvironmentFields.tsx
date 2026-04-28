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
import { useContext, useMemo } from "react";
import { useWatch, type Control, type Path } from "react-hook-form";

import { useProject } from "~/routes/projects/root";
import { ErrorAlert, InfoAlert, WarnAlert } from "../../../../components/Alert";
import RtkOrDataServicesError from "../../../../components/errors/RtkOrDataServicesError";
import { Loader } from "../../../../components/Loader";
import AppContext from "../../../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../../../utils/context/appParams.constants";
import { useGetRepositoriesQuery } from "../../../repositories/api/repositories.api";
import type { SessionLauncherForm } from "../../sessionsV2.types";
import BuilderAdvancedSettings from "./BuilderAdvancedSettings";
import BuilderFrontendSelector from "./BuilderFrontendSelector";
import BuilderTypeSelector from "./BuilderTypeSelector";
import CodeRepositoryAdvancedSettings from "./CodeRepositoryAdvancedSettings";
import CodeRepositorySelector from "./CodeRepositorySelector";

interface BuilderEnvironmentFieldsProps {
  control: Control<SessionLauncherForm>;
  isEdit?: boolean;
}

export default function BuilderEnvironmentFields({
  control,
  isEdit,
}: BuilderEnvironmentFieldsProps) {
  const { params } = useContext(AppContext);
  const imageBuildersEnabled =
    params?.IMAGE_BUILDERS_ENABLED ?? DEFAULT_APP_PARAMS.IMAGE_BUILDERS_ENABLED;

  const { project } = useProject();
  const repositories = project.repositories ?? [];

  const { data, isLoading, error } = useGetRepositoriesQuery(
    repositories.length > 0 ? repositories : skipToken
  );

  const selectedRepositoryUrl = useWatch({
    control,
    name: "repository" as Path<SessionLauncherForm>,
  }) as string;

  const selectedRepositoryIsPrivate = useMemo(
    () =>
      data?.find(
        (repo) =>
          repo.url === selectedRepositoryUrl &&
          repo.data?.metadata?.visibility === "private"
      ),
    [data, selectedRepositoryUrl]
  );

  const firstEligibleRepository = useMemo(
    () =>
      data?.findIndex(
        (repo) =>
          repo.data?.status === "valid" && repo.data.metadata?.pull_permission
      ),
    [data]
  );

  if (!imageBuildersEnabled) {
    return (
      <ErrorAlert dismissible={false}>
        Creating a session environment from code is not currently supported by
        this instance of RenkuLab. Contact an administrator to learn more.
      </ErrorAlert>
    );
  }

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
  ) : error || !data ? (
    <>
      <p className="mb-0">Error: could not check code repositories.</p>
      {error && <RtkOrDataServicesError error={error} dismissible={false} />}
    </>
  ) : firstEligibleRepository == null || firstEligibleRepository < 0 ? (
    <WarnAlert dismissible={false}>
      No accessible code repositories found in this project. Please ensure that
      you have proper access to them.
    </WarnAlert>
  ) : (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <div className={cx("d-flex", "flex-column", "gap-1")}>
        <CodeRepositorySelector
          name="repository"
          control={control}
          repositoriesDetails={data}
        />
        {selectedRepositoryIsPrivate && (
          <InfoAlert dismissible={false} timeout={0}>
            This is a private repository. The image built will be stored in a
            separate dedicated registry.
          </InfoAlert>
        )}
        <CodeRepositoryAdvancedSettings control={control} />
      </div>
      <BuilderTypeSelector name="builder_variant" control={control} />
      <BuilderFrontendSelector name="frontend_variant" control={control} />
      <BuilderAdvancedSettings control={control} />
    </div>
  );

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      {!isEdit && (
        <p className={cx("mb-0")}>
          Let RenkuLab create a customized environment from a code repository.
        </p>
      )}
      {content}
    </div>
  );
}
