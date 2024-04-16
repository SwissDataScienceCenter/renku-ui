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
import { PencilSquare, XLg } from "react-bootstrap-icons";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { useEditSecretMutation } from "./secrets.api";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";

interface SecretsEditProps {
  secretId: string;
}
export default function SecretEdit({ secretId }: SecretsEditProps) {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = useCallback(() => {
    setShowModal((showModal) => !showModal);
  }, []);

  const [editSecretMutation, result] = useEditSecretMutation();
  const editSecret = useCallback(() => {
    editSecretMutation({ id: secretId, value: "TMP NEW VALUE" });
  }, [editSecretMutation, secretId]);

  useEffect(() => {
    if (result.isSuccess) {
      toggleModal();
    }
  }, [result.isSuccess, toggleModal]);

  return (
    <>
      <Button className="btn-outline-rk-green" onClick={toggleModal}>
        <PencilSquare className={cx("bi", "me-1")} />
        Edit
      </Button>

      <Modal isOpen={showModal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          Edit Secret <code>{secretId}</code>
        </ModalHeader>
        <ModalBody>
          {result.isError && <RtkOrNotebooksError error={result.error} />}
          <p>
            <i>Work in progress</i>
          </p>
        </ModalBody>
        <ModalFooter>
          <Button disabled={result.isLoading} onClick={editSecret}>
            <PencilSquare className={cx("bi", "me-1")} />
            Edit
          </Button>
          <Button className="btn-outline-rk-green" onClick={toggleModal}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
