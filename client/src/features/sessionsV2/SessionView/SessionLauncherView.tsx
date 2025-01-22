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
import { useCallback, useMemo, useState } from "react";
import {
  Database,
  ExclamationTriangleFill,
  FileCode,
  Pencil,
} from "react-bootstrap-icons";
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
import {
  useGetResourceClassByIdQuery,
  useGetResourcePoolsQuery,
} from "../../dataServices/computeResources.api";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import { useProject } from "../../ProjectPageV2/ProjectPageContainer/ProjectPageContainer";
import { RepositoryItem } from "../../ProjectPageV2/ProjectPageContent/CodeRepositories/CodeRepositoryDisplay";
import SessionViewSessionSecrets from "../../ProjectPageV2/ProjectPageContent/SessionSecrets/SessionViewSessionSecrets";
import useProjectPermissions from "../../ProjectPageV2/utils/useProjectPermissions.hook";
import { useGetProjectsByProjectIdDataConnectorLinksQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import { SessionRowResourceRequests } from "../../session/components/SessionsList";
import { ModifyResourcesLauncherModal } from "../components/SessionModals/ModifyResourcesLauncher";
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

  const { data: resourcePools } = useGetResourcePoolsQuery({});
  const {
    data: launcherResourceClass,
    isLoading: isLoadingLauncherResourceClass,
  } = useGetResourceClassByIdQuery(launcher.resource_class_id ?? skipToken);
  const userLauncherResourceClass = useMemo(
    () =>
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == launcher?.resource_class_id),
    [launcher, resourcePools]
  );

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

  const [isResouresOpen, setResourcesOpen] = useState(false);
  const toggleResources = useCallback(() => {
    setResourcesOpen((open) => !open);
  }, []);

  const resourceDetails =
    !isLoadingLauncherResourceClass && launcherResourceClass ? (
      <SessionRowResourceRequests
        resourceRequests={{
          name: launcherResourceClass.name,
          cpu: launcherResourceClass.cpu,
          memory: launcherResourceClass.memory,
          storage:
            launcher?.disk_storage ?? launcherResourceClass.default_storage,
          gpu: launcherResourceClass.gpu,
        }}
      />
    ) : (
      <p>This session launcher does not have a default resource class.</p>
    );

  return (
    <Offcanvas isOpen={isOpen} toggle={toggle} direction="end" backdrop>
      <OffcanvasBody>
        <div className="mb-3">
          <button
            aria-label="Close"
            className="btn-close"
            data-cy="get-back-session-view"
            data-bs-dismiss="offcanvas"
            onClick={toggle}
          />
        </div>

        <div className={cx("d-flex", "flex-column", "gap-4")}>
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

          <p className="mb-0">
            {description ? description : <i>No description</i>}
          </p>

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
            <div className={cx("d-flex", "justify-content-between", "mb-2")}>
              <h4 className="my-auto">Default Resource Class</h4>
              {launcher && (
                <PermissionsGuard
                  disabled={null}
                  enabled={
                    <>
                      <Button
                        color="outline-primary"
                        id="modify-resource-class-button"
                        onClick={toggleResources}
                        size="sm"
                      >
                        <Pencil className="bi" />
                        <span className="visually-hidden">
                          Set resource class
                        </span>
                      </Button>
                      <UncontrolledTooltip target="modify-resource-class-button">
                        Set resource class
                      </UncontrolledTooltip>
                    </>
                  }
                  requestedPermission="write"
                  userPermissions={permissions}
                />
              )}
            </div>
            {resourceDetails}
            {launcherResourceClass && !userLauncherResourceClass && (
              <p>
                <ExclamationTriangleFill className={cx("bi", "text-warning")} />{" "}
                You do not have access to this resource class.
              </p>
            )}
            {launcher &&
              launcherResourceClass &&
              launcher.disk_storage &&
              launcher.disk_storage > launcherResourceClass.max_storage && (
                <p>
                  <ExclamationTriangleFill
                    className={cx("bi", "text-warning", "me-1")}
                  />
                  The selected disk storage exceeds the maximum value allowed (
                  {launcherResourceClass.max_storage} GB).
                </p>
              )}
            {launcher && (
              <ModifyResourcesLauncherModal
                isOpen={isResouresOpen}
                toggleModal={toggleResources}
                resourceClassId={userLauncherResourceClass?.id}
                diskStorage={launcher.disk_storage}
                sessionLauncherId={launcher.id}
              />
            )}
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
              <h4
                className={cx("align-items-center", "d-flex", "mb-0", "me-2")}
              >
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
              <p className={cx("mb-0", "fst-italic")}>
                No repositories included
              </p>
            )}
          </div>

          <SessionViewSessionSecrets />
        </div>
      </OffcanvasBody>
    </Offcanvas>
  );
}
