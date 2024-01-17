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

import { useCallback, useEffect, useState } from "react";
import {
  ResourceClass,
  ResourcePool,
} from "../dataServices/dataServices.types";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { CheckLg, TrashFill, XLg } from "react-bootstrap-icons";
import cx from "classnames";
import { useDeleteResourceClassMutation } from "./adminComputeResources.api";
import { Loader } from "../../components/Loader";

interface DeleteResourceClassButtonProps {
  resourceClass: ResourceClass;
  resourcePool: ResourcePool;
}

export default function DeleteResourceClassButton({
  resourceClass,
  resourcePool,
}: DeleteResourceClassButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button
        className="btn-sm"
        color="outline-danger"
        disabled={resourceClass.default}
        onClick={toggle}
      >
        <TrashFill className={cx("bi", "me-1")} />
        Delete
        {resourceClass.default && " (The default class cannot be deleted)"}
      </Button>
      <DeleteResourceClassModal
        isOpen={isOpen}
        resourceClass={resourceClass}
        resourcePool={resourcePool}
        toggle={toggle}
      />
    </>
  );
}

interface DeleteResourceClassModalProps {
  isOpen: boolean;
  resourceClass: ResourceClass;
  resourcePool: ResourcePool;
  toggle: () => void;
}

function DeleteResourceClassModal({
  isOpen,
  resourceClass,
  resourcePool,
  toggle,
}: DeleteResourceClassModalProps) {
  const { id, name } = resourceClass;

  const [deleteResourceClass, result] = useDeleteResourceClassMutation();
  const onDelete = useCallback(() => {
    deleteResourceClass({
      resourceClassId: id,
      resourcePoolId: resourcePool.id,
    });
  }, [deleteResourceClass, id, resourcePool.id]);

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isError, result.isSuccess, toggle]);

  return (
    <Modal centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalBody>
        <h3 className={cx("fs-6", "lh-base", "text-danger", "fw-bold")}>
          Are you sure?
        </h3>
        <p className="mb-0">
          Please confirm that you want to delete the <strong>{name}</strong>{" "}
          resource class from the {resourcePool.name} resource pool.
        </p>
      </ModalBody>
      <ModalFooter className="pt-0">
        <Button className="ms-2" color="outline-rk-green" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel, keep resource class
        </Button>
        <Button className="ms-2" color="danger" onClick={onDelete}>
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Yes, delete this resource class
        </Button>
      </ModalFooter>
    </Modal>
  );
}
