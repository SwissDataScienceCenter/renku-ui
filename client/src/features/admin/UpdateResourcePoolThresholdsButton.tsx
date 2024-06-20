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
} from "reactstrap";
import { Loader } from "../../components/Loader";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { useUpdateResourcePoolMutation } from "../dataServices/computeResources.api.ts";
import { ResourcePool } from "../dataServices/dataServices.types";
import { useGetNotebooksVersionQuery } from "../versions/versions.api";
import { ResourcePoolDefaultThreshold } from "./AddResourcePoolButton";
import { UpdateResourcePoolThresholdsForm } from "./adminComputeResources.types";
interface UpdateResourcePoolThresholdsButtonProps {
  resourcePool: ResourcePool;
}

export default function UpdateResourcePoolThresholdsButton({
  resourcePool,
}: UpdateResourcePoolThresholdsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  // ? The key forces the component to re-render when the resource pool changes.
  const localKey =
    resourcePool.id.toString() +
    resourcePool.hibernation_threshold +
    resourcePool.idle_threshold;

  return (
    <div key={localKey}>
      <Button className="btn-outline-rk-green" onClick={toggle} size="sm">
        Update
      </Button>
      <UpdateResourcePoolThresholdsModal
        isOpen={isOpen}
        resourcePool={resourcePool}
        toggle={toggle}
      />
    </div>
  );
}

interface UpdateResourcePoolThresholdsModalProps {
  isOpen: boolean;
  resourcePool: ResourcePool;
  toggle: () => void;
}

function UpdateResourcePoolThresholdsModal({
  isOpen,
  resourcePool,
  toggle,
}: UpdateResourcePoolThresholdsModalProps) {
  const { id, name } = resourcePool;

  // Fetch default values
  const notebookVersion = useGetNotebooksVersionQuery();

  // Form state
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<UpdateResourcePoolThresholdsForm>({
    defaultValues: {
      idleThresholdMinutes: resourcePool.idle_threshold
        ? resourcePool.idle_threshold / 60
        : undefined,
      hibernationThresholdMinutes: resourcePool.hibernation_threshold
        ? resourcePool.hibernation_threshold / 60
        : undefined,
    },
  });

  // Handle invoking API to update resource pools
  const [updateResourcePool, result] = useUpdateResourcePoolMutation();
  const onSubmit = useCallback(
    (data: UpdateResourcePoolThresholdsForm) => {
      updateResourcePool({
        resourcePoolId: id,
        idle_threshold: data.idleThresholdMinutes
          ? data.idleThresholdMinutes * 60
          : undefined,
        hibernation_threshold: data.hibernationThresholdMinutes
          ? data.hibernationThresholdMinutes * 60
          : undefined,
      });
    },
    [id, updateResourcePool]
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
      <ModalHeader toggle={toggle}>Update {name}&apos;s thresholds</ModalHeader>
      <ModalBody>
        <p>
          Please note that changes only affect new sessions, not already running
          ones.
        </p>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkOrNotebooksError error={result.error} />}

          <div className="mb-3">
            <Label className="form-label" for="updateResourcePoolIdleThreshold">
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
                  id="updateResourcePoolIdleThreshold"
                  placeholder="idle threshold"
                  type="number"
                  min="0"
                  step="1"
                  required={false}
                  {...field}
                />
              )}
              rules={{ min: 0 }}
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
            {resourcePool.idle_threshold && (
              <Label className={cx("d-block", "form-text")}>
                Use 0 to remove the current value and fallback to the default.
              </Label>
            )}
          </div>
          <div className="mb-3">
            <Label
              className="form-label"
              for="updateResourcePoolHibernationThreshold"
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
                  id="updateResourcePoolHibernationThreshold"
                  placeholder="hibernation threshold"
                  type="number"
                  min="0"
                  step="1"
                  required={false}
                  {...field}
                />
              )}
              rules={{ min: 0 }}
            />
            <div className="invalid-feedback">Please provide a threshold</div>
            <ResourcePoolDefaultThreshold
              duration={
                notebookVersion.data?.defaultCullingThresholds?.registered
                  .hibernation
              }
              isError={notebookVersion.isError}
              isLoading={notebookVersion.isLoading}
            />
            {resourcePool.hibernation_threshold && (
              <Label className={cx("d-block", "form-text")}>
                Use 0 to remove the current value and fallback to the default.
              </Label>
            )}
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
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Update Resource Pool
        </Button>
      </ModalFooter>
    </Modal>
  );
}
