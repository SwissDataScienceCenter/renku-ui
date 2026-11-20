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
import { CheckLg, TrashFill, XLg } from "react-bootstrap-icons";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import {
  useDeleteStorageQuotasByStorageQuotaIdMutation,
  type StorageQuota,
} from "../sessionsV2/api/computeResources.api";

interface DeleteStorageQuotaButtonProps {
  storageQuota: StorageQuota;
}

export default function DeleteStorageQuotaButton({
  storageQuota,
}: DeleteStorageQuotaButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button color="outline-danger" onClick={toggle} size="sm">
        <TrashFill className={cx("bi", "me-1")} />
        Delete
      </Button>
      <DeleteStorageQuotaModal
        isOpen={isOpen}
        storageQuota={storageQuota}
        toggle={toggle}
      />
    </>
  );
}

interface DeleteStorageQuotaModalProps {
  isOpen: boolean;
  storageQuota: StorageQuota;
  toggle: () => void;
}

function DeleteStorageQuotaModal({
  isOpen,
  storageQuota,
  toggle,
}: DeleteStorageQuotaModalProps) {
  const [deleteStorageQuota, result] =
    useDeleteStorageQuotasByStorageQuotaIdMutation();
  const onDelete = useCallback(() => {
    deleteStorageQuota({ storageQuotaId: storageQuota.id });
  }, [deleteStorageQuota, storageQuota.id]);

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  useEffect(() => {
    if (!isOpen) {
      result.reset();
    }
  }, [isOpen, result]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader className="text-danger" tag="h3">
        Delete storage quota
      </ModalHeader>
      <ModalBody>
        {result.error && <RtkOrDataServicesError error={result.error} />}
        <p className="mb-0">
          Please confirm that you want to delete the storage quota{" "}
          <strong>{storageQuota.id}</strong>.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-danger" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel, keep storage quota
        </Button>
        <Button color="danger" disabled={result.isLoading} onClick={onDelete}>
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Yes, delete this storage quota
        </Button>
      </ModalFooter>
    </Modal>
  );
}
