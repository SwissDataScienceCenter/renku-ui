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

import { toHumanDuration } from "~/utils/helpers/DurationUtils";
import { PAUSE_SESSION_WARNING_GRACE_PERIOD_SECONDS } from "../session.constants";

interface PauseWarningModalProps {
  close: () => void;
  isOpen: boolean;
  targetPauseDate?: Date | string;
}
export default function PauseWarningModal({
  close,
  isOpen,
  targetPauseDate,
}: PauseWarningModalProps) {
  const deltaPause = targetPauseDate
    ? (new Date(targetPauseDate).getTime() - new Date().getTime()) / 1_000
    : null;
  const stringyDuration =
    deltaPause == null
      ? toHumanDuration({
          duration: PAUSE_SESSION_WARNING_GRACE_PERIOD_SECONDS,
        })
      : deltaPause > 0
      ? toHumanDuration({ duration: deltaPause })
      : "a few seconds";

  return (
    <Modal
      backdrop="static"
      centered
      data-cy="pause-warning-modal"
      isOpen={isOpen}
      size="lg"
    >
      <ModalHeader tag="h2">Session inactive</ModalHeader>
      <ModalBody>
        <p className="mb-2">
          Your sessions appears to be inactive and will be paused in{" "}
          {stringyDuration}.
        </p>
        <p>To keep your session active, please click the button below.</p>
        <Button color="primary" onClick={close}>
          Keep my session active
        </Button>
      </ModalBody>
    </Modal>
  );
}
