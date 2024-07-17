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
import { useCallback, useState } from "react";
import { FileCode, PlusLg } from "react-bootstrap-icons";

import { Project } from "../../../projectsV2/api/projectV2.api.ts";
import { AddCodeRepositoryStep1Modal } from "./AddCodeRepositoryModal.tsx";
import AccessGuard from "../../utils/AccessGuard.tsx";
import useProjectAccess from "../../utils/useProjectAccess.hook.ts";
import { RepositoryItem } from "./CodeRepositoryDisplay.tsx";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ListGroup,
  ListGroupItem,
} from "reactstrap";

export function CodeRepositoriesDisplay({ project }: { project: Project }) {
  const { userRole } = useProjectAccess({ projectId: project.id });
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const totalRepositories = project.repositories?.length || 0;
  return (
    <Card data-cy="code-repositories-box">
      <CardHeader>
        <div
          className={cx(
            "align-items-center",
            "d-flex",
            "justify-content-between"
          )}
        >
          <div className={cx("align-items-center", "d-flex")}>
            <h4 className={cx("align-items-center", "d-flex", "mb-0", "me-2")}>
              <FileCode className={cx("me-2", "small", "text-icon")} />
              Code Repositories
            </h4>
            {project?.repositories?.length != null && (
              <Badge>{project?.repositories?.length}</Badge>
            )}
          </div>

          <div className="my-auto">
            <AccessGuard
              disabled={null}
              enabled={
                <Button color="outline-primary" onClick={toggle} size="sm">
                  <PlusLg className="icon-text" />
                </Button>
              }
              minimumRole="editor"
              role={userRole}
            />
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {totalRepositories === 0 ? (
          <p className="m-0">
            Connect code repositories to save and share code.
          </p>
        ) : (
          <ListGroup flush>
            {project.repositories?.map((repositoryUrl, index) => (
              <RepositoryItem
                key={index}
                project={project}
                url={repositoryUrl}
              />
            ))}
          </ListGroup>
        )}
      </CardBody>
      <AddCodeRepositoryStep1Modal
        toggleModal={toggle}
        isOpen={isOpen}
        project={project}
      />
    </Card>
  );
}
