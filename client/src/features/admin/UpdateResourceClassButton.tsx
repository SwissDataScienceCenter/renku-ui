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

import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import { CheckLg, PlusLg, TrashFill, XLg } from "react-bootstrap-icons";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  Button,
  Form,
  Input,
  InputGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { Loader } from "../../components/Loader";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { useUpdateResourceClassMutation } from "../dataServices/computeResources.api";
import {
  NodeAffinity,
  ResourceClass,
  ResourcePool,
} from "../dataServices/dataServices.types";

import styles from "./UpdateResourceClassButton.module.scss";

interface UpdateResourceClassButtonProps {
  resourceClass: ResourceClass;
  resourcePool: ResourcePool;
}

export default function UpdateResourceClassButton({
  resourceClass,
  resourcePool,
}: UpdateResourceClassButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button className="btn-sm" color="outline-rk-green" onClick={toggle}>
        Update
      </Button>
      <UpdateResourceClassModal
        isOpen={isOpen}
        resourceClass={resourceClass}
        resourcePool={resourcePool}
        toggle={toggle}
      />
    </>
  );
}

interface UpdateResourceClassModalProps {
  isOpen: boolean;
  resourceClass: ResourceClass;
  resourcePool: ResourcePool;
  toggle: () => void;
}

