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
  usePatchStorageFlavorsByStorageFlavorIdMutation,
  type StorageFlavor,
} from "../sessionsV2/api/computeResources.api";
import type { StorageFlavorForm } from "./adminComputeResources.types";
import StorageFlavorFormContent from "./StorageFlavorFormContent";

interface UpdateStorageFlavorButtonProps {
  storageFlavor: StorageFlavor;
}

export default function UpdateStorageFlavorButton({
  storageFlavor,
}: UpdateStorageFlavorButtonProps) {
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
      <UpdateStorageFlavorModal
        isOpen={isOpen}
        storageFlavor={storageFlavor}
        toggle={toggle}
      />
    </>
  );
}

interface UpdateStorageFlavorModalProps {
  isOpen: boolean;
  storageFlavor: StorageFlavor;
  toggle: () => void;
}

function UpdateStorageFlavorModal({
  isOpen,
  storageFlavor,
  toggle,
}: UpdateStorageFlavorModalProps) {
  const [patchStorageFlavor, result] =
    usePatchStorageFlavorsByStorageFlavorIdMutation();

  const {
    control,
    formState: { isDirty },
    handleSubmit,
    reset,
  } = useForm<StorageFlavorForm>({
    defaultValues: {
      k8s_storage_class_name: storageFlavor.k8s_storage_class_name,
      display_name: storageFlavor.display_name,
      min_size: storageFlavor.min_size,
      admin_documentation: storageFlavor.admin_documentation ?? "",
      documentation: storageFlavor.documentation ?? "",
    },
  });

  const onSubmit = useCallback(
    (data: StorageFlavorForm) => {
      const new_display_name = data.display_name.trim();
      const display_name =
        new_display_name != storageFlavor.display_name
          ? new_display_name
          : undefined;
      const min_size =
        data.min_size != storageFlavor.min_size ? data.min_size : undefined;
      const new_admin_documentation = data.admin_documentation.trim();
      const admin_documentation =
        new_admin_documentation != storageFlavor.admin_documentation
          ? new_admin_documentation
          : undefined;
      const new_documentation = data.documentation.trim();
      const documentation =
        new_documentation != storageFlavor.documentation
          ? new_documentation
          : undefined;
      patchStorageFlavor({
        storageFlavorId: storageFlavor.id,
        "If-Match": storageFlavor.etag,
        storageFlavorPatch: {
          display_name,
          min_size,
          admin_documentation,
          documentation,
        },
      });
    },
    [patchStorageFlavor, storageFlavor],
  );

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  useEffect(() => {
    if (!isOpen) {
      reset({
        k8s_storage_class_name: storageFlavor.k8s_storage_class_name,
        display_name: storageFlavor.display_name,
        min_size: storageFlavor.min_size,
        admin_documentation: storageFlavor.admin_documentation ?? "",
        documentation: storageFlavor.documentation ?? "",
      });
      result.reset();
    }
  }, [isOpen, reset, result, storageFlavor]);

  useEffect(() => {
    reset({
      k8s_storage_class_name: storageFlavor.k8s_storage_class_name,
      display_name: storageFlavor.display_name,
      min_size: storageFlavor.min_size,
      admin_documentation: storageFlavor.admin_documentation ?? "",
      documentation: storageFlavor.documentation ?? "",
    });
  }, [reset, storageFlavor]);

  const formId = "edit-storage-flavor-form";

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
        Update storage flavor {storageFlavor.display_name}
      </ModalHeader>
      <ModalBody>
        <Form
          id={formId}
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkOrDataServicesError error={result.error} />}
          <StorageFlavorFormContent
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
          Update storage flavor
        </Button>
      </ModalFooter>
    </Modal>
  );
}
