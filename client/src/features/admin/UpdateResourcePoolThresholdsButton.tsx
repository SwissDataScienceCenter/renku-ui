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
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckLg, PencilSquare, XLg } from "react-bootstrap-icons";
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

import { RtkOrNotebooksError } from "~/components/errors/RtkErrorAlert";
import { Loader } from "~/components/Loader";
import { toFullHumanDuration } from "~/utils/helpers/DurationUtils";
import {
  usePatchResourcePoolsByResourcePoolIdMutation,
  type ResourcePoolWithId,
} from "../sessionsV2/api/computeResources.api";
import { PAUSE_SESSION_WARNING_GRACE_PERIOD_SECONDS } from "../sessionsV2/session.constants";
import { useGetNotebooksVersionQuery } from "../versions/versions.api";
import { ResourcePoolDefaultThreshold } from "./AddResourcePoolButton";
import type { UpdateResourcePoolThresholdsForm } from "./adminComputeResources.types";

interface UpdateResourcePoolThresholdsButtonProps {
  resourcePool: ResourcePoolWithId;
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
      <Button color="outline-primary" onClick={toggle} size="sm">
        <PencilSquare className={cx("bi", "me-1")} />
        Edit
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
  resourcePool: ResourcePoolWithId;
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
  const defaultValues = useMemo(
    () => ({
      idleThresholdMinutes: resourcePool.idle_threshold
        ? resourcePool.idle_threshold / 60
        : undefined,
      pauseWarningMinutes: resourcePool.hibernation_warning_period
        ? resourcePool.hibernation_warning_period / 60
        : undefined,
      hibernationThresholdMinutes: resourcePool.hibernation_threshold
        ? resourcePool.hibernation_threshold / 60
        : undefined,
    }),
    [
      resourcePool.idle_threshold,
      resourcePool.hibernation_warning_period,
      resourcePool.hibernation_threshold,
    ]
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<UpdateResourcePoolThresholdsForm>({
    defaultValues,
  });

  // Handle invoking API to update resource pools
  const [updateResourcePool, result] =
    usePatchResourcePoolsByResourcePoolIdMutation();
  const onSubmit = useCallback(
    (data: UpdateResourcePoolThresholdsForm) => {
      updateResourcePool({
        resourcePoolId: id,
        resourcePoolPatch: {
          idle_threshold: data.idleThresholdMinutes
            ? data.idleThresholdMinutes * 60
            : undefined,
          hibernation_warning_period: data.pauseWarningMinutes
            ? data.pauseWarningMinutes * 60
            : undefined,
          hibernation_threshold: data.hibernationThresholdMinutes
            ? data.hibernationThresholdMinutes * 60
            : undefined,
        },
      });
    },
    [id, updateResourcePool]
  );

  // Reset form to show up-to-date values
  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    reset(defaultValues);
    toggle();
  }, [result.isSuccess, defaultValues, reset, toggle]);

  useEffect(() => {
    if (isOpen) reset(defaultValues);
  }, [isOpen, reset, defaultValues]);

  useEffect(() => {
    if (!isOpen) {
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
      <ModalHeader tag="h2" toggle={toggle}>
        Update {name}&apos;s thresholds
      </ModalHeader>
      <ModalBody>
        <p>
          Please note that changes only affect new sessions, not already running
          ones.
        </p>
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          {result.error && <RtkOrNotebooksError error={result.error} />}

          <div className="mb-3">
            <Label className="form-label" for="updateResourcePoolIdleThreshold">
              Maximum idle time before pausing (minutes)
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
              for="updateResourcePoolPauseWarningMinutes"
            >
              How long in advance should users be warned about pausing (minutes)
            </Label>
            <Controller
              control={control}
              name="pauseWarningMinutes"
              render={({ field }) => (
                <Input
                  className={cx(
                    "form-control",
                    errors.pauseWarningMinutes && "is-invalid"
                  )}
                  id="updateResourcePoolPauseWarningMinutes"
                  placeholder="pause warning"
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
              Please enter 0 (or leave it blank) for default or anything greater
              than 0 to specify a custom value.
            </div>
            <Label className="form-text">
              Default:{" "}
              {toFullHumanDuration(PAUSE_SESSION_WARNING_GRACE_PERIOD_SECONDS)}.
              The value cannot be higher than Max idle time.
            </Label>
          </div>

          <div>
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
        <Button color="outline-primary" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="primary"
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
