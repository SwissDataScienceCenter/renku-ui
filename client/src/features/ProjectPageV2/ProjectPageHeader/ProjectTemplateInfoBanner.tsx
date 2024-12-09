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
import { useCallback, useState } from "react";
import {
  Button,
  Col,
  ListGroup,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import { InfoCircle } from "react-bootstrap-icons";

import SuggestionBanner from "../../../components/SuggestionBanner";

import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import type { Project } from "../../projectsV2/api/projectV2.api";
import ProjectShortHandDisplay from "../../projectsV2/show/ProjectShortHandDisplay";
import { useGetProjectsByProjectIdCopiesQuery } from "../../projectsV2/api/projectV2.api";
import { useGetUserQuery } from "../../usersV2/api/users.api";

import useProjectPermissions from "../utils/useProjectPermissions.hook";

interface ProjectCopyListModalProps {
  copies: Project[];
  isOpen: boolean;
  project: Project;
  title: string;
  toggle: () => void;
}

export function ProjectCopyListModal({
  copies,
  isOpen,
  project,
  title,
  toggle,
}: ProjectCopyListModalProps) {
  return (
    <Modal
      data-cy="copy-list-modal"
      backdrop="static"
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
      centered
    >
      <ModalHeader toggle={toggle}>
        <span className="fw-normal">{title} </span>
        {project.namespace}/{project.slug}
      </ModalHeader>
      <ModalBody>
        <ListGroup flush data-cy="dashboard-project-list">
          {copies.map((project) => (
            <ProjectShortHandDisplay
              element="list-item"
              key={project.id}
              project={project}
            />
          ))}
        </ListGroup>
      </ModalBody>
    </Modal>
  );
}

function ProjectTemplateEditorBanner({ project }: { project: Project }) {
  const { data: currentUser } = useGetUserQuery();
  const { data: copies } = useGetProjectsByProjectIdCopiesQuery({
    projectId: project.id,
  });
  const [isModalOpen, setModalOpen] = useState(false);
  const toggleOpen = useCallback(() => {
    setModalOpen((open) => !open);
  }, []);
  if (currentUser == null) return null;
  if (project.template_id === null) return null;
  return (
    <>
      <SuggestionBanner className="p-2" icon={<InfoCircle className="bi" />}>
        <Row className="align-items-center">
          <Col>
            This project is a template.{" "}
            {copies != null &&
              (copies.length > 1 ? (
                <span>
                  There are{" "}
                  <Button
                    className={cx("px-0", "mb-1")}
                    color="link"
                    data-cy="list-copies-link"
                    onClick={toggleOpen}
                  >
                    <span className={cx("badge", "text-bg-primary")}>
                      {copies.length}
                    </span>{" "}
                    copies
                  </Button>{" "}
                  visible to you.
                </span>
              ) : (
                <span>
                  There are{" "}
                  <span className={cx("badge", "text-bg-secondary")}>0</span>{" "}
                  copies visible to you.
                </span>
              ))}
          </Col>
        </Row>
      </SuggestionBanner>
      {isModalOpen && (
        <ProjectCopyListModal
          copies={copies ?? []}
          isOpen={isModalOpen}
          project={project}
          title="Projects copied from"
          toggle={toggleOpen}
        />
      )}
    </>
  );
}

export default function ProjectTemplateInfoBanner({
  project,
}: {
  project: Project;
}) {
  const { data: currentUser } = useGetUserQuery();
  const userPermissions = useProjectPermissions({ projectId: project.id });
  if (currentUser == null) return null;
  if (project.template_id === null) return null;
  return (
    <PermissionsGuard
      disabled={null}
      enabled={<ProjectTemplateEditorBanner project={project} />}
      requestedPermission="write"
      userPermissions={userPermissions}
    />
  );
}
