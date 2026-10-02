/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import cx from "classnames";
import { useEffect, useMemo } from "react";
import { FileCode } from "react-bootstrap-icons";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { Form, Input } from "reactstrap";

import { getRepositoryName } from "~/features/ProjectPageV2/ProjectPageContent/CodeRepositories/repositories.utils";
import type { Project } from "../../projectsV2/api/projectV2.api";
import type {
  RepositoryAccessPolicyName,
  SessionLauncher,
} from "../api/sessionLaunchersV2.api";
import LauncherResourceModal, {
  AccessPolicySelect,
  LauncherResourceTable,
} from "./LauncherResourceModal";
import {
  DEFAULT_REPOSITORY_ACCESS_POLICY,
  GIT_REFERENCE_PATTERN,
  REPOSITORY_ACCESS_OPTIONS,
} from "./launcherResources.constants";

interface CodeRepositoryAccessField {
  policy: RepositoryAccessPolicyName;
  repositoryId: number;
  url: string;
  writableReferences: string;
}

interface CodeRepositoriesForm {
  repositories: CodeRepositoryAccessField[];
}

function getDefaultValues(repositories: string[]): CodeRepositoriesForm {
  return {
    repositories: repositories.map((url, index) => ({
      policy: DEFAULT_REPOSITORY_ACCESS_POLICY,
      repositoryId: index,
      url,
      writableReferences: "",
    })),
  };
}

function validateWritableReferences(
  value: string,
  policy: RepositoryAccessPolicyName,
): true | string {
  if (policy !== "readWrite") {
    return true;
  }
  const references = value
    .split(",")
    .map((reference) => reference.trim())
    .filter((reference) => reference.length > 0);
  if (references.every((reference) => GIT_REFERENCE_PATTERN.test(reference))) {
    return true;
  }
  return "References must look like refs/heads/<branch> or refs/tags/<tag>.";
}

interface CodeRepositoryRowProps {
  control: Control<CodeRepositoriesForm>;
  index: number;
  setValue: UseFormSetValue<CodeRepositoriesForm>;
  url: string;
}

function CodeRepositoryRow({
  control,
  index,
  setValue,
  url,
}: CodeRepositoryRowProps) {
  const name = getRepositoryName(url);
  const policy = useWatch({
    control,
    name: `repositories.${index}.policy`,
  });
  const isWritable = policy === "readWrite";

  return (
    <tr data-cy="launcher-repository-row">
      <td className="align-middle">{name}</td>
      <td className="align-middle">
        <Controller
          control={control}
          name={`repositories.${index}.policy`}
          render={({ field }) => {
            const { ref, onChange, ...fieldProps } = field;
            return (
              <AccessPolicySelect
                ariaLabel={`Access for ${name}`}
                data-cy={`launcher-repository-access_${index}`}
                innerRef={ref}
                options={REPOSITORY_ACCESS_OPTIONS}
                {...fieldProps}
                onChange={(event: { target: { value: string } }) => {
                  onChange(event);
                  if (event.target.value !== "readWrite") {
                    setValue(`repositories.${index}.writableReferences`, "");
                  }
                }}
              />
            );
          }}
        />
      </td>
      <td className="align-middle">
        <Controller
          control={control}
          name={`repositories.${index}.writableReferences`}
          render={({ field, fieldState }) => {
            const { ref, ...fieldProps } = field;
            return (
              <>
                <Input
                  aria-label={`Writable references for ${name}`}
                  bsSize="sm"
                  className={cx(fieldState.error && "is-invalid")}
                  data-cy={`launcher-repository-references_${index}`}
                  disabled={!isWritable}
                  innerRef={ref}
                  placeholder="refs/heads/main, refs/tags/v1.0.0"
                  type="text"
                  {...fieldProps}
                />
                <div className="invalid-feedback">
                  {fieldState.error?.message}
                </div>
              </>
            );
          }}
          rules={{
            validate: (value, formValues) =>
              validateWritableReferences(
                value,
                formValues.repositories[index].policy,
              ),
          }}
        />
      </td>
    </tr>
  );
}

interface CustomizeCodeRepositoriesModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
  project: Project;
  toggle: () => void;
}

export default function CustomizeCodeRepositoriesModal({
  isOpen,
  launcher,
  project,
  toggle,
}: CustomizeCodeRepositoriesModalProps) {
  const defaultValues = useMemo(
    () => getDefaultValues(project.repositories ?? []),
    [project.repositories],
  );

  const {
    control,
    formState: { isDirty },
    handleSubmit,
    reset,
    setValue,
  } = useForm<CodeRepositoriesForm>({
    defaultValues,
    mode: "onChange",
  });
  const { fields } = useFieldArray({ control, name: "repositories" });
  const onSave = handleSubmit(() => {});

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, isOpen, reset]);

  return (
    <LauncherResourceModal
      dataCy="customize-code-repositories-modal"
      description="Limit access to code repositories in this launcher."
      icon={<FileCode className={cx("bi", "me-1")} />}
      isDirty={isDirty}
      isOpen={isOpen}
      onSave={onSave}
      title={`Customize Code Repositories in ${launcher.name}`}
      toggle={toggle}
    >
      {fields.length < 1 ? (
        <p className={cx("fst-italic", "mb-0")}>No repositories included</p>
      ) : (
        <Form noValidate onSubmit={onSave}>
          <LauncherResourceTable
            dataCy="launcher-repositories-table"
            headers={["Repository name", "Access", "Writable references"]}
          >
            {fields.map((field, index) => (
              <CodeRepositoryRow
                key={field.id}
                control={control}
                index={index}
                setValue={setValue}
                url={field.url}
              />
            ))}
          </LauncherResourceTable>
        </Form>
      )}
    </LauncherResourceModal>
  );
}
