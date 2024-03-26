/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
import { TrashFill, XLg } from "react-bootstrap-icons";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { SessionEnvironment } from "../sessionsV2/sessionsV2.types";
import { useDeleteSessionEnvironmentMutation } from "./adminSessions.api";

interface DeleteSessionEnvironmentButtonProps {
  environment: SessionEnvironment;
}

export default function DeleteSessionEnvironmentButton({
  environment,
}: DeleteSessionEnvironmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button color="outline-danger" onClick={toggle}>
        <TrashFill className={cx("bi", "me-1")} />
        Delete
      </Button>
      <DeleteSessionEnvironmentModal
        environment={environment}
        isOpen={isOpen}
        toggle={toggle}
      />
    </>
  );
}

interface DeleteSessionEnvironmentModalProps {
  environment: SessionEnvironment;
  isOpen: boolean;
  toggle: () => void;
}

function DeleteSessionEnvironmentModal({
  environment,
  isOpen,
  toggle,
}: DeleteSessionEnvironmentModalProps) {
  const [deleteSessionEnvironment, result] =
    useDeleteSessionEnvironmentMutation();

  const onDelete = useCallback(() => {
    deleteSessionEnvironment({
      environmentId: environment.id,
    });
  }, [deleteSessionEnvironment, environment.id]);

  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    toggle();
  }, [result.isSuccess, toggle]);

  useEffect(() => {
    if (!isOpen) {
      result.reset();
    }
  }, [isOpen, result]);

  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader toggle={toggle}>Are you sure?</ModalHeader>
      <ModalBody>
        {result.error && <RtkErrorAlert error={result.error} />}

        <p className="mb-0">
          Please confirm that you want to delete the {environment.name} session
          environment.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-danger" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="danger"
          disabled={result.isLoading}
          onClick={onDelete}
          type="button"
          role="button"
        >
          <TrashFill className={cx("bi", "me-1")} />
          Delete session environment
        </Button>
      </ModalFooter>
    </Modal>
  );
}
