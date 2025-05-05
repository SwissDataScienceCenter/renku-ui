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
 * limitations under the License.
 */

import cx from "classnames";
import { Link45deg, XLg } from "react-bootstrap-icons";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { CommandCopy } from "../../../components/commandCopy/CommandCopy";
import { Project } from "../../projectsV2/api/projectV2.api";
import { SessionLauncher } from "../api/sessionLaunchersV2.generated-api";
import useSessionStartLink from "./useSessionStartLink.hook";

interface SessionStartLinkModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
  project: Project;
  toggle: () => void;
}

export default function SessionStartLinkModal({
  isOpen,
  launcher,
  toggle,
  project,
}: SessionStartLinkModalProps) {
  const { url } = useSessionStartLink({ launcher, project });
  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader toggle={toggle}>
        <Link45deg className={cx("bi", "me-1")} />
        Session launcher share link
      </ModalHeader>
      <ModalBody>
        <p className="mb-2">
          A session launch link leads directly to a session.
        </p>
        <CommandCopy command={url.toString()} noMargin />
      </ModalBody>
      <ModalFooter className="pt-0">
        <Button color="outline-primary" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
