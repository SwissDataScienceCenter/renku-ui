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
 * limitations under the License.
 */

import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import { CheckLg, XLg } from "react-bootstrap-icons";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Button,
  Form,
  FormText,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import {
  type ResourceClassWithId,
  type ResourcePoolWithId,
} from "../sessionsV2/api/computeResources.api";
import {
  useDeleteResourcePoolsByResourcePoolIdClassesAndClassIdCostMutation,
  useGetResourcePoolsByResourcePoolIdClassesAndClassIdCostQuery,
  useGetResourcePoolsByResourcePoolIdLimitsQuery,
  usePutResourcePoolsByResourcePoolIdClassesAndClassIdCostMutation,
  type ResourcePoolLimits,
} from "./api/resourceUsage.api";

interface UpdateResourceClassCostButtonProps {
  resourceClass: ResourceClassWithId;
  resourcePool: ResourcePoolWithId;
}

function resourceClassUsageLimitText(
  cost: number | undefined,
  poolLimits: ResourcePoolLimits | undefined
) {
  if (cost == null || cost <= 0 || poolLimits == null) {
    return "Users can use this resource class without limit";
  }
  const poolUserLimit =
    poolLimits.user_limit > 0 ? poolLimits.user_limit : poolLimits.total_limit;
  const hoursPerUser = (poolUserLimit / cost).toFixed(2);
  return `${hoursPerUser} hours / user`;
}

export default function UpdateResourceClassCostButton({
  resourceClass,
  resourcePool,
}: UpdateResourceClassCostButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const { data: classCost } =
    useGetResourcePoolsByResourcePoolIdClassesAndClassIdCostQuery({
      resourcePoolId: resourcePool.id,
      classId: resourceClass.id,
    });

  return (
    <>
      <Button
        size="sm"
        color="outline-primary"
        data-cy="update-resource-class-cost-button"
        disabled={resourcePool.quota == null}
        onClick={toggle}
      >
        Cost{" "}
        {classCost?.cost == null
          ? "None"
          : classCost.cost <= 0
          ? "None"
          : classCost.cost}
      </Button>
      <UpdateResourceClassCostModal
        isOpen={isOpen}
        classCost={classCost?.cost}
        resourceClass={resourceClass}
        resourcePool={resourcePool}
        toggle={toggle}
      />
    </>
  );
}

interface UpdateResourceClassCostModalProps {
  isOpen: boolean;
  classCost: number | undefined;
  resourceClass: ResourceClassWithId;
  resourcePool: ResourcePoolWithId;
  toggle: () => void;
}

function UpdateResourceClassCostModal({
  isOpen,
  resourceClass,
  resourcePool,
  toggle,
  classCost,
}: UpdateResourceClassCostModalProps) {
  const { id, name: resourcePoolName } = resourcePool;
  const { id: resourceClassId, name: resourceClassName } = resourceClass;

  const { data: poolLimits } = useGetResourcePoolsByResourcePoolIdLimitsQuery({
    resourcePoolId: id,
  });

  const [updateResourceClassCost, result] =
    usePutResourcePoolsByResourcePoolIdClassesAndClassIdCostMutation();
  const [deleteResourceClassCost, deleteResult] =
    useDeleteResourcePoolsByResourcePoolIdClassesAndClassIdCostMutation();

  const { control, handleSubmit, reset } = useForm<UpdateResourceClassCostForm>(
    {
      defaultValues: {
        cost: classCost,
      },
    }
  );
  const formCost = useWatch({ control, name: "cost" });

  useEffect(() => {
    if (isOpen) {
      reset({
        cost: classCost,
      });
    }
  }, [isOpen, reset, classCost]);
  const onSubmit = useCallback(
    (data: UpdateResourceClassCostForm) => {
      if (data.cost <= 0) {
        deleteResourceClassCost({
          resourcePoolId: id,
          classId: resourceClassId,
        });
        return;
      }
      updateResourceClassCost({
        resourcePoolId: id,
        classId: resourceClassId,
        resourceClassCostPut: {
          cost: data.cost,
        },
      });
    },
    [id, resourceClassId, updateResourceClassCost, deleteResourceClassCost]
  );

  useEffect(() => {
    if (result.isSuccess || deleteResult.isSuccess) {
      toggle();
    }
  }, [deleteResult.isSuccess, result.isSuccess, toggle]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader tag="h2" toggle={toggle}>
        Update cost for {resourcePoolName} - {resourceClassName}
      </ModalHeader>
      <ModalBody>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkOrDataServicesError error={result.error} />}

          <div className="mb-3">
            <Label className="form-label" for={`UpdateResourceClassCost-${id}`}>
              Cost (credits)
            </Label>
            <Controller
              control={control}
              name="cost"
              render={({ field }) => (
                <>
                  <Input
                    id={`UpdateResourceClassCost-${id}`}
                    type="number"
                    min={0}
                    step={1}
                    {...field}
                  />
                  <FormText color="muted">
                    {resourceClassUsageLimitText(formCost, poolLimits)}
                  </FormText>
                </>
              )}
            />
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
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
          Update cost
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface UpdateResourceClassCostForm {
  cost: number;
}
