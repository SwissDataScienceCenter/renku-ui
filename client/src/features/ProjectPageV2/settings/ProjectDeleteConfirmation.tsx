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
import { useCallback, useContext, useEffect, useState } from "react";
import { Trash, XLg } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom-v5-compat";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { Loader } from "../../../components/Loader";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import AppContext from "../../../utils/context/appContext";

import { notificationProjectDeleted } from "../../ProjectPageV2/ProjectPageContent/Settings/ProjectDelete";
import type { Project } from "../../projectsV2/api/projectV2.api";
import { useDeleteProjectsByProjectIdMutation } from "../../projectsV2/api/projectV2.enhanced-api";

interface ProjectDeleteConfirmationProps {
  isOpen: boolean;
  toggle: () => void;
  project: Project;
}

export default function ProjectDeleteConfirmation({
  isOpen,
  toggle,
  project,
}: ProjectDeleteConfirmationProps) {
  const navigate = useNavigate();
  const { notifications } = useContext(AppContext);
  const [deleteProject, result] = useDeleteProjectsByProjectIdMutation();
  const onDelete = useCallback(() => {
    deleteProject({ projectId: project.id });
  }, [deleteProject, project.id]);
  const [typedName, setTypedName] = useState("");
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTypedName(e.target.value.trim());
    },
    [setTypedName]
  );

  useEffect(() => {
    if (result.isSuccess) {
      navigate(ABSOLUTE_ROUTES.v2.projects.root);
      if (notifications)
        notificationProjectDeleted(notifications, project.name);
    }
    if (result.isSuccess || result.isError) {
      toggle();
    }
  }, [
    result.isError,
    result.isSuccess,
    toggle,
    navigate,
    notifications,
    project.name,
  ]);

  return (
    <Modal centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader className={cx("text-danger")}>Delete project</ModalHeader>
      <ModalBody>
        <p>
          Deleted projects cannot be restored. Please type{" "}
          <strong>{project.slug}</strong>, the slug of the project, to confirm.
        </p>
        <Input
          data-cy="delete-confirmation-input"
          value={typedName}
          onChange={onChange}
        />
      </ModalBody>
      <ModalFooter className="gap-2">
        <Button color="outline-danger" onClick={toggle}>
          <XLg className={cx("me-2", "text-icon")} />
          Cancel
        </Button>
        <Button
          color="danger"
          disabled={typedName !== project.slug?.trim()}
          onClick={onDelete}
        >
          {result.isLoading ? (
            <Loader className="me-2" inline size={16} />
          ) : (
            <Trash className={cx("me-2", "text-icon")} />
          )}
          Delete project
        </Button>
      </ModalFooter>
    </Modal>
  );
}