function UpdateResourceClassModal({
  isOpen,
  resourceClass,
  resourcePool,
  toggle,
}: UpdateResourceClassModalProps) {
  const { id } = resourceClass;
  const { quota } = resourcePool;

  const [updateResourceClass, result] = useUpdateResourceClassMutation();

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
  } = useForm<UpdateResourceClassForm>({
    defaultValues: {
      cpu: resourceClass.cpu,
      default: resourceClass.default,
      default_storage: resourceClass.default_storage,
      gpu: resourceClass.gpu,
      max_storage: resourceClass.max_storage,
      memory: resourceClass.memory,
      name: resourceClass.name,
      tolerations: (resourceClass.tolerations ?? []).map((label) => ({
        label,
      })),
      node_affinities: resourceClass.node_affinities ?? [],
    },
  });
  const {
    fields: tolerationsFields,
    append: tolerationsAppend,
    remove: tolerationsRemove,
  } = useFieldArray({
    control,
    name: "tolerations",
  });
  const {
    fields: affinitiesFields,
    append: affinitiesAppend,
    remove: affinitiesRemove,
  } = useFieldArray({ control, name: "node_affinities" });
  const onSubmit = useCallback(
    (data: UpdateResourceClassForm) => {
      const tolerations = data.tolerations.map(({ label }) => label);
      updateResourceClass({
        resourcePoolId: resourcePool.id,
        resourceClassId: resourceClass.id,
        ...data,
        tolerations,
      });
    },
    [resourceClass.id, resourcePool.id, updateResourceClass]
  );

  const onAddTolerationLabel = useCallback(() => {
    tolerationsAppend({ label: "" });
  }, [tolerationsAppend]);

  const onAddNodeAffinity = useCallback(() => {
    affinitiesAppend({ key: "", required_during_scheduling: false });
  }, [affinitiesAppend]);

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
      reset();
    }
  }, [reset, result.isSuccess, toggle]);

  useEffect(() => {
    reset({
      cpu: resourceClass.cpu,
      default: resourceClass.default,
      default_storage: resourceClass.default_storage,
      gpu: resourceClass.gpu,
      max_storage: resourceClass.max_storage,
      memory: resourceClass.memory,
      name: resourceClass.name,
      tolerations: (resourceClass.tolerations ?? []).map((label) => ({
        label,
      })),
      node_affinities: resourceClass.node_affinities ?? [],
    });
  }, [reset, resourceClass]);

  return (
    <Modal
      backdrop="static"
      centered
      className={styles.modal}
      fullscreen="lg"
      isOpen={isOpen}
      scrollable
      size="lg"
      toggle={toggle}
    >
      <ModalHeader toggle={toggle}>Update {resourceClass.name}</ModalHeader>
      <ModalBody>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkErrorAlert error={result.error} />}

          <div className="mb-3">
            <Label className="form-label" for={`updateResourceClassName-${id}`}>
              Name
            </Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  className={cx("form-control", errors.name && "is-invalid")}
                  id={`updateResourceClassName-${id}`}
                  type="text"
                  {...field}
                />
              )}
              rules={{ required: true }}
            />
            <div className="invalid-feedback">Please provide a name</div>
          </div>

          <div className="mb-3">
            <Label className="form-label" for={`updateResourceClassCpu-${id}`}>
              CPUs
            </Label>
            <Controller
              control={control}
              name="cpu"
              render={({ field }) => (
                <Input
                  className={cx(errors.cpu && "is-invalid")}
                  id={`updateResourceClassCpu-${id}`}
                  type="number"
                  min={0.1}
                  step={0.1}
                  {...field}
                />
              )}
              rules={{ min: 0.1, max: quota?.cpu }}
            />
            <div className="invalid-feedback">Invalid value for CPUs</div>
          </div>

          <div className="mb-3">
            <Label
              className="form-label"
              for={`updateResourceClassMemory-${id}`}
            >
              Memory (GB RAM)
            </Label>
            <Controller
              control={control}
              name="memory"
              render={({ field }) => (
                <Input
                  className={cx(errors.memory && "is-invalid")}
                  id={`updateResourceClassMemory-${id}`}
                  type="number"
                  min={1}
                  step={1}
                  {...field}
                />
              )}
              rules={{ min: 1, max: quota?.memory }}
            />
            <div className="invalid-feedback">Invalid value for memory</div>
          </div>

          <div className="mb-3">
            <Label className="form-label" for={`updateResourceClassGpu-${id}`}>
              GPUs
            </Label>
            <Controller
              control={control}
              name="gpu"
              render={({ field }) => (
                <Input
                  className={cx(errors.gpu && "is-invalid")}
                  id={`updateResourceClassGpu-${id}`}
                  type="number"
                  min={0}
                  step={1}
                  {...field}
                />
              )}
              rules={{ min: 0, max: quota?.gpu }}
            />
            <div className="invalid-feedback">Invalid value for GPUs</div>
          </div>

          <div className="mb-3">
            <Label
              className="form-label"
              for={`updateResourceClassDefaultStorage-${id}`}
            >
              Default storage (GB disk)
            </Label>
            <Controller
              control={control}
              name="default_storage"
              render={({ field }) => (
                <Input
                  id={`updateResourceClassDefaultStorage-${id}`}
                  type="number"
                  min={1}
                  step={1}
                  {...field}
                />
              )}
            />
          </div>

          <div className="mb-3">
            <Label
              className="form-label"
              for={`updateResourceClassMaxStorage-${id}`}
            >
              Max storage (GB disk)
            </Label>
            <Controller
              control={control}
              name="max_storage"
              render={({ field }) => (
                <Input
                  id={`updateResourceClassMaxStorage-${id}`}
                  type="number"
                  min={1}
                  step={1}
                  {...field}
                />
              )}
            />
          </div>

          <div className="mb-3">
            <div className="form-label">Tolerations</div>
            <Button
              className="btn-outline-rk-green"
              onClick={onAddTolerationLabel}
              type="button"
            >
              <PlusLg className={cx("bi", "me-1")} />
              Add label
            </Button>
            {tolerationsFields.map((item, index) => (
              <InputGroup className="my-1" key={item.id}>
                <Controller
                  control={control}
                  name={`tolerations.${index}.label`}
                  render={({ field }) => (
                    <Input
                      className={cx(
                        "form-control",
                        "rounded-0",
                        "rounded-start",
                        errors.tolerations?.at?.(index) && "is-invalid"
                      )}
                      id={`updateResourceClassTolerations-${item.id}-${id}`}
                      type="text"
                      {...field}
                    />
                  )}
                  rules={{ required: true }}
                />
                <Button
                  className="rounded-end"
                  onClick={() => tolerationsRemove(index)}
                  type="button"
                >
                  <TrashFill className="bi" />
                  <span className="visually-hidden">Remove</span>
                </Button>
                <div className="invalid-feedback">Please provide a label</div>
              </InputGroup>
            ))}
          </div>

          <div>
            <div className="form-label">Node affinities</div>
            <Button
              className="btn-outline-rk-green"
              onClick={onAddNodeAffinity}
              type="button"
            >
              <PlusLg className={cx("bi", "me-1")} />
              Add node affinity
            </Button>
            {affinitiesFields.map((item, index) => (
              <div
                className={cx(
                  "d-flex",
                  "flew-row",
                  "flex-wrap",
                  "align-items-center",
                  "my-3"
                )}
                key={item.id}
              >
                <div className={cx("flex-grow-1", "me-2")}>
                  <InputGroup>
                    <span className={cx("input-group-text", "rounded-start")}>
                      Key
                    </span>
                    <Controller
                      control={control}
                      name={`node_affinities.${index}.key`}
                      render={({ field }) => (
                        <Input
                          className={cx(
                            "form-control",
                            "rounded-0",
                            errors.node_affinities?.at?.(index) && "is-invalid"
                          )}
                          id={`updateResourceClassNodeAffinitiesKey-${item.id}-${id}`}
                          type="text"
                          {...field}
                        />
                      )}
                      rules={{ required: true }}
                    />
                    <Button
                      className="rounded-end"
                      onClick={() => affinitiesRemove(index)}
                      type="button"
                    >
                      <TrashFill className="bi" />
                      <span className="visually-hidden">Remove</span>
                    </Button>
                    <div className="invalid-feedback">Please provide a key</div>
                  </InputGroup>
                </div>

                <div>
                  <Controller
                    control={control}
                    name={`node_affinities.${index}.required_during_scheduling`}
                    render={({ field }) => (
                      <Input
                        className="form-check-input"
                        id={`updateResourceClassNodeAffinitiesRequired-${item.id}-${id}`}
                        type="checkbox"
                        checked={field.value}
                        innerRef={field.ref}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Label
                    className={cx("form-check-label", "ms-2")}
                    for={`updateResourceClassNodeAffinitiesRequired-${item.id}-${id}`}
                  >
                    Required during scheduling
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button className="btn-outline-rk-green" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        <Button
          disabled={result.isLoading || !isDirty}
          onClick={handleSubmit(onSubmit)}
          type="submit"
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Update resource class
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface UpdateResourceClassForm {
  name: string;
  cpu: number;
  memory: number;
  gpu: number;
  default_storage: number;
  max_storage: number;
  default: boolean;
  tolerations: TolerationField[];
  node_affinities: NodeAffinity[];
}

interface TolerationField {
  label: string;
}
