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
import { Diagram3Fill, NodeMinus } from "react-bootstrap-icons";
import { Button, Card, CardBody, CardHeader, Input } from "reactstrap";

import { Loader } from "../../../../components/Loader";
import { NOTIFICATION_TOPICS } from "../../../../notifications/Notifications.constants";
import { NotificationsManager } from "../../../../notifications/notifications.types";
import AppContext from "../../../../utils/context/appContext";
import { Project } from "../../../projectsV2/api/projectV2.api";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api";

export function notificationProjectDeleted(
  notifications: NotificationsManager,
  projectName: string
) {
  notifications.addSuccess(
    NOTIFICATION_TOPICS.PROJECT_UPDATED,
    <>
      Project <code>{projectName}</code> successfully unlinked.
    </>
  );
}

interface ProjectUnlinkTemplateProps {
  project: Project;
}
export default function ProjectUnlinkTemplate({
  project,
}: ProjectUnlinkTemplateProps) {
  const [patchProject, result] = usePatchProjectsByProjectIdMutation();
  const { notifications } = useContext(AppContext);
  const onUnlink = useCallback(() => {
    patchProject({
      projectId: project.id,
      "If-Match": project.etag ?? "",
      projectPatch: {
        template_id: "",
      },
    });
  }, [patchProject, project.etag, project.id]);

  useEffect(() => {
    if (result.isSuccess) {
      if (notifications)
        notificationProjectDeleted(notifications, project.name);
      result.reset();
    }
  }, [notifications, project.name, result]);

  const [typedName, setTypedName] = useState("");
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTypedName(e.target.value.trim());
    },
    [setTypedName]
  );

  if (project.template_id == null) return null;
  return (
    <Card id="copy">
      <CardHeader>
        <h4>
          <Diagram3Fill className={cx("bi", "me-1")} />
          Break template link
        </h4>
        <p className="m-0">
          This will break the link between this project and the template it was
          created from.
        </p>
      </CardHeader>
      <CardBody>
        <p className="fw-bold">
          Are you sure you want to unlink this project from its template?
        </p>
        <p>
          This cannot be undone. Please type <strong>{project.slug}</strong>,
          the slug of the project, to confirm.
        </p>
        <div className="mb-3">
          <Input
            data-cy="unlink-confirmation-input"
            value={typedName}
            onChange={onChange}
          />
        </div>
        <div className="text-end">
          <Button
            color="danger"
            disabled={typedName !== project.slug?.trim() || result.isLoading}
            onClick={onUnlink}
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <NodeMinus className={cx("bi", "me-1")} />
            )}
            Unlink project
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
