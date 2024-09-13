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

import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";

import { projectV2Api } from "../projectsV2/api/projectV2.enhanced-api";

import { useDeleteSecretMutation } from "./secrets.api";
import { SecretDetails } from "./secrets.types";

interface SecretsDeleteProps {
  secret: SecretDetails;
}
export default function SecretDelete({ secret }: SecretsDeleteProps) {
  // Set up the modal
  const [showModal, setShowModal] = useState(false);
  const toggleModal = useCallback(() => {
    setShowModal((showModal) => !showModal);
  }, []);
  const dispatch = useAppDispatch();

  // Handle posting data
  const [deleteSecretMutation, result] = useDeleteSecretMutation();
  const deleteSecret = useCallback(() => {
    deleteSecretMutation(secret.id);
    dispatch(projectV2Api.util.invalidateTags(["Storages"]));
  }, [deleteSecretMutation, dispatch, secret.id]);

  // Automatically close the modal when the secret is modified
  useEffect(() => {
    if (result.isSuccess) {
      toggleModal();
    }
  }, [result.isSuccess, toggleModal]);

  return (
    <>
      <Button
        className="text-nowrap"
        color="outline-danger"
        data-cy="secret-delete-button"
        onClick={toggleModal}
        size="sm"
      >
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
            <code>{secret.name}</code>.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button data-cy="secrets-delete-cancel-button" onClick={toggleModal}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button
            color="outline-danger"
            data-cy="secrets-delete-delete-button"
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
