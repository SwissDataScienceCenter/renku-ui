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
 * limitations under the License
 */

import cx from "classnames";
import { useState } from "react";
import { Pencil } from "react-bootstrap-icons";
import {
  Button,
  Col,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";

import { type ProjectStorage } from "~/features/dataConnectorsV2/api/data-connectors.api";
import ProjectStorageForm from "./ProjectStorageForm";

export default function ProjectStorageLinkDisplay({
  projectStorage,
}: {
  projectStorage: ProjectStorage;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <ListGroupItem
      action
      className={cx("position-relative", "p-0")}
      data-cy="data-connector-item"
    >
      <div
        className={cx(
          "d-block",
          "link-primary",
          "py-3",
          "text-body",
          "text-decoration-none",
        )}
      >
        <Row className={cx("align-items-center", "flex-nowrap", "g-3", "mx-0")}>
          <Col className={cx("d-flex", "flex-column", "min-w-0", "px-0")}>
            <div
              className={cx(
                "align-items-center",
                "d-flex",
                "flex-wrap",
                "gap-2",
              )}
            >
              <span className="fw-bold" data-cy="data-connector-name">
                Project storage
              </span>
            </div>
          </Col>
          {/* This column is a placeholder to reserve the space for the action button */}
          <Col xs="auto" className="flex-shrink-0">
            <div
              aria-hidden="true"
              className={cx(
                "btn",
                "btn-sm",
                "opacity-0",
                "pe-none",
                "text-nowrap",
              )}
            >
              FakeButton123
            </div>
          </Col>
        </Row>
      </div>
      {/* The action button is visually positioned over the previous placeholder column */}
      <div className={cx("end-0", "mt-3", "position-absolute", "top-0", "z-5")}>
        <Button
          color="outline-primary"
          data-cy="project-storage-edit-button"
          onClick={toggleModal}
          size="sm"
        >
          <Pencil className={cx("bi", "me-1")} />
          Edit
        </Button>
      </div>
      <ProjectStorageModal
        isOpen={isModalOpen}
        toggle={toggleModal}
        projectStorage={projectStorage}
      />
    </ListGroupItem>
  );
}

interface ProjectStorageModalProps {
  isOpen: boolean;
  toggle: () => void;
  projectStorage: ProjectStorage;
}

function ProjectStorageModal({
  isOpen,
  toggle,
  projectStorage,
}: ProjectStorageModalProps) {
  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle} tag="h2">
        Edit Project Storage
      </ModalHeader>
      <ModalBody>
        <ProjectStorageForm
          projectId={projectStorage.project_id}
          projectStorage={projectStorage}
          toggle={toggle}
        />
      </ModalBody>
    </Modal>
  );
}
