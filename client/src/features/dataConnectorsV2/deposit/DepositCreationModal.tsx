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
import { Database, XLg } from "react-bootstrap-icons";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

interface DepositCreationModalProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}
export default function DepositCreationModal({
  isOpen,
  setOpen,
}: DepositCreationModalProps) {
  return (
    <Modal centered data-cy="deposit-creation-modal" isOpen={isOpen} size="lg">
      <ModalHeader tag="h2">
        <Database className={cx("bi", "me-1")} /> Export files as a new dataset
      </ModalHeader>
      <ModalBody>TBD</ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={() => setOpen(false)}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
