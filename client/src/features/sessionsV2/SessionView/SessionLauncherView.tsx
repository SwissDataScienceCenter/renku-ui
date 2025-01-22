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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useState } from "react";
import { Database, FileCode, Pencil } from "react-bootstrap-icons";
import {
  Badge,
  Button,
  ListGroup,
  ListGroupItem,
  Offcanvas,
  OffcanvasBody,
  UncontrolledTooltip,
} from "reactstrap";

import { useGetDataConnectorsListByDataConnectorIdsQuery } from "../../dataConnectorsV2/api/data-connectors.enhanced-api";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import { useProject } from "../../ProjectPageV2/ProjectPageContainer/ProjectPageContainer";
import { RepositoryItem } from "../../ProjectPageV2/ProjectPageContent/CodeRepositories/CodeRepositoryDisplay";
import SessionViewSessionSecrets from "../../ProjectPageV2/ProjectPageContent/SessionSecrets/SessionViewSessionSecrets";
import useProjectPermissions from "../../ProjectPageV2/utils/useProjectPermissions.hook";
import { useGetProjectsByProjectIdDataConnectorLinksQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import UpdateSessionLauncherModal from "../components/SessionModals/UpdateSessionLauncherModal";
import type { SessionLauncher } from "../sessionsV2.types";
import { EnvironmentCard } from "./EnvironmentCard";

interface SessionLauncherViewProps {
  isOpen: boolean;
  toggle: () => void;

  launcher: SessionLauncher;
}

export default function SessionLauncherView({
  isOpen,
  toggle,
  launcher,
}: SessionLauncherViewProps) {
  const { description, name } = launcher;

  const { project } = useProject();
  const permissions = useProjectPermissions({ projectId: project.id });

  const { data: dataConnectorLinks } =
    useGetProjectsByProjectIdDataConnectorLinksQuery({
      projectId: project.id,
    });
  const dataConnectorIds = dataConnectorLinks?.map(
    (link) => link.data_connector_id
  );
  const { data: dataConnectorsMap } =
    useGetDataConnectorsListByDataConnectorIdsQuery(
      dataConnectorIds ? { dataConnectorIds } : skipToken
    );
  const dataConnectors = Object.values(dataConnectorsMap ?? {});

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const toggleUpdate = useCallback(() => {
    setIsUpdateOpen((open) => !open);
  }, []);

  //   const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  //     const [isModifyResourcesOpen, setModifyResourcesOpen] = useState(false);
  //     const toggle = useCallback(() => {
  //       setIsUpdateOpen((open) => !open);
  //     }, []);
  //     const toggleModifyResources = useCallback(() => {
  //       setModifyResourcesOpen((open) => !open);
  //     }, []);

  return (
    <Offcanvas
      //   id={id}
      //   key={`launcher-details-${key}`}
      //   toggle={setToggleSessionView}
      //   isOpen={toggleSessionView}
      //   direction="end"
      //   backdrop={true}

      isOpen={isOpen}
      toggle={toggle}
      direction="end"
      backdrop
    >
      <div className={cx("offcanvas-header", "d-block")}>
        <div className="mb-3">
          <button
            aria-label="Close"
            className="btn-close"
            data-cy="get-back-session-view"
            data-bs-dismiss="offcanvas"
            onClick={toggle}
          />
        </div>
        <div>
          <div>
            <div className={cx("float-end", "mt-1", "ms-1")}>
              {"<launcherMenu>"}
            </div>
            <h2
              className={cx("m-0", "text-break")}
              data-cy="session-view-title"
            >
              {name}
            </h2>
          </div>

          <p className={cx("fst-italic", "m-0")}>Session launcher</p>
        </div>
      </div>
      <OffcanvasBody className={cx("d-flex", "flex-column", "gap-4", "pt-2")}>
        <p className="mb-0">
          {description ? description : <i>No description</i>}
        </p>

        <div>{"<SESSION LAUNCHER DETAILS>"}</div>

        <div>
          <div className={cx("d-flex", "justify-content-between", "mb-2")}>
            <h4 className="my-auto">Session Environment</h4>
            <PermissionsGuard
              disabled={null}
              enabled={
                <>
                  <Button
                    color="outline-primary"
                    id="modify-session-environment-button"
                    onClick={toggleUpdate}
                    size="sm"
                  >
                    <Pencil className="bi" />
                    <span className="visually-hidden">
                      Modify session environment
                    </span>
                  </Button>
                  <UncontrolledTooltip target="modify-session-environment-button">
                    Modify session environment
                  </UncontrolledTooltip>
                </>
              }
              requestedPermission="write"
              userPermissions={permissions}
            />
          </div>
          <EnvironmentCard launcher={launcher} />
          <UpdateSessionLauncherModal
            isOpen={isUpdateOpen}
            launcher={launcher}
            toggle={toggleUpdate}
          />
        </div>

        <div>
          <div className={cx("align-items-center", "d-flex", "mb-2")}>
            <h4 className={cx("mb-0", "me-2")}>
              <Database className={cx("me-1", "bi")} />
              Data Connectors
            </h4>
            <Badge>{dataConnectors?.length || 0}</Badge>
          </div>
          {dataConnectors && dataConnectors.length > 0 ? (
            <ListGroup>
              {dataConnectors.map((storage, index) => (
                <ListGroupItem key={`storage-${index}`}>
                  <div>Name: {storage.name}</div>
                  <div>Type: {storage.storage.storage_type}</div>
                </ListGroupItem>
              ))}
            </ListGroup>
          ) : (
            <p className={cx("mb-0", "fst-italic")}>
              No data connectors included
            </p>
          )}
        </div>

        <div>
          <div className={cx("align-items-center", "d-flex", "mb-2")}>
            <h4 className={cx("align-items-center", "d-flex", "mb-0", "me-2")}>
              <FileCode className={cx("me-1", "bi")} />
              Code Repositories
            </h4>
            {project?.repositories?.length != null && (
              <Badge>{project?.repositories?.length}</Badge>
            )}
          </div>
          {project.repositories && project.repositories.length > 0 ? (
            <ListGroup>
              {project.repositories.map((repositoryUrl, index) => (
                <RepositoryItem
                  key={`storage-${index}`}
                  project={project}
                  readonly={true}
                  url={repositoryUrl}
                />
              ))}
            </ListGroup>
          ) : (
            <p className={cx("mb-0", "fst-italic")}>No repositories included</p>
          )}
        </div>

        <SessionViewSessionSecrets />
      </OffcanvasBody>
    </Offcanvas>
  );
}
