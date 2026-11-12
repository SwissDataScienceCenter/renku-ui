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
import { Modal, ModalBody, ModalHeader } from "reactstrap";

import RenkuStorageIcon from "~/components/icons/RenkuStorageIcon";
import type { ProjectStorageV2 } from "~/features/cloudStorage/api/projectCloudStorage.api";

interface ProjectStorageV2EditModalProps {
  storage: ProjectStorageV2;
  isOpen: boolean;
  toggle: () => void;
}

export default function ProjectStorageV2EditModal({
  // storage,
  isOpen,
  toggle,
}: ProjectStorageV2EditModalProps) {
  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle} tag="h2">
        <RenkuStorageIcon className={cx("bi", "me-1")} />
        Edit Project Storage
      </ModalHeader>
      {/* <ProjectStorageForm
        projectId={projectStorage.project_id}
        projectStorage={projectStorage}
        toggle={toggle}
      /> */}
      <ModalBody data-cy="project-storage-body">
        TODO: cannot edit project storage yet
      </ModalBody>
    </Modal>
  );
}
