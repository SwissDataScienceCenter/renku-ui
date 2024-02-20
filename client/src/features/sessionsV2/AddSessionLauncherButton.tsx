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
import { useCallback, useEffect, useState } from "react";
import { PlusLg, XLg } from "react-bootstrap-icons";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import { useParams } from "react-router-dom-v5-compat";
import {
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";

import { Loader } from "../../components/Loader";
import { TimeCaption } from "../../components/TimeCaption";
import { CommandCopy } from "../../components/commandCopy/CommandCopy";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import {
  useAddSessionLauncherMutation,
  useGetSessionEnvironmentsQuery,
} from "./sessionsV2.api";
import {
  EnvironmentKind,
  SessionEnvironment,
  SessionLauncherEnvironment,
} from "./sessionsV2.types";

import styles from "./AddSessionLauncherButton.module.scss";

export default function AddSessionLauncherButton() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button className="btn-outline-rk-green" onClick={toggle}>
        <PlusLg className={cx("bi", "me-1")} />
        Add Session
      </Button>
      <AddSessionLauncherModal isOpen={isOpen} toggle={toggle} />
    </>
  );
}

interface AddSessionLauncherModalProps {
  isOpen: boolean;
  toggle: () => void;
}

function AddSessionLauncherModal({
  isOpen,
  toggle,
}: AddSessionLauncherModalProps) {
  const { id: projectId } = useParams<"id">();

  const {
    data: environments,
    error,
    isLoading,
  } = useGetSessionEnvironmentsQuery();

  const [addSessionLauncher, result] = useAddSessionLauncherMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<AddSessionLauncherForm>({
    defaultValues: {
      name: "",
      description: "",
      environment_kind: "global_environment",
      environment_id: "",
      container_image: "",
    },
  });
  const onSubmit = useCallback(
    (data: AddSessionLauncherForm) => {
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
      addSessionLauncher({
        project_id: projectId ?? "",
        name,
        description: description.trim() ? description : undefined,
        ...environment,
      });
    },
    [addSessionLauncher, projectId]
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
        <ModalHeader toggle={toggle}>Add session</ModalHeader>
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
          <Button disabled={result.isLoading} type="submit">
            <PlusLg className={cx("bi", "me-1")} />
            Add Session
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

interface AddSessionLauncherForm {
  name: string;
  description: string;
  environment_kind: EnvironmentKind;
  environment_id: string;
  container_image: string;
}

interface SessionEnvironmentItemProps {
  environment: SessionEnvironment;
  field: ControllerRenderProps<AddSessionLauncherForm, "environment_id">;
}

function SessionEnvironmentItem({
  environment,
  field,
}: SessionEnvironmentItemProps) {
  const { container_image, creation_date, id, name, description } = environment;
  const isSelected = field.value === id;

  return (
    <Col>
      <Input
        className="btn-check"
        id={`addSessionLauncherGlobalEnvironment-${id}`}
        type="radio"
        {...field}
        value={id}
        checked={isSelected}
      />
      <Label
        className={cx(
          "d-block",
          "h-100",
          "w-100",
          "rounded",
          "focus-ring",
          "focus-ring-primary",
          "cursor-pointer",
          styles.environmentLabel
        )}
        for={`addSessionLauncherGlobalEnvironment-${id}`}
      >
        <Card
          className={cx(
            "border",
            "rounded",
            isSelected ? "border-rk-green" : "border-rk-white",
            isSelected && "bg-rk-green",
            isSelected && "text-white"
          )}
        >
          <CardBody className={cx("rounded", styles.environmentCard)}>
            <CardTitle
              className={cx(
                "mb-0",
                "fs-5",
                isSelected && "text-white",
                styles.environmentCardText
              )}
              tag="h5"
            >
              {name}
            </CardTitle>
            <CardText className="mb-0">
              {description ? description : <i>No description</i>}
            </CardText>
            <CardText className="mb-0" tag="div">
              <CommandCopy command={container_image} />
            </CardText>
            <CardText>
              <TimeCaption
                className={cx(
                  isSelected && "text-white",
                  styles.environmentCardText
                )}
                datetime={creation_date}
                enableTooltip
                prefix="Created"
              />
            </CardText>
          </CardBody>
        </Card>
      </Label>
    </Col>
  );
}
