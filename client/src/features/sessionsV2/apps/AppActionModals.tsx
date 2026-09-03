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
import { useCallback } from "react";
import { StopCircle, XLg } from "react-bootstrap-icons";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { WarnAlert } from "~/components/Alert";

interface AppActionModalProps {
  appName: string;
  isOpen: boolean;
  toggle: () => void;
  onConfirm: () => void;
}

export function DeleteAppModal({
  appName,
  isOpen,
  toggle,
  onConfirm,
}: AppActionModalProps) {
  // "Stop" is the user-facing verb; the backend only offers create/delete.
  const onStop = useCallback(() => {
    onConfirm();
    toggle();
  }, [onConfirm, toggle]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader
        className="text-danger"
        data-cy="delete-app-title"
        tag="h2"
        toggle={toggle}
      >
        <StopCircle className={cx("bi", "me-1")} />
        Stop app
      </ModalHeader>
      <ModalBody>
        <p className="mb-3">
          Are you sure you want to stop the <b>{appName}</b> app?
        </p>
        <WarnAlert dismissible={false}>
          <p className="mb-0">
            This shuts down the running app and frees its public URL. The app
            launcher is kept, so you can start it again later. Anyone currently
            using the app will lose access.
          </p>
        </WarnAlert>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-danger" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="danger"
          data-cy="delete-app-button"
          onClick={onStop}
          type="button"
        >
          <StopCircle className={cx("bi", "me-1")} />
          Stop app
        </Button>
      </ModalFooter>
    </Modal>
  );
}
