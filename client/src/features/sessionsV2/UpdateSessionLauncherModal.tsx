/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
import { useCallback, useEffect } from "react";
import { CheckLg, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";

import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import {
  useGetSessionEnvironmentsQuery,
  useUpdateSessionLauncherMutation,
} from "./sessionsV2.api";
import {
  EnvironmentKind,
  SessionLauncher,
  SessionLauncherEnvironment,
} from "./sessionsV2.types";
import { Loader } from "../../components/Loader";
import { SessionEnvironmentItem } from "./AddSessionLauncherButton";

interface UpdateSessionLauncherModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
  toggle: () => void;
}

export default function UpdateSessionLauncherModal({
  isOpen,
  launcher,
  toggle,
}: UpdateSessionLauncherModalProps) {
  const {
    data: environments,
    error,
    isLoading,
  } = useGetSessionEnvironmentsQuery();

  const [updateSessionLauncher, result] = useUpdateSessionLauncherMutation();

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<UpdateSessionLauncherForm>({
    defaultValues: {
      name: launcher.name,
      description: launcher.description ?? "",
      environment_kind: launcher.environment_kind,
      environment_id:
        launcher.environment_kind === "global_environment"
          ? launcher.environment_id
          : "",
      container_image:
        launcher.environment_kind === "container_image"
          ? launcher.container_image
          : "",
    },
  });
  const onSubmit = useCallback(
    (data: UpdateSessionLauncherForm) => {
      const { description, name } = data;
      const environment: SessionLauncherEnvironment =
        data.environment_kind === "global_environment"
          ? {
              environment_kind: "global_environment",
              environment_id: data.environment_id,
            }
          : {
              environment_kind: "container_image",
              container_image: data.container_image,
            };
      updateSessionLauncher({
        launcherId: launcher.id,
        name,
        description: description.trim() ? description : undefined,
        ...environment,
      });
    },
    [launcher.id, updateSessionLauncher]
  );

  const watchEnvironmentKind = watch("environment_kind");

  useEffect(() => {
    if (environments == null) {
      return;
    }
    if (environments.length == 0) {
      setValue("environment_kind", "container_image");
    }
  }, [environments, setValue]);

  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    toggle();
  }, [result.isSuccess, toggle]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      result.reset();
    }
  }, [isOpen, reset, result]);

  useEffect(() => {
    reset({
      name: launcher.name,
      description: launcher.description ?? "",
      environment_kind: launcher.environment_kind,
      environment_id:
        launcher.environment_kind === "global_environment"
          ? launcher.environment_id
          : "",
      container_image:
        launcher.environment_kind === "container_image"
          ? launcher.container_image
          : "",
    });
  }, [launcher, reset]);

  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <Form
        className="form-rk-green"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <ModalHeader toggle={toggle}>Edit session {launcher.name}</ModalHeader>
        <ModalBody>
          {result.error && <RtkErrorAlert error={result.error} />}

          <div className="mb-3">
            <Label className="form-label" for="addSessionLauncherName">
              Name
            </Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  className={cx(errors.name && "is-invalid")}
                  id="addSessionLauncherName"
                  placeholder="session name"
                  type="text"
                  {...field}
                />
              )}
              rules={{ required: true }}
            />
            <div className="invalid-feedback">Please provide a name</div>
          </div>

          <div className="mb-3">
            <Label className="form-label" for="addSessionLauncherDescription">
              Description
            </Label>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <textarea
                  className="form-control"
                  id="addSessionLauncherDescription"
                  placeholder="session description"
                  rows={3}
                  {...field}
                />
              )}
            />
          </div>

          <div className="mb-3">
            <div className="form-label">Environment Type</div>

            <Controller
              control={control}
              name="environment_kind"
              render={({ field }) => (
                <div className={cx("d-flex", "gap-2")}>
                  <Input
                    className="btn-check"
                    id="addSessionLauncherGlobalEnvironment"
                    type="radio"
                    {...field}
                    value={"global_environment"}
                    checked={field.value === "global_environment"}
                    disabled={environments && environments.length == 0}
                  />
                  <Label
                    className={cx(
                      "btn",
                      "btn-outline-rk-green",
                      environments && environments.length == 0 && "d-none"
                    )}
                    for="addSessionLauncherGlobalEnvironment"
                  >
                    Global environment
                  </Label>

                  <Input
                    className="btn-check"
                    id="addSessionLauncherContainerImage"
                    type="radio"
                    {...field}
                    value={"container_image"}
                    checked={field.value === "container_image"}
                  />
                  <Label
                    className={cx("btn", "btn-outline-rk-green")}
                    for="addSessionLauncherContainerImage"
                  >
                    Container image
                  </Label>
                </div>
              )}
            />
          </div>

          <div
            className={cx(
              watchEnvironmentKind !== "global_environment" && "d-none"
            )}
          >
            <div className="form-label">Environment</div>

            {isLoading && (
              <p>
                <Loader className="me-1" inline size={16} />
                Loading environments...
              </p>
            )}
            {error && (
              <>
                <p>Cannot load environments</p>
                <RtkErrorAlert dismissible={false} error={error} />
              </>
            )}
            {environments && environments.length > 0 && (
              <Controller
                control={control}
                name="environment_id"
                render={({ field }) => (
                  <>
                    <Row className={cx("row-cols-2", "gy-4")}>
                      {environments.map((environment) => (
                        <SessionEnvironmentItem
                          key={environment.id}
                          environment={environment}
                          field={field}
                        />
                      ))}
                    </Row>
                    <Input
                      className={cx(errors.environment_id && "is-invalid")}
                      id="addSessionLauncherEnvironmentId"
                      type="hidden"
                      {...field}
                    />
                    <div className="invalid-feedback">
                      Please choose an environment
                    </div>
                  </>
                )}
                rules={{
                  required: watchEnvironmentKind === "global_environment",
                }}
              />
            )}
          </div>

          <div
            className={cx(
              watchEnvironmentKind !== "container_image" && "d-none"
            )}
          >
            <Label
              className="form-label"
              for="addSessionLauncherContainerImage"
            >
              Container Image
            </Label>
            <Controller
              control={control}
              name="container_image"
              render={({ field }) => (
                <Input
                  className={cx(errors.container_image && "is-invalid")}
                  id="addSessionLauncherContainerImage"
                  placeholder="Docker image"
                  type="text"
                  {...field}
                />
              )}
              rules={{ required: watchEnvironmentKind === "container_image" }}
            />
            <div className="invalid-feedback">
              Please provide a container image
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button className="btn-outline-rk-green" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button disabled={result.isLoading || !isDirty} type="submit">
            <CheckLg className={cx("bi", "me-1")} />
            Update session
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

interface UpdateSessionLauncherForm {
  name: string;
  description: string;
  environment_kind: EnvironmentKind;
  environment_id: string;
  container_image: string;
}
