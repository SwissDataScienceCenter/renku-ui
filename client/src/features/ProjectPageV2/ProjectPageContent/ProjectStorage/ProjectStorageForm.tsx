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
 * limitations under the License
 */

import cx from "classnames";
import { PlusLg, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormText,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  UncontrolledTooltip,
} from "reactstrap";

import { InfoAlert } from "~/components/Alert";
import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import LazyMarkdown from "~/components/markdown/LazyMarkdown";
import { MoreInfo } from "~/components/MoreInfo";
import {
  useGetDataConnectorsStorageAllowByProjectIdQuery,
  type ProjectStorage,
} from "~/features/dataConnectorsV2/api/data-connectors.api";
import { usePostDataConnectorsStorageMutation } from "~/features/dataConnectorsV2/api/data-connectors.enhanced-api";
import {
  PROJECT_STORAGE_DEFAULT_GB,
  PROJECT_STORAGE_DEFAULT_MOUNT_PATH,
  PROJECT_STORAGE_MAX_GB,
  PROJECT_STORAGE_MIN_GB,
  PROJECT_STORAGE_STEP_GB,
} from "./projectStorage.constants";

interface ProjectStorageForm {
  size: number;
  mountPath: string;
}

interface ProjectConnectDataConnectorsFormProps {
  projectId: string;
  namespace?: string;
  projectStorage?: ProjectStorage;
  toggle: () => void;
}

export default function ProjectStorageForm({
  projectId,
  namespace,
  projectStorage,
  toggle,
}: ProjectConnectDataConnectorsFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<ProjectStorageForm>({
    mode: "onChange",
    defaultValues: {
      size: projectStorage?.size ?? PROJECT_STORAGE_DEFAULT_GB,
      mountPath:
        projectStorage?.mount_path ?? PROJECT_STORAGE_DEFAULT_MOUNT_PATH,
    },
  });

  const [postDataConnectorsStorageMutation, postDataConnectorsStorageStatus] =
    usePostDataConnectorsStorageMutation();
  const { data: storageAllowData } =
    useGetDataConnectorsStorageAllowByProjectIdQuery({
      projectId: projectId,
    });
  const projectStorageMaxSize =
    storageAllowData?.max_size ?? PROJECT_STORAGE_MAX_GB;

  const onSubmit = async (values: ProjectStorageForm) => {
    if (!projectStorage) {
      // Create new project storage
      const result = await postDataConnectorsStorageMutation({
        projectStoragePost: {
          namespace: namespace ?? "",
          size: values.size,
          mount_path: values.mountPath,
        },
      });
      if (!result.error) {
        toggle();
      }
    } else {
      // TODO: Implement update project storage API call when available
      console.log("Update project storage API call not implemented yet");
      toggle();
    }
  };

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)}>
      <>
        {postDataConnectorsStorageStatus.isError && (
          <RtkOrDataServicesError
            error={postDataConnectorsStorageStatus.error}
          />
        )}
        {!projectStorage && (
          <InfoAlert dismissible={false} timeout={0}>
            You can add a project storage to this project. This will create a
            new storage volume that will be mounted in your sessions to avoid
            data loss on session shutdown.
          </InfoAlert>
        )}
        <div className="mb-3">
          <Label className="form-label" for="size">
            Storage size
          </Label>
          <Controller
            control={control}
            name="size"
            render={({ field, fieldState: { error } }) => (
              <>
                <InputGroup className={cx(error && "is-invalid")}>
                  <Input
                    id="size"
                    className={cx(error && "is-invalid")}
                    type="number"
                    min={PROJECT_STORAGE_MIN_GB}
                    max={projectStorageMaxSize}
                    step={PROJECT_STORAGE_STEP_GB}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) => {
                      if (isNaN(event.target.valueAsNumber)) {
                        field.onChange(event.target.value);
                      } else {
                        field.onChange(event.target.valueAsNumber);
                      }
                    }}
                  />
                  <InputGroupText id="configure-project-storage-addon">
                    GB
                  </InputGroupText>
                  <UncontrolledTooltip target="configure-project-storage-addon">
                    Gigabytes
                  </UncontrolledTooltip>
                </InputGroup>
                <div className="invalid-feedback">
                  {error?.message ||
                    "Please provide a valid value for project storage."}
                </div>
                <FormText>
                  Default: {PROJECT_STORAGE_DEFAULT_GB} GB, max:{" "}
                  {projectStorageMaxSize} GB
                </FormText>
              </>
            )}
            rules={{
              required: true,
              min: {
                value: PROJECT_STORAGE_MIN_GB,
                message: `Please select a value greater than or equal to ${PROJECT_STORAGE_MIN_GB}.`,
              },
              max: {
                value: projectStorageMaxSize,
                message: `Selected project storage exceeds maximum allowed value (${projectStorageMaxSize} GB).`,
              },
              validate: {
                integer: (value: unknown) =>
                  Number.isInteger(Number(value)) ||
                  "Please provide an integer value.",
              },
            }}
          />
        </div>
        <div className="mb-3">
          <div className={cx("d-flex", "align-items-center", "gap-2", "mb-1")}>
            <Label className="form-label" for="mountPath">
              Mount point
            </Label>
            <MoreInfo>
              <LazyMarkdown>
                You can either enter an absolute path (starting with `/`) or a
                relative path (relative to your session&apos;s working
                directory).
              </LazyMarkdown>
            </MoreInfo>
          </div>
          <Controller
            name="mountPath"
            control={control}
            render={({ field }) => (
              <input
                id="mountPath"
                type="text"
                {...field}
                className={cx("form-control", errors.mountPath && "is-invalid")}
                data-cy="project-storage-form-mount-point-input"
              />
            )}
            rules={{ required: true }}
          />
          <div className="invalid-feedback">Please provide a mount point.</div>
          <div className={cx("form-text", "text-muted")}>
            This is the name of the folder in the working directory where you
            will find your project storage in sessions.
          </div>
        </div>

        <div className={cx("d-flex", "gap-2", "justify-content-end")}>
          <Button
            color="outline-primary"
            data-cy="project-storage-form-cancel-button"
            onClick={() => toggle()}
          >
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button
            color="primary"
            data-cy="project-storage-form-submit-button"
            type="submit"
          >
            {projectStorage ? (
              "Update project storage"
            ) : (
              <>
                <PlusLg className={cx("bi", "me-1")} />
                Add project storage
              </>
            )}
          </Button>
        </div>
      </>
    </Form>
  );
}
