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
import { useCallback, useEffect } from "react";
import { TrashFill, XLg } from "react-bootstrap-icons";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { useDeleteSessionV2Mutation } from "./sessionsV2.api";
import { SessionV2 } from "./sessionsV2.types";

interface DeleteSessionV2ModalProps {
  isOpen: boolean;
  session: SessionV2;
  toggle: () => void;
}

export default function DeleteSessionV2Modal({
  isOpen,
  session,
  toggle,
}: DeleteSessionV2ModalProps) {
  const [deleteSessionV2, result] = useDeleteSessionV2Mutation();

  const onDelete = useCallback(() => {
    deleteSessionV2({
      sessionId: session.id,
    });
  }, [deleteSessionV2, session.id]);

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
          Please confirm that you want to delete the {session.name} session.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button className="btn-outline-rk-green" onClick={toggle}>
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
          Delete session
        </Button>
      </ModalFooter>
    </Modal>
  );
}
