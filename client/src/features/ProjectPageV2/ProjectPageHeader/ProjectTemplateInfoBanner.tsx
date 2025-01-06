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
import { Button, ListGroup, Modal, ModalBody, ModalHeader } from "reactstrap";
import { Diagram3Fill } from "react-bootstrap-icons";

import PrimaryAlert from "../../../components/PrimaryAlert";

import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import type { Project } from "../../projectsV2/api/projectV2.api";
import ProjectShortHandDisplay from "../../projectsV2/show/ProjectShortHandDisplay";
import { useGetProjectsByProjectIdCopiesQuery } from "../../projectsV2/api/projectV2.api";
import { useGetUserQuery } from "../../usersV2/api/users.api";

import useProjectPermissions from "../utils/useProjectPermissions.hook";
import styles from "./ProjectTemplateInfoBanner.module.css";

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
      <ModalBody className={cx("overflow-y-scroll", styles.modalBody)}>
        <ListGroup flush data-cy="dashboard-project-list">
          {copies.map((project) => (
            <ProjectShortHandDisplay key={project.id} project={project} />
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
      <PrimaryAlert className="p-2" icon={null}>
        <div className="py-0">
          <Diagram3Fill className={cx("bi", "me-1")} />
          This project is a template.{" "}
          {copies != null &&
            (copies.length > 1 ? (
              <span>
                There are{" "}
                <span className={cx("badge", "text-bg-primary")}>
                  {copies.length}
                </span>{" "}
                <Button
                  className={cx("p-0", styles.projectCopiesButton)}
                  color="link"
                  data-cy="list-copies-link"
                  onClick={toggleOpen}
                >
                  copies
                </Button>{" "}
                visible to you.
              </span>
            ) : copies.length === 1 ? (
              <span>
                There is{" "}
                <span className={cx("badge", "text-bg-primary")}>1</span>{" "}
                <Button
                  className={cx("p-0", styles.projectCopiesButton)}
                  color="link"
                  data-cy="list-copies-link"
                  onClick={toggleOpen}
                >
                  copy
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
        </div>
      </PrimaryAlert>
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
