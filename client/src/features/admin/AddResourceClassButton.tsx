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
import { PlusLg, TrashFill, XLg } from "react-bootstrap-icons";
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
import { useAddResourceClassMutation } from "../dataServices/computeResources.api";
import { NodeAffinity, ResourcePool } from "../dataServices/dataServices.types";

interface AddResourceClassButtonProps {
  resourcePool: ResourcePool;
}

export default function AddResourceClassButton({
  resourcePool,
}: AddResourceClassButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button className="ms-2" color="outline-rk-green" onClick={toggle}>
        <PlusLg className={cx("bi", "me-1")} />
        Add Class
      </Button>
      <AddResourceClassModal
        isOpen={isOpen}
        resourcePool={resourcePool}
        toggle={toggle}
      />
    </>
  );
}

interface AddResourceClassModalProps {
  isOpen: boolean;
  resourcePool: ResourcePool;
  toggle: () => void;
}

function AddResourceClassModal({
  isOpen,
  resourcePool,
  toggle,
}: AddResourceClassModalProps) {
  const { id, quota } = resourcePool;

  const [addResourceClass, result] = useAddResourceClassMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<AddResourceClassForm>({
    defaultValues: {
      cpu: 0.1,
      default: false,
      default_storage: 1,
      gpu: 0,
      max_storage: 1,
      memory: 1,
      name: "",
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
    (data: AddResourceClassForm) => {
      const tolerations = data.tolerations.map(({ label }) => label);
      addResourceClass({
        resourcePoolId: resourcePool.id,
        ...data,
        tolerations,
      });
    },
    [addResourceClass, resourcePool.id]
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
    }
  }, [result.isSuccess, toggle]);

  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader toggle={toggle}>
        Add resource class to {resourcePool.name}
      </ModalHeader>
      <ModalBody>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkErrorAlert error={result.error} />}

          <div className="mb-3">
            <Label className="form-label" for={`addResourceClassName-${id}`}>
              Name
            </Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  className={cx("form-control", errors.name && "is-invalid")}
                  id={`addResourceClassName-${id}`}
                  type="text"
                  {...field}
                />
              )}
              rules={{ required: true }}
            />
            <div className="invalid-feedback">Please provide a name</div>
          </div>

          <div className="mb-3">
            <Label className="form-label" for={`addResourceClassCpu-${id}`}>
              CPUs
            </Label>
            <Controller
              control={control}
              name="cpu"
              render={({ field }) => (
                <Input
                  className={cx(errors.cpu && "is-invalid")}
                  id={`addResourceClassCpu-${id}`}
                  type="number"
                  min={0.1}
                  step={0.1}
                  max={quota?.cpu}
                  {...field}
                />
              )}
              rules={{ min: 0.1, max: quota?.cpu }}
            />
            <div className="invalid-feedback">Invalid value for CPUs</div>
          </div>

          <div className="mb-3">
            <Label className="form-label" for={`addResourceClassMemory-${id}`}>
              Memory (GB RAM)
            </Label>
            <Controller
              control={control}
              name="memory"
              render={({ field }) => (
                <Input
                  className={cx(errors.memory && "is-invalid")}
                  id={`addResourceClassMemory-${id}`}
                  type="number"
                  min={1}
                  step={1}
                  max={quota?.memory}
                  {...field}
                />
              )}
              rules={{ min: 1, max: quota?.memory }}
            />
            <div className="invalid-feedback">Invalid value for memory</div>
          </div>

          <div className="mb-3">
            <Label className="form-label" for={`addResourceClassGpu-${id}`}>
              GPUs
            </Label>
            <Controller
              control={control}
              name="gpu"
              render={({ field }) => (
                <Input
                  className={cx(errors.gpu && "is-invalid")}
                  id={`addResourceClassGpu-${id}`}
                  type="number"
                  disabled={quota?.gpu == 0}
                  min={0}
                  step={1}
                  max={quota?.gpu}
                  {...field}
                />
              )}
              rules={{ min: 0, max: quota?.gpu }}
            />{" "}
            <div className="invalid-feedback">Invalid value for GPUs</div>
          </div>

          <div className="mb-3">
            <Label
              className="form-label"
              for={`addResourceClassDefaultStorage-${id}`}
            >
              Default storage (GB disk)
            </Label>
            <Controller
              control={control}
              name="default_storage"
              render={({ field }) => (
                <Input
                  id={`addResourceClassDefaultStorage-${id}`}
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
              for={`addResourceClassMaxStorage-${id}`}
            >
              Max storage (GB disk)
            </Label>
            <Controller
              control={control}
              name="max_storage"
              render={({ field }) => (
                <Input
                  id={`addResourceClassMaxStorage-${id}`}
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
          disabled={result.isLoading}
          onClick={handleSubmit(onSubmit)}
          type="submit"
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <PlusLg className={cx("bi", "me-1")} />
          )}
          Add resource class
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface AddResourceClassForm {
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
