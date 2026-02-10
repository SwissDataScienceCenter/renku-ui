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
import { useCallback, useEffect, useState } from "react";
import { Trash } from "react-bootstrap-icons";
import { useNavigate } from "react-router";
import { Button, Card, CardBody, CardHeader, Input } from "reactstrap";

import useRenkuToast from "~/components/toast/useRenkuToast";
import { Loader } from "../../../../components/Loader";
import { NOTIFICATION_TOPICS } from "../../../../notifications/Notifications.constants";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";
import { Project } from "../../../projectsV2/api/projectV2.api";
import { useDeleteProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api";

interface ProjectDeleteProps {
  project: Project;
}
export default function ProjectPageDelete({ project }: ProjectDeleteProps) {
  const [deleteProject, result] = useDeleteProjectsByProjectIdMutation();
  const navigate = useNavigate();
  const { renkuToastSuccess } = useRenkuToast();
  const onDelete = useCallback(() => {
    deleteProject({ projectId: project.id });
  }, [deleteProject, project.id]);

  useEffect(() => {
    if (result.isSuccess) {
      navigate(ABSOLUTE_ROUTES.v2.root);
      renkuToastSuccess({
        textHeader: NOTIFICATION_TOPICS.PROJECT_DELETED,
        textBody: (
          <>
            {" "}
            Project <code>{project.name}</code> successfully deleted.
          </>
        ),
      });
    }
  }, [navigate, project.name, renkuToastSuccess, result.isSuccess]);

  const [typedName, setTypedName] = useState("");
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTypedName(e.target.value.trim());
    },
    [setTypedName]
  );

  return (
    <Card data-cy="project-delete">
      <CardHeader>
        <h2 className="mb-0">
          <Trash className={cx("me-1", "bi")} />
          Delete project
        </h2>
      </CardHeader>
      <CardBody>
        <p className="fw-bold">Are you sure you want to delete this project?</p>
        <div className="mb-3">
          <p className="mb-2">
            Deleted projects cannot be restored. Please type{" "}
            <strong>{project.slug}</strong>, the slug of the project, to
            confirm.
          </p>
          <Input
            data-cy="delete-confirmation-input"
            value={typedName}
            onChange={onChange}
          />
        </div>
        <div className="text-end">
          <Button
            color="danger"
            data-cy="project-delete-button"
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
