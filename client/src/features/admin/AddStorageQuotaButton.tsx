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
import { usePostStorageQuotasMutation } from "../sessionsV2/api/computeResources.api";
import type { StorageQuotaForm } from "./adminComputeResources.types";
import StorageQuotaFormContent from "./StorageQuotaFormContent";

const DEFAULT_VALUES: StorageQuotaForm = {
  resource_pool_id: 0,
  storage_flavor_id: "",
  total_size: 1,
  max_size: 1,
};

export default function AddStorageQuotaButton() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button color="outline-primary" onClick={toggle}>
        <PlusLg className={cx("bi", "me-1")} />
        Add storage quota
      </Button>
      <AddStorageQuotaModal isOpen={isOpen} toggle={toggle} />
    </>
  );
}

interface AddStorageQuotaModalProps {
  isOpen: boolean;
  toggle: () => void;
}

function AddStorageQuotaModal({ isOpen, toggle }: AddStorageQuotaModalProps) {
  const [postStorageQuota, result] = usePostStorageQuotasMutation();

  const { control, handleSubmit, reset } = useForm<StorageQuotaForm>({
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = useCallback(
    (data: StorageQuotaForm) => {
      postStorageQuota({ storageQuotaPost: data });
    },
    [postStorageQuota],
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

  const formId = "create-storage-quota-form";

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
        Add storage quota
      </ModalHeader>
      <ModalBody>
        <Form id={formId} noValidate onSubmit={handleSubmit(onSubmit)}>
          {result.error && <RtkOrDataServicesError error={result.error} />}
          <p>
            Storage quotas allow you to manage and allocate storage resources
            for different groups and users. Storage quotas are attached to a
            parent resource pool.
          </p>

          <StorageQuotaFormContent control={control} idPrefix={formId} />
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
          Add storage quota
        </Button>
      </ModalFooter>
    </Modal>
  );
}
