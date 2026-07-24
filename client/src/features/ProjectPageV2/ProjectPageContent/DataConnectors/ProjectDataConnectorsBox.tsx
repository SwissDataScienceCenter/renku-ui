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
import { useCallback, useRef, useState } from "react";
import { Database, PlusLg } from "react-bootstrap-icons";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ListGroup,
  ListGroupItem,
  UncontrolledTooltip,
} from "reactstrap";

import {
  type DataConnectorToProjectLink,
  type GetProjectsByProjectIdDataConnectorLinksApiResponse,
  type ProjectStorage,
} from "~/features/dataConnectorsV2/api/data-connectors.api";
import {
  useGetDataConnectorsByDataConnectorIdQuery,
  useGetProjectsByProjectIdDataConnectorLinksQuery,
  useGetProjectsByProjectIdInaccessibleDataConnectorLinksQuery,
  useGetProjectsByProjectIdStorageQuery,
} from "~/features/dataConnectorsV2/api/data-connectors.enhanced-api";
import { ErrorAlert } from "../../../../components/Alert";
import RtkOrDataServicesError from "../../../../components/errors/RtkOrDataServicesError";
import { Loader } from "../../../../components/Loader";
import DataConnectorBoxListDisplay, {
  DataConnectorBoxListDisplayPlaceholder,
} from "../../../dataConnectorsV2/components/DataConnectorsBoxListDisplay";
import PermissionsGuard from "../../../permissionsV2/PermissionsGuard";
import type { Project } from "../../../projectsV2/api/projectV2.api";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";
import ProjectConnectDataConnectorsModal from "./ProjectConnectDataConnectorsModal";
import { PROJECT_STORAGE_DEFAULT_MOUNT_PATH } from "./projectDataConnectors.constants";

interface DataConnectorListDisplayProps {
  project: Project;
}

export default function ProjectDataConnectorsBox({
  project,
}: DataConnectorListDisplayProps) {
  const { data, error, isLoading } =
    useGetProjectsByProjectIdDataConnectorLinksQuery({
      projectId: project.id,
    });

  const {
    data: inaccessibleDataConnectorsData,
    isLoading: inaccessibleDataConnectorsIsLoading,
  } = useGetProjectsByProjectIdInaccessibleDataConnectorLinksQuery({
    projectId: project.id,
  });

  const {
    data: projectStorageData,
    error: projectStorageError,
    isLoading: projectStorageIsLoading,
  } = useGetProjectsByProjectIdStorageQuery({
    projectId: project.id,
  });

  if (
    isLoading ||
    inaccessibleDataConnectorsIsLoading ||
    projectStorageIsLoading
  )
    return <DataConnectorLoadingBoxContent />;

  if (error) {
    return <RtkOrDataServicesError error={error} dismissible={false} />;
  }

  if (projectStorageError) {
    return (
      <RtkOrDataServicesError error={projectStorageError} dismissible={false} />
    );
  }

  if (data == null) {
    return (
      <ErrorAlert>
        Data connectors could not be loaded from the API, please contact a Renku
        administrator.
      </ErrorAlert>
    );
  }

  return (
    <ProjectDataConnectorBoxContent
      data={data}
      project={project}
      inaccessibleDataConnectorsCount={
        inaccessibleDataConnectorsData?.count || 0
      }
      projectStorageData={projectStorageData}
    />
  );
}

interface ProjectDataConnectorBoxContentProps extends DataConnectorListDisplayProps {
  data: GetProjectsByProjectIdDataConnectorLinksApiResponse;
  inaccessibleDataConnectorsCount: number;
  projectStorageData?: ProjectStorage[];
}
function ProjectDataConnectorBoxContent({
  data,
  project,
  inaccessibleDataConnectorsCount,
  projectStorageData,
}: ProjectDataConnectorBoxContentProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const toggleOpen = useCallback(() => {
    setModalOpen((open) => !open);
  }, []);
  const accessibleDataConnectorsCount =
    data.length + (projectStorageData ? projectStorageData.length : 0);

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <Card className="h-100" data-cy="data-connector-box">
        <ProjectDataConnectorBoxHeader
          projectId={project.id}
          toggleOpen={toggleOpen}
          accessibleDataConnectorsCount={accessibleDataConnectorsCount}
          inaccessibleDataConnectorsCount={inaccessibleDataConnectorsCount}
        />
        <CardBody>
          {accessibleDataConnectorsCount === 0 && (
            <p className={cx("m-0", "text-body-secondary")}>
              Add published datasets from data repositories, and connect to
              cloud storage to read and write custom data.
            </p>
          )}
          {data != null && data.length > 0 && (
            <ListGroup flush>
              {data.map((dc) => (
                <DataConnectorLinkDisplay
                  key={dc.id}
                  dataConnectorLink={dc}
                  projectPath={`${project.namespace}/${project.slug}`}
                />
              ))}
            </ListGroup>
          )}
          {projectStorageData && projectStorageData.length > 0 && (
            <ListGroup flush>
              {projectStorageData.map((ps, index) => (
                <ProjectStorageLinkDisplay
                  key={index}
                  projectStorage={ps}
                  name={`Project storage ${projectStorageData.length > 1 ? index + 1 : ""}`}
                />
              ))}
            </ListGroup>
          )}
        </CardBody>
      </Card>
      {isModalOpen && (
        <ProjectConnectDataConnectorsModal
          isOpen={isModalOpen}
          namespace={project.namespace}
          project={project}
          toggle={toggleOpen}
        />
      )}
    </div>
  );
}

