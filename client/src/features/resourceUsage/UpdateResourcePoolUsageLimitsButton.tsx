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

import { skipToken } from "@reduxjs/toolkit/query";
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

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import {
  useGetResourcePoolsByResourcePoolIdLimitsQuery,
  usePutResourcePoolsByResourcePoolIdLimitsMutation,
} from "../resourceUsage/api/resourceUsage.api";
import { type ResourcePoolWithId } from "../sessionsV2/api/computeResources.api";

interface UpdateResourcePoolUsageLimitsProps {
  resourcePool: ResourcePoolWithId;
}

export default function UpdateResourcePoolUsageLimitsButton({
  resourcePool,
}: UpdateResourcePoolUsageLimitsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button
        size="sm"
        color="outline-primary"
        data-cy="update-resource-pool-usage-limits-button"
        disabled={resourcePool.quota == null}
        onClick={toggle}
      >
        Update
      </Button>
      <UpdateResourcePoolUsageLimitsModal
        isOpen={isOpen}
        resourcePool={resourcePool}
        toggle={toggle}
      />
    </>
  );
}

interface UpdateResourcePoolUsageLimitsModalProps {
  isOpen: boolean;
  resourcePool: ResourcePoolWithId;
  toggle: () => void;
}

function UpdateResourcePoolUsageLimitsModal({
  isOpen,
  resourcePool,
  toggle,
}: UpdateResourcePoolUsageLimitsModalProps) {
  const { id, name } = resourcePool;

  const { data: usageLimits } = useGetResourcePoolsByResourcePoolIdLimitsQuery(
    isOpen
      ? {
          resourcePoolId: id,
        }
      : skipToken
  );

  const [updateResourcePoolLimits, result] =
    usePutResourcePoolsByResourcePoolIdLimitsMutation();

  const { control, handleSubmit, reset } =
    useForm<UpdateResourcePoolUsageLimitsForm>({
      defaultValues: {
        user: usageLimits?.user_limit,
        total: usageLimits?.total_limit,
      },
    });

  useEffect(() => {
    if (isOpen) {
      reset({
        user: usageLimits?.user_limit,
        total: usageLimits?.total_limit,
      });
    }
  }, [isOpen, reset, usageLimits]);
  const onSubmit = useCallback(
    (data: UpdateResourcePoolUsageLimitsForm) => {
      updateResourcePoolLimits({
        resourcePoolId: id,
        resourcePoolLimitPut: {
          user_limit: data.user,
          total_limit: data.total,
        },
      });
    },
    [id, updateResourcePoolLimits]
  );

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader tag="h2" toggle={toggle}>
        Update usage limits for {name}
      </ModalHeader>
      <ModalBody>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkOrDataServicesError error={result.error} />}

          <div className="mb-3">
            <Label
              className="form-label"
              for={`UpdateResourcePoolUsageLimitsUser-${id}`}
            >
              User limit (credits)
            </Label>
            <Controller
              control={control}
              name="user"
              render={({ field }) => (
                <Input
                  id={`UpdateResourcePoolUsageLimitsUser-${id}`}
                  type="number"
                  min={0}
                  step={1}
                  {...field}
                />
              )}
            />
          </div>

          <div className="mb-3">
            <Label
              className="form-label"
              for={`UpdateResourcePoolUsageLimitsTotal-${id}`}
            >
              Total limit (credits)
            </Label>
            <Controller
              control={control}
              name="total"
              render={({ field }) => (
                <Input
                  id={`UpdateResourcePoolUsageLimitsTotal-${id}`}
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
          Update quota
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface UpdateResourcePoolUsageLimitsForm {
  user: number;
  total: number;
}
