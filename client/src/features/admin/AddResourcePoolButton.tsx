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
import { useCallback, useEffect, useMemo, useState } from "react";
import { PlusLg, XLg } from "react-bootstrap-icons";
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
} from "reactstrap";

import { Loader } from "../../components/Loader";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { toFullHumanDuration } from "../../utils/helpers/DurationUtils";
import {
  useAddResourcePoolMutation,
  useGetResourcePoolsQuery,
} from "../dataServices/computeResources.api";
import { useGetNotebooksVersionQuery } from "../versions/versions.api";
import { AddResourcePoolForm } from "./adminComputeResources.types";

export default function AddResourcePoolButton() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button className={cx("btn-outline-rk-green")} onClick={toggle}>
        <PlusLg className={cx("bi", "me-1")} />
        Add Resource Pool
      </Button>
      <AddResourcePoolModal isOpen={isOpen} toggle={toggle} />
    </>
  );
}

interface AddResourcePoolModalProps {
  isOpen: boolean;
  toggle: () => void;
}
function AddResourcePoolModal({ isOpen, toggle }: AddResourcePoolModalProps) {
  // Fetch existing resource pools and default values
  const { data: resourcePools } = useGetResourcePoolsQuery({});
  const notebookVersion = useGetNotebooksVersionQuery();
  const defaultSessionClass = useMemo(
    () =>
      resourcePools
        ?.filter((pool) => pool.default)
        .flatMap(({ classes }) => classes)
        .find((c) => c.default),
    [resourcePools]
  );

  // Form state
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<AddResourcePoolForm>({
    defaultValues: {
      name: "",
      public: false,
      quotaCpu: 1,
      quotaMemory: 1,
      quotaGpu: 0,
      idleThresholdMinutes: undefined,
      hibernationThresholdMinutes: undefined,
    },
  });

  // Handle invoking API to add resource pools
  const [addResourcePool, result] = useAddResourcePoolMutation();
  const onSubmit = useCallback(
    (data: AddResourcePoolForm) => {
      const populatedClass = defaultSessionClass
        ? {
            name: defaultSessionClass.name,
            cpu: defaultSessionClass.cpu,
            memory: defaultSessionClass.memory,
            gpu: defaultSessionClass.gpu,
            max_storage: defaultSessionClass.max_storage,
            default_storage: defaultSessionClass.default_storage,
            default: true,
          }
        : null;
      addResourcePool({
        name: data.name,
        public: data.public,
        classes: populatedClass ? [populatedClass] : [],
        quota: {
          cpu: data.quotaCpu,
          memory: data.quotaMemory,
          gpu: data.quotaGpu,
        },
        idle_threshold: data.idleThresholdMinutes
          ? data.idleThresholdMinutes * 60
          : undefined,
        hibernation_threshold: data.hibernationThresholdMinutes
          ? data.hibernationThresholdMinutes * 60
          : undefined,
      });
    },
    [addResourcePool, defaultSessionClass]
  );

  // Reset form and close modal on successful submissions
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
      <ModalHeader toggle={toggle}>Add resource pool</ModalHeader>
      <ModalBody>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkOrNotebooksError error={result.error} />}

          <div className="mb-3">
            <Label className="form-label" for="addResourcePoolName">
              Name
            </Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  className={cx("form-control", errors.name && "is-invalid")}
                  id="addResourcePoolName"
                  placeholder="resource pool"
                  type="text"
                  {...field}
                />
              )}
              rules={{ required: true }}
            />
            <div className="invalid-feedback">Please provide a name</div>
          </div>
          <div className="mb-3">
            <Label className="form-label" for="addResourcePoolIdleThreshold">
              Maximum idle time before hibernating (minutes)
            </Label>
            <Controller
              control={control}
              name="idleThresholdMinutes"
              render={({ field }) => (
                <Input
                  className={cx(
                    "form-control",
                    errors.idleThresholdMinutes && "is-invalid"
                  )}
                  id="addResourcePoolIdleThreshold"
                  min="1"
                  placeholder="idle threshold"
                  step="1"
                  type="number"
                  {...field}
                />
              )}
              rules={{ min: 1 }}
            />
            <div className="invalid-feedback">
              Please enter a number greater than 0 or leave blank.
            </div>
            <ResourcePoolDefaultThreshold
              duration={
                notebookVersion.data?.defaultCullingThresholds?.registered.idle
              }
              isError={notebookVersion.isError}
              isLoading={notebookVersion.isLoading}
            />
          </div>
          <div className="mb-3">
            <Label
              className="form-label"
              for="addResourcePoolHibernationThreshold"
            >
              Maximum hibernation time before deleting (minutes)
            </Label>
            <Controller
              control={control}
              name="hibernationThresholdMinutes"
              render={({ field }) => (
                <Input
                  className={cx(
                    "form-control",
                    errors.hibernationThresholdMinutes && "is-invalid"
                  )}
                  id="addResourcePoolHibernationThreshold"
                  placeholder="hibernation threshold"
                  type="number"
                  min="1"
                  step="1"
                  {...field}
                />
              )}
              rules={{ required: false, min: 1 }}
            />
            <div className="invalid-feedback">
              Please enter a number greater than 0 or leave blank.
            </div>
            <ResourcePoolDefaultThreshold
              duration={
                notebookVersion.data?.defaultCullingThresholds?.registered
                  .hibernation
              }
              isError={notebookVersion.isError}
              isLoading={notebookVersion.isLoading}
            />
          </div>

          <div>
            <Controller
              control={control}
              name="public"
              render={({ field }) => (
                <>
                  <div className="form-check">
                    <Input
                      type="radio"
                      className="form-check-input"
                      name="addResourcePoolPublicRadio"
                      id="addResourcePoolPublicOn"
                      autoComplete="off"
                      checked={field.value}
                      onBlur={field.onBlur}
                      onChange={() => field.onChange(true)}
                    />
                    <Label
                      className={cx("form-check-label", "ms-2")}
                      for="addResourcePoolPublicOn"
                    >
                      Public (anyone can access)
                    </Label>
                  </div>
                  <div className="form-check">
                    <Input
                      type="radio"
                      className="form-check-input"
                      name="addResourcePoolPublicRadio"
                      id="addResourcePoolPublicOff"
                      autoComplete="off"
                      checked={!field.value}
                      onBlur={field.onBlur}
                      onChange={() => field.onChange(false)}
                    />
                    <Label
                      className={cx("form-check-label", "ms-2")}
                      for="addResourcePoolPublicOff"
                    >
                      Private pool (requires special access)
                    </Label>
                  </div>
                </>
              )}
            />
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
          Add Resource Pool
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface ResourcePoolDefaultThresholdInterface {
  duration?: number;
  isError: boolean;
  isLoading: boolean;
}
export function ResourcePoolDefaultThreshold({
  duration,
  isError,
  isLoading,
}: ResourcePoolDefaultThresholdInterface) {
  const text = useMemo(() => {
    if (isLoading) return "Loading default values...";
    if (isError) return "Error loading default values.";
    if (!duration) return "No default threshold available.";
    return `Default threshold: ${toFullHumanDuration(duration)}`;
  }, [duration, isError, isLoading]);

  return <Label className="form-text">{text}</Label>;
}
