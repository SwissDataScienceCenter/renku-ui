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
  useDeleteStorageFlavorsByStorageFlavorIdMutation,
  type StorageFlavor,
} from "../sessionsV2/api/computeResources.api";

interface DeleteStorageFlavorButtonProps {
  storageFlavor: StorageFlavor;
}

export default function DeleteStorageFlavorButton({
  storageFlavor,
}: DeleteStorageFlavorButtonProps) {
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
      <DeleteStorageFlavorModal
        isOpen={isOpen}
        storageFlavor={storageFlavor}
        toggle={toggle}
      />
    </>
  );
}

interface DeleteStorageFlavorModalProps {
  isOpen: boolean;
  storageFlavor: StorageFlavor;
  toggle: () => void;
}

function DeleteStorageFlavorModal({
  isOpen,
  storageFlavor,
  toggle,
}: DeleteStorageFlavorModalProps) {
  const [deleteStorageFlavor, result] =
    useDeleteStorageFlavorsByStorageFlavorIdMutation();
  const onDelete = useCallback(() => {
    deleteStorageFlavor({ storageFlavorId: storageFlavor.id });
  }, [deleteStorageFlavor, storageFlavor.id]);

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
        Delete storage flavor
      </ModalHeader>
      <ModalBody>
        {result.error && <RtkOrDataServicesError error={result.error} />}
        <p className="mb-0">
          Please confirm that you want to delete the{" "}
          <strong>{storageFlavor.display_name}</strong> storage flavor.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-danger" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel, keep storage flavor
        </Button>
        <Button color="danger" disabled={result.isLoading} onClick={onDelete}>
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Yes, delete this storage flavor
        </Button>
      </ModalFooter>
    </Modal>
  );
}
