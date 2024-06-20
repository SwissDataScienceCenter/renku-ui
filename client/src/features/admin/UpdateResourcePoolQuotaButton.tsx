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
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { useUpdateResourcePoolMutation } from "../dataServices/computeResources.api.ts";
import { ResourcePool } from "../dataServices/dataServices.types";

interface UpdateResourcePoolQuotaButtonProps {
  resourcePool: ResourcePool;
}

export default function UpdateResourcePoolQuotaButton({
  resourcePool,
}: UpdateResourcePoolQuotaButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  if (resourcePool.quota == null) {
    return null;
  }

  return (
    <>
      <Button
        className="btn-sm"
        color="outline-rk-green"
        disabled={resourcePool.quota == null}
        onClick={toggle}
      >
        Update
      </Button>
      <UpdateResourcePoolQuotaModal
        isOpen={isOpen}
        resourcePool={resourcePool}
        toggle={toggle}
      />
    </>
  );
}

interface UpdateResourcePoolQuotaModalProps {
  isOpen: boolean;
  resourcePool: ResourcePool;
  toggle: () => void;
}

function UpdateResourcePoolQuotaModal({
  isOpen,
  resourcePool,
  toggle,
}: UpdateResourcePoolQuotaModalProps) {
  const { id, name, quota, idle_threshold, hibernation_threshold } =
    resourcePool;

  const [updateResourcePool, result] = useUpdateResourcePoolMutation();

  const { control, handleSubmit } = useForm<UpdateResourcePoolQuotaForm>({
    defaultValues: {
      cpu: quota?.cpu,
      memory: quota?.memory,
      gpu: quota?.gpu,
    },
  });
  const onSubmit = useCallback(
    (data: UpdateResourcePoolQuotaForm) => {
      updateResourcePool({
        resourcePoolId: id,
        quota: { ...data },
        idle_threshold: idle_threshold,
        hibernation_threshold: hibernation_threshold,
      });
    },
    [id, idle_threshold, hibernation_threshold, updateResourcePool]
  );

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader toggle={toggle}>Update {name}&apos;s quota</ModalHeader>
      <ModalBody>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkErrorAlert error={result.error} />}

          <div className="mb-3">
            <Label
              className="form-label"
              for={`updateResourcePoolQuotaCpu-${id}`}
            >
              CPUs
            </Label>
            <Controller
              control={control}
              name="cpu"
              render={({ field }) => (
                <Input
                  id={`updateResourcePoolQuotaCpu-${id}`}
                  type="number"
                  min={0.1}
                  step={0.1}
                  {...field}
                />
              )}
            />
          </div>

          <div className="mb-3">
            <Label
              className="form-label"
              for={`updateResourcePoolQuotaMemory-${id}`}
            >
              Memory (GB RAM)
            </Label>
            <Controller
              control={control}
              name="memory"
              render={({ field }) => (
                <Input
                  id={`updateResourcePoolQuotaMemory-${id}`}
                  type="number"
                  min={1}
                  step={1}
                  {...field}
                />
              )}
            />
          </div>

          <div>
            <Label
              className="form-label"
              for={`updateResourcePoolQuotaGpu-${id}`}
            >
              GPUs
            </Label>
            <Controller
              control={control}
              name="gpu"
              render={({ field }) => (
                <Input
                  id={`updateResourcePoolQuotaGpu-${id}`}
                  type="number"
                  min={0}
                  step={1}
                  {...field}
                />
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
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Update quota
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface UpdateResourcePoolQuotaForm {
  cpu: number;
  memory: number;
  gpu: number;
}
