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
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckLg, PencilSquare, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import {
  ResourcePoolWithId,
  usePatchStorageQuotasByStorageQuotaIdMutation,
  type StorageQuota,
} from "../sessionsV2/api/computeResources.api";
import type { StorageQuotaForm } from "./adminComputeResources.types";
import StorageQuotaFormContent from "./StorageQuotaFormContent";

interface UpdateStorageQuotaButtonProps {
  storageQuota: StorageQuota;
  resourcePool: ResourcePoolWithId | undefined;
}

export default function UpdateStorageQuotaButton({
  storageQuota,
  resourcePool,
}: UpdateStorageQuotaButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button color="outline-primary" onClick={toggle} size="sm">
        <PencilSquare className={cx("bi", "me-1")} />
        Update
      </Button>
      <UpdateStorageQuotaModal
        isOpen={isOpen}
        storageQuota={storageQuota}
        resourcePool={resourcePool}
        toggle={toggle}
      />
    </>
  );
}

interface UpdateStorageQuotaModalProps {
  isOpen: boolean;
  storageQuota: StorageQuota;
  resourcePool: ResourcePoolWithId | undefined;
  toggle: () => void;
}

function UpdateStorageQuotaModal({
  isOpen,
  storageQuota,
  resourcePool,
  toggle,
}: UpdateStorageQuotaModalProps) {
  const [patchStorageQuota, result] =
    usePatchStorageQuotasByStorageQuotaIdMutation();

  const {
    control,
    formState: { isDirty },
    handleSubmit,
    reset,
  } = useForm<StorageQuotaForm>({
    defaultValues: {
      resource_pool_id: storageQuota.resource_pool_id,
      storage_flavor_id: storageQuota.storage_flavor_id,
      total_size: storageQuota.total_size,
      max_size: storageQuota.max_size,
    },
  });

  const onSubmit = useCallback(
    (data: StorageQuotaForm) => {
      const total_size =
        data.total_size != storageQuota.total_size
          ? data.total_size
          : undefined;
      const max_size =
        data.max_size != storageQuota.max_size ? data.max_size : undefined;
      patchStorageQuota({
        storageQuotaId: storageQuota.id,
        "If-Match": storageQuota.etag,
        storageQuotaPatch: {
          total_size,
          max_size,
        },
      });
    },
    [patchStorageQuota, storageQuota],
  );

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  useEffect(() => {
    if (!isOpen) {
      reset({
        resource_pool_id: storageQuota.resource_pool_id,
        storage_flavor_id: storageQuota.storage_flavor_id,
        total_size: storageQuota.total_size,
        max_size: storageQuota.max_size,
      });
      result.reset();
    }
  }, [isOpen, reset, result, storageQuota]);

  useEffect(() => {
    reset({
      resource_pool_id: storageQuota.resource_pool_id,
      storage_flavor_id: storageQuota.storage_flavor_id,
      total_size: storageQuota.total_size,
      max_size: storageQuota.max_size,
    });
  }, [reset, storageQuota]);

  const name = useMemo(
    () =>
      resourcePool
        ? `${resourcePool.name} · ${storageQuota.storage_flavor_display_name}`
        : storageQuota.id,
    [resourcePool, storageQuota.id, storageQuota.storage_flavor_display_name],
  );

  const formId = "edit-storage-quota-form";

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
        Update storage quota {name}
      </ModalHeader>
      <ModalBody>
        <Form
          id={formId}
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkOrDataServicesError error={result.error} />}
          <StorageQuotaFormContent
            control={control}
            editMode
            idPrefix={formId}
          />
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={toggle} type="button">
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="primary"
          form={formId}
          type="submit"
          disabled={result.isLoading || !isDirty}
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Update storage quota
        </Button>
      </ModalFooter>
    </Modal>
  );
}
