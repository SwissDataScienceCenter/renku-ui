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
import { Database, PlusLg } from "react-bootstrap-icons";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ListGroup,
} from "reactstrap";

import { Loader } from "../../../../components/Loader";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";

import {
  useGetDataConnectorsByDataConnectorIdQuery,
  useGetProjectsByProjectIdInaccessibleDataConnectorLinksQuery,
} from "../../../dataConnectorsV2/api/data-connectors.api";
import DataConnectorBoxListDisplay from "../../../dataConnectorsV2/components/DataConnectorsBoxListDisplay";
import PermissionsGuard from "../../../permissionsV2/PermissionsGuard";
import type {
  DataConnectorToProjectLink,
  GetProjectsByProjectIdDataConnectorLinksApiResponse,
  Project,
} from "../../../projectsV2/api/projectV2.api";
import { useGetProjectsByProjectIdDataConnectorLinksQuery } from "../../../projectsV2/api/projectV2.enhanced-api";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";

import ProjectConnectDataConnectorsModal from "./ProjectConnectDataConnectorsModal";
import { InfoAlert } from "../../../../components/Alert";

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
    data: dataGetInaccessible,
    error: errorGetInaccessible,
    isLoading: isLoadingGetInaccessible,
  } = useGetProjectsByProjectIdInaccessibleDataConnectorLinksQuery({
    projectId: project.id,
  });

  if (isLoading || isLoadingGetInaccessible)
    return <DataConnectorLoadingBoxContent />;

  if (error || data == null) {
    return <RtkOrNotebooksError error={error} dismissible={false} />;
  }

  if (errorGetInaccessible || dataGetInaccessible == null) {
    return (
      <RtkOrNotebooksError error={errorGetInaccessible} dismissible={false} />
    );
  }

  return (
    <ProjectDataConnectorBoxContent
      data={data}
      project={project}
      inaccessibleDataConnectors={dataGetInaccessible?.count}
    />
  );
}

interface ProjectDataConnectorBoxContentProps
  extends DataConnectorListDisplayProps {
  data: GetProjectsByProjectIdDataConnectorLinksApiResponse;
  inaccessibleDataConnectors?: number;
}
function ProjectDataConnectorBoxContent({
  data,
  project,
  inaccessibleDataConnectors,
}: ProjectDataConnectorBoxContentProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const toggleOpen = useCallback(() => {
    setModalOpen((open) => !open);
  }, []);
  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <Card className="h-100" data-cy="data-connector-box">
        <ProjectDataConnectorBoxHeader
          projectId={project.id}
          toggleOpen={toggleOpen}
          totalConnectors={data.length + (inaccessibleDataConnectors || 0)}
        />
        <CardBody>
          {data.length === 0 && (
            <p className={cx("m-0", "text-body-secondary")}>
              Add published datasets from data repositories, and connect to
              cloud storage to read and write custom data.
            </p>
          )}
          {inaccessibleDataConnectors != null &&
            inaccessibleDataConnectors > 0 && (
              <InfoAlert timeout={0} dismissible={false} className={cx("mb-3")}>
                <p className="mb-0">
                  You are missing access to {inaccessibleDataConnectors} data
                  connector(s) in this project.
                </p>
              </InfoAlert>
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

interface ProjectDataConnectorBoxHeaderProps {
  projectId: Project["id"];
  toggleOpen: () => void;
  totalConnectors: number;
}

function ProjectDataConnectorBoxHeader({
  projectId,
  toggleOpen,
  totalConnectors,
}: ProjectDataConnectorBoxHeaderProps) {
  const permissions = useProjectPermissions({ projectId });

  return (
    <CardHeader>
      <div
        className={cx(
          "align-items-center",
          "d-flex",
          "justify-content-between"
        )}
      >
        <div className={cx("align-items-center", "d-flex")}>
          <h4 className={cx("mb-0", "me-2")}>
            <Database className={cx("me-1", "bi")} />
            Data
          </h4>
          <Badge>{totalConnectors}</Badge>
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
            "justify-content-between"
          )}
        >
          <div className={cx("align-items-center", "d-flex")}>
            <h4 className={cx("mb-0", "me-2")}>
              <Database className={cx("me-1", "bi")} />
              Data
            </h4>
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
  if (isLoading) return <Loader size={16} inline />;
  if (!dataConnector) return null;
  return (
    <DataConnectorBoxListDisplay
      dataConnector={dataConnector}
      dataConnectorLink={dataConnectorLink}
      warning={
        projectPath != dataConnector.namespace &&
        dataConnector.visibility == "private"
          ? "Some members of this project may not be able to access this data connector"
          : undefined
      }
    />
  );
}
