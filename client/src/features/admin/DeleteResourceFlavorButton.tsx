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
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import {
  useDeleteResourceFlavorsByResourceFlavorIdMutation,
  type ResourceFlavor,
} from "../sessionsV2/api/computeResources.api";
import LinkedResourceClasses, {
  useLinkedResourceClasses,
} from "./LinkedResourceClasses";

interface DeleteResourceFlavorButtonProps {
  resourceFlavor: ResourceFlavor;
}

export default function DeleteResourceFlavorButton({
  resourceFlavor,
}: DeleteResourceFlavorButtonProps) {
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
      <DeleteResourceFlavorModal
        isOpen={isOpen}
        resourceFlavor={resourceFlavor}
        toggle={toggle}
      />
    </>
  );
}

interface DeleteResourceFlavorModalProps {
  isOpen: boolean;
  resourceFlavor: ResourceFlavor;
  toggle: () => void;
}

function DeleteResourceFlavorModal({
  isOpen,
  resourceFlavor,
  toggle,
}: DeleteResourceFlavorModalProps) {
  const { data: linkedClasses, isLoading: linkedClassesIsLoading } =
    useLinkedResourceClasses(resourceFlavor.id, !isOpen);

  const [deleteResourceFlavor, result] =
    useDeleteResourceFlavorsByResourceFlavorIdMutation();
  const onDelete = useCallback(() => {
    deleteResourceFlavor({ resourceFlavorId: resourceFlavor.id });
  }, [deleteResourceFlavor, resourceFlavor.id]);

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  const isLinked = linkedClasses != null && linkedClasses.length > 0;

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalBody>
        {result.error && <RtkOrDataServicesError error={result.error} />}
        {linkedClassesIsLoading ? (
          <Loader className="me-1" inline size={16} />
        ) : isLinked ? (
          <>
            <h3 className="text-danger">
              This resource flavor is still in use
            </h3>
            <p className="mb-1">
              Unlink <strong>{resourceFlavor.name}</strong> from these resource
              classes before you delete it:
            </p>
            <LinkedResourceClasses classes={linkedClasses} />
          </>
        ) : (
          <>
            <h3 className="text-danger">Are you sure?</h3>
            <p className="mb-0">
              Please confirm that you want to delete the{" "}
              <strong>{resourceFlavor.name}</strong> resource flavor. No
              resource class links to it.
            </p>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="outline-danger" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel, keep resource flavor
        </Button>
        <Button
          color="danger"
          disabled={isLinked || linkedClassesIsLoading}
          onClick={onDelete}
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Yes, delete this resource flavor
        </Button>
      </ModalFooter>
    </Modal>
  );
}
