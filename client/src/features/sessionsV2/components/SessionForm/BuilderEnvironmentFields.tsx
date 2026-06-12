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
import { type Control, type FieldErrors } from "react-hook-form";

import { useProject } from "~/routes/projects/root";
import { ErrorAlert, WarnAlert } from "../../../../components/Alert";
import RtkOrDataServicesError from "../../../../components/errors/RtkOrDataServicesError";
import { Loader } from "../../../../components/Loader";
import AppContext from "../../../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../../../utils/context/appParams.constants";
import { useGetRepositoriesQuery } from "../../../repositories/api/repositories.api";
import { ENVIRONMENT_VALUES_DESCRIPTION } from "../../session.constants";
import { getLauncherCategoryDefinition } from "../../session.utils";
import type {
  LauncherCategory,
  SessionLauncherForm,
} from "../../sessionsV2.types";
import { JsonField } from "./AdvancedSettingsFields";
import BuilderAdvancedSettings from "./BuilderAdvancedSettings";
import BuilderFrontendSelector from "./BuilderFrontendSelector";
import BuilderTypeSelector from "./BuilderTypeSelector";
import CodeRepositoryAdvancedSettings from "./CodeRepositoryAdvancedSettings";
import CodeRepositorySelector from "./CodeRepositorySelector";

interface BuilderEnvironmentFieldsProps {
  control: Control<SessionLauncherForm>;
  errors?: FieldErrors<SessionLauncherForm>;
  isEdit?: boolean;
  launcherCategory: LauncherCategory;
}

export default function BuilderEnvironmentFields({
  control,
  errors,
  isEdit,
  launcherCategory,
}: BuilderEnvironmentFieldsProps) {
  const { params } = useContext(AppContext);
  const imageBuildersEnabled =
    params?.IMAGE_BUILDERS_ENABLED ?? DEFAULT_APP_PARAMS.IMAGE_BUILDERS_ENABLED;

  const { project } = useProject();
  const repositories = project.repositories ?? [];

  const { data, isLoading, error } = useGetRepositoriesQuery(
    repositories.length > 0 ? repositories : skipToken,
  );
  const categoryDefinition = getLauncherCategoryDefinition(launcherCategory);

  const firstEligibleRepository = useMemo(
    () =>
      data?.findIndex(
        (repo) =>
          repo.data?.status === "valid" &&
          repo.data.metadata?.visibility === "public",
      ),
    [data],
  );

  if (!imageBuildersEnabled) {
    return (
      <ErrorAlert dismissible={false}>
        Creating a {categoryDefinition.text.inline} environment from code is not
        currently supported by this instance of RenkuLab. Contact an
        administrator to learn more.
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
      creating a {categoryDefinition.text.inline} environment from one.
    </WarnAlert>
  ) : error || !data ? (
    <>
      <p className="mb-0">Error: could not check code repositories.</p>
      {error && <RtkOrDataServicesError error={error} dismissible={false} />}
    </>
  ) : firstEligibleRepository == null || firstEligibleRepository < 0 ? (
    <WarnAlert dismissible={false}>
      No publicly accessible code repositories found in this project. RenkuLab
      can only build {categoryDefinition.text.inline} environments from public
      code repositories.
    </WarnAlert>
  ) : (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <div className={cx("d-flex", "flex-column", "gap-1")}>
        <CodeRepositorySelector
          name="repository"
          control={control}
          repositoriesDetails={data}
        />
        <CodeRepositoryAdvancedSettings control={control} />
      </div>
      <BuilderTypeSelector name="builder_variant" control={control} />
      {launcherCategory === "session" && (
        <BuilderFrontendSelector name="frontend_variant" control={control} />
      )}
      {launcherCategory === "job" && (
        <>
          <div>
            <JsonField<SessionLauncherForm>
              control={control}
              name="command"
              label="Job command"
              info={ENVIRONMENT_VALUES_DESCRIPTION.command}
              errors={errors}
              helpText='Enter the command that will run as a job (JSON array format) e.g. ["python","my_repo/main.py"]'
              isOptional={false}
              dataCy="job-command-input"
            />
          </div>
          <div>
            <JsonField<SessionLauncherForm>
              control={control}
              name="args"
              label="Job args"
              info={ENVIRONMENT_VALUES_DESCRIPTION.args}
              errors={errors}
              helpText='Enter a valid JSON array format e.g. ["--arg1", "--arg2", "--pwd=/home/user"]'
              isOptional={true}
              dataCy="job-args-input"
            />
          </div>
        </>
      )}
      {launcherCategory === "session" && (
        <BuilderAdvancedSettings control={control} />
      )}
    </div>
  );

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      {!isEdit && (
        <p className={cx("mb-0")}>
          Let RenkuLab create a customized environment from a code repository. A
          container image will be created based on the requirements found in the
          code repository.
        </p>
      )}
      {content}
    </div>
  );
}
