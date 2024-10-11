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
import { Trash } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom-v5-compat";
import { Button, Card, CardBody, CardHeader, Input } from "reactstrap";

import { Loader } from "../../../../components/Loader";
import { NOTIFICATION_TOPICS } from "../../../../notifications/Notifications.constants";
import { NotificationsManager } from "../../../../notifications/notifications.types";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";
import AppContext from "../../../../utils/context/appContext";
import { Project } from "../../../projectsV2/api/projectV2.api";
import { useDeleteProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api";

export function notificationProjectDeleted(
  notifications: NotificationsManager,
  projectName: string
) {
  notifications.addSuccess(
    NOTIFICATION_TOPICS.PROJECT_DELETED,
    <>
      Project <code>{projectName}</code> successfully deleted.
    </>
  );
}

interface ProjectDeleteProps {
  project: Project;
}
export default function ProjectPageDelete({ project }: ProjectDeleteProps) {
  const [deleteProject, result] = useDeleteProjectsByProjectIdMutation();
  const navigate = useNavigate();
  const { notifications } = useContext(AppContext);
  const onDelete = useCallback(() => {
    deleteProject({ projectId: project.id });
  }, [deleteProject, project.id]);

  useEffect(() => {
    if (result.isSuccess) {
      navigate(ABSOLUTE_ROUTES.v2.root);
      if (notifications)
        notificationProjectDeleted(notifications, project.name);
    }
  }, [result.isSuccess, navigate, notifications, project.name]);

  const [typedName, setTypedName] = useState("");
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTypedName(e.target.value.trim());
    },
    [setTypedName]
  );

  return (
    <Card id="delete">
      <CardHeader>
        <h4>
          <Trash className={cx("me-1", "bi")} />
          Delete project
        </h4>
        <p className="m-0">
          Deleting the project will remove its repository and launcher sessions.
        </p>
      </CardHeader>
      <CardBody>
        <p className="fw-bold">Are you sure you want to delete this project?</p>
        <p>
          Deleted projects cannot be restored. Please type{" "}
          <strong>{project.slug}</strong>, the slug of the project, to confirm.
        </p>
        <div className="mb-3">
          <Input
            data-cy="delete-confirmation-input"
            value={typedName}
            onChange={onChange}
          />
        </div>
        <div className="text-end">
          <Button
            color="danger"
            disabled={typedName !== project.slug?.trim() || result.isLoading}
            onClick={onDelete}
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <Trash className={cx("bi", "me-1")} />
            )}
            Delete project
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
