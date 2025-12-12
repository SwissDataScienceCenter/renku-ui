/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";

import { PAUSE_SESSION_WARNING_GRACE_PERIOD_SECONDS } from "../session.constants";

interface PauseWarningModalProps {
  close: () => void;
  isOpen: boolean;
}
export default function PauseWarningModal({
  close,
  isOpen,
}: PauseWarningModalProps) {
  return (
    <Modal
      backdrop="static"
      centered
      data-cy="pause-warning-modal"
      isOpen={isOpen}
      size="lg"
    >
      <ModalHeader tag="h2">Session will pause soon</ModalHeader>
      <ModalBody>
        <p>
          Your session will shut down in{" "}
          {PAUSE_SESSION_WARNING_GRACE_PERIOD_SECONDS} seconds if there is no
          activity. To keep your session active, please click the button below.
        </p>
        <Button color="primary" onClick={close}>
          Keep my session active
        </Button>
      </ModalBody>
    </Modal>
  );
}
