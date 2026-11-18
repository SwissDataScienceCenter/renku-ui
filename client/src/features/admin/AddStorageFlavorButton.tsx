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
import { PlusLg, XLg } from "react-bootstrap-icons";
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
import { usePostStorageFlavorsMutation } from "../sessionsV2/api/computeResources.api";
import type { StorageFlavorForm } from "./adminComputeResources.types";
import StorageFlavorFormContent from "./StorageFlavorFormContent";

const DEFAULT_VALUES: StorageFlavorForm = {
  k8s_storage_class_name: "",
  display_name: "",
  min_size: 1,
  admin_documentation: "",
  documentation: "",
};

export default function AddStorageFlavorButton() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button color="outline-primary" onClick={toggle}>
        <PlusLg className={cx("bi", "me-1")} />
        Add Storage Flavor
      </Button>
      <AddStorageFlavorModal isOpen={isOpen} toggle={toggle} />
    </>
  );
}

interface AddStorageFlavorModalProps {
  isOpen: boolean;
  toggle: () => void;
}

function AddStorageFlavorModal({ isOpen, toggle }: AddStorageFlavorModalProps) {
  const [postStorageFlavor, result] = usePostStorageFlavorsMutation();

  const { control, handleSubmit, reset } = useForm<StorageFlavorForm>({
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = useCallback(
    (data: StorageFlavorForm) => {
      const k8s_storage_class_name = data.k8s_storage_class_name.trim();
      const display_name = data.display_name.trim();
      const admin_documentation = data.admin_documentation.trim();
      const documentation = data.documentation.trim();
      postStorageFlavor({
        storageFlavorPost: {
          k8s_storage_class_name,
          display_name,
          min_size: data.min_size,
          ...(admin_documentation ? { admin_documentation } : {}),
          ...(documentation ? { documentation } : {}),
        },
      });
    },
    [postStorageFlavor],
  );

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [reset, result.isSuccess, toggle]);

  useEffect(() => {
    if (!isOpen) {
      reset(DEFAULT_VALUES);
      result.reset();
    }
  }, [isOpen, reset, result]);

  const formId = "create-storage-flavor-form";

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
        Add storage flavor
      </ModalHeader>
      <ModalBody>
        <Form
          id={formId}
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkOrDataServicesError error={result.error} />}
          <p>Storage flavors are re-usable shapes used by storage quotas.</p>

          <StorageFlavorFormContent control={control} idPrefix={formId} />
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={toggle} type="button">
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button color="primary" form={formId} type="submit">
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <PlusLg className={cx("bi", "me-1")} />
          )}
          Add storage flavor
        </Button>
      </ModalFooter>
    </Modal>
  );
}
