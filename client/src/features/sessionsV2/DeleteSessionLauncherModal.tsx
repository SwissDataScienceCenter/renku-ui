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
import { Trash, XLg } from "react-bootstrap-icons";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { useDeleteSessionLauncherMutation } from "./sessionsV2.api";
import { SessionLauncher } from "./sessionsV2.types";
import { WarnAlert } from "../../components/Alert";

interface DeleteSessionLauncherModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
  toggle: () => void;
  sessionsLength: number;
}

export default function DeleteSessionLauncherModal({
  isOpen,
  launcher,
  toggle,
  sessionsLength,
}: DeleteSessionLauncherModalProps) {
  const [deleteSessionLauncher, result] = useDeleteSessionLauncherMutation();

  const onDelete = useCallback(() => {
    deleteSessionLauncher({
      launcherId: launcher.id,
    });
  }, [deleteSessionLauncher, launcher.id]);

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
      <ModalHeader toggle={toggle} className="text-danger">
        Delete session launcher
      </ModalHeader>
      <ModalBody className="pt-0">
        {result.error && <RtkErrorAlert error={result.error} />}
        <p className="mb-3">
          Are you sure you want to delete the <b>{launcher.name}</b> session
          launcher?
        </p>
        {sessionsLength > 0 && (
          <WarnAlert dismissible={false}>
            <p>
              You have a session running from this launcher. If you delete this
              session launcher, that session will continue running, but it
              become an orphan session and will not be able to be launched again
              once stopped. If other RenkuLab users are running sessions from
              this launcher, their sessions will become orphan sessions as well.
            </p>
          </WarnAlert>
        )}
        {sessionsLength === 0 && (
          <WarnAlert dismissible={false}>
            <p>
              If other RenkuLab users are running sessions from this launcher,
              their sessions will become orphan sessions. This means that their
              sessions will continue running, but will not be able to be
              launched again once stopped.
            </p>
          </WarnAlert>
        )}
      </ModalBody>
      <ModalFooter className="pt-0">
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
          <Trash className={cx("bi", "me-1")} />
          Delete Session launcher
        </Button>
      </ModalFooter>
    </Modal>
  );
}