function ProjectStorageLinkDisplay({
  projectStorage,
  name,
}: {
  projectStorage: ProjectStorage;
  name: string;
}) {
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
        <div
          className={cx("align-items-center", "d-flex", "flex-wrap", "gap-2")}
        >
          <span className="fw-bold" data-cy="data-connector-name">
            {name}
          </span>
        </div>
        <div>Size: {projectStorage.size} GB</div>
        <div>
          Mount point:{" "}
          <code>
            {projectStorage.mount_path && projectStorage.mount_path !== ""
              ? projectStorage.mount_path
              : PROJECT_STORAGE_DEFAULT_MOUNT_PATH}
          </code>
        </div>
      </div>
    </ListGroupItem>
  );
}

interface ProjectDataConnectorBoxHeaderProps {
  projectId: Project["id"];
  toggleOpen: () => void;
  accessibleDataConnectorsCount: number;
  inaccessibleDataConnectorsCount: number;
}

function ProjectDataConnectorBoxHeader({
  projectId,
  toggleOpen,
  accessibleDataConnectorsCount,
  inaccessibleDataConnectorsCount,
}: ProjectDataConnectorBoxHeaderProps) {
  const permissions = useProjectPermissions({ projectId });

  return (
    <CardHeader>
      <div
        className={cx(
          "align-items-center",
          "d-flex",
          "justify-content-between",
        )}
      >
        <div className={cx("align-items-center", "d-flex", "gap-2")}>
          <h2 className="mb-0">
            <Database className={cx("me-1", "bi")} />
            Data
          </h2>
          <Badge>{accessibleDataConnectorsCount}</Badge>
          {inaccessibleDataConnectorsCount > 0 && (
            <MissingDataConnectorsBadge
              inaccessibleConnectors={inaccessibleDataConnectorsCount}
            />
          )}
        </div>
        <div className="my-auto">
          <PermissionsGuard
            disabled={null}
            enabled={
              <Button
                data-cy="add-data-connector"
                color="outline-primary"
                onClick={toggleOpen}
                size="sm"
              >
                <PlusLg className="bi" />
              </Button>
            }
            requestedPermission="write"
            userPermissions={permissions}
          />
        </div>
      </div>
    </CardHeader>
  );
}

function DataConnectorLoadingBoxContent() {
  return (
    <Card data-cy="data-connector-box">
      <CardHeader>
        <div
          className={cx(
            "align-items-center",
            "d-flex",
            "justify-content-between",
          )}
        >
          <div className={cx("align-items-center", "d-flex")}>
            <h2 className={cx("mb-0", "me-2")}>
              <Database className={cx("me-1", "bi")} />
              Data
            </h2>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <Loader />
        <div>Retrieving data connectors...</div>
      </CardBody>
    </Card>
  );
}

interface DataConnectorLinkDisplayProps {
  dataConnectorLink: DataConnectorToProjectLink;
  projectPath: string;
}
function DataConnectorLinkDisplay({
  dataConnectorLink,
  projectPath,
}: DataConnectorLinkDisplayProps) {
  const { data_connector_id } = dataConnectorLink;
  const { data: dataConnector, isLoading } =
    useGetDataConnectorsByDataConnectorIdQuery({
      dataConnectorId: data_connector_id,
    });
  if (isLoading) {
    return <DataConnectorBoxListDisplayPlaceholder />;
  }
  if (!dataConnector) return null;
  return (
    <DataConnectorBoxListDisplay
      dataConnector={dataConnector}
      dataConnectorLink={dataConnectorLink}
      dataConnectorPotentiallyInaccessible={
        projectPath != dataConnector.namespace &&
        dataConnector.visibility == "private"
      }
    />
  );
}

interface MissingDataConnectorsBadgeProps {
  className?: string;
  inaccessibleConnectors: number;
}

function MissingDataConnectorsBadge({
  className,
  inaccessibleConnectors,
}: MissingDataConnectorsBadgeProps) {
  const ref = useRef<HTMLDivElement>(null);

  if (!inaccessibleConnectors) return null;
  const singular = inaccessibleConnectors === 1;
  return (
    <>
      <Badge
        className={cx("rounded-pill", className)}
        color="primary"
        innerRef={ref}
      >
        +{inaccessibleConnectors} hidden
      </Badge>
      <UncontrolledTooltip target={ref}>
        There {singular ? "is" : "are"} {inaccessibleConnectors} data connector
        {singular ? "" : "s"} linked to this project but not visible to you.
      </UncontrolledTooltip>
    </>
  );
}
