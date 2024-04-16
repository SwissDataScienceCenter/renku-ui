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
 * limitations under the License
 */

import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import { TrashFill, XLg } from "react-bootstrap-icons";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { useDeleteSecretMutation } from "./secrets.api";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";

interface SecretsDeleteProps {
  secretId: string;
}
export default function SecretDelete({ secretId }: SecretsDeleteProps) {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = useCallback(() => {
    setShowModal((showModal) => !showModal);
  }, []);

  const [deleteSecretMutation, result] = useDeleteSecretMutation();
  const deleteSecret = useCallback(() => {
    deleteSecretMutation(secretId);
  }, [deleteSecretMutation, secretId]);

  useEffect(() => {
    if (result.isSuccess) {
      toggleModal();
    }
  }, [result.isSuccess, toggleModal]);

  return (
    <>
      <Button className="ms-2" color="outline-danger" onClick={toggleModal}>
        <TrashFill className={cx("bi", "me-1")} />
        Delete
      </Button>

      <Modal isOpen={showModal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Are you sure?</ModalHeader>
        <ModalBody>
          {result.isError && <RtkOrNotebooksError error={result.error} />}
          <p className="mb-0">
            Please confirm that you want to{" "}
            <span className="fw-bold">permanently</span> delete the secret{" "}
            <code>{secretId}</code>.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={toggleModal}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button
            color="outline-danger"
            disabled={result.isLoading}
            onClick={deleteSecret}
          >
            <TrashFill className={cx("bi", "me-1")} />
            Delete secret
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
