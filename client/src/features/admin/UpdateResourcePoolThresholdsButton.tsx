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
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { useUpdateResourcePoolMutation } from "./adminComputeResources.api";
import { ResourcePool } from "../dataServices/dataServices.types";
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

  return (
    <>
      <Button className={cx("btn-outline-rk-green")} onClick={toggle}>
        <PlusLg className={cx("bi", "me-1")} />
        Update Resource Pool Thresholds
      </Button>
      <UpdateResourcePoolThresholdsModal
        isOpen={isOpen}
        resourcePool={resourcePool}
        toggle={toggle}
      />
    </>
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

  const [updateResourcePool, result] = useUpdateResourcePoolMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<UpdateResourcePoolThresholdsForm>({
    defaultValues: {
      idleThreshold:
        resourcePool.idle_threshold == null
          ? undefined
          : resourcePool.idle_threshold,
      hibernationThreshold:
        resourcePool.hibernation_threshold == null
          ? undefined
          : resourcePool.hibernation_threshold,
    },
  });
  const onSubmit = useCallback(
    (data: UpdateResourcePoolThresholdsForm) => {
      updateResourcePool({
        resourcePoolId: id,
        idle_threshold:
          data.idleThreshold == undefined ? null : data.idleThreshold * 60,
        hibernation_threshold:
          data.hibernationThreshold == undefined
            ? null
            : data.hibernationThreshold * 60,
      });
    },
    [id, updateResourcePool]
  );

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
          ones
        </p>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkErrorAlert error={result.error} />}

          <div className="mb-3">
            <Label className="form-label" for="updateResourcePoolIdleThreshold">
              Maximum Session Idle Time(minutes)
            </Label>
            <Controller
              control={control}
              name="idleThreshold"
              render={({ field }) => (
                <Input
                  className={cx(
                    "form-control",
                    errors.idleThreshold && "is-invalid"
                  )}
                  id="updateResourcePoolIdleThreshold"
                  placeholder="idle threshold"
                  type="number"
                  min="1"
                  step="1"
                  required={false}
                  {...field}
                />
              )}
              rules={{ required: true }}
            />
            <div className="invalid-feedback">Please provide a threshold</div>
          </div>
          <div className="mb-3">
            <Label
              className="form-label"
              for="updateResourcePoolHibernationThreshold"
            >
              Maximum Session Hibernation Time(minutes)
            </Label>
            <Controller
              control={control}
              name="hibernationThreshold"
              render={({ field }) => (
                <Input
                  className={cx(
                    "form-control",
                    errors.hibernationThreshold && "is-invalid"
                  )}
                  id="updateResourcePoolHibernationThreshold"
                  placeholder="hibernation threshold"
                  type="number"
                  min="1"
                  step="1"
                  required={false}
                  {...field}
                />
              )}
              rules={{ required: true }}
            />
            <div className="invalid-feedback">Please provide a threshold</div>
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
          Update Resource Pool
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface UpdateResourcePoolThresholdsForm {
  idleThreshold: number | undefined;
  hibernationThreshold: number | undefined;
}
