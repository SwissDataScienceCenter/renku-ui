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

import { useGetDataConnectorsByDataConnectorIdQuery } from "../../../dataConnectorsV2/api/data-connectors.api";
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

  if (isLoading) return <DataConnectorLoadingBoxContent />;

  if (error || data == null) {
    return <RtkOrNotebooksError error={error} dismissible={false} />;
  }

  return <ProjectDataConnectorBoxContent data={data} project={project} />;
}

interface ProjectDataConnectorBoxContentProps
  extends DataConnectorListDisplayProps {
  data: GetProjectsByProjectIdDataConnectorLinksApiResponse;
}
function ProjectDataConnectorBoxContent({
  data,
  project,
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
          totalConnectors={data.length}
        />
        <CardBody>
          {data.length === 0 && (
            <p className="m-0">
              Add published datasets from data repositories, and connect to
              cloud storage to read and write custom data.
            </p>
          )}
          {data != null && data.length > 0 && (
            <ListGroup flush>
              {data.map((dc) => (
                <DataConnectorLinkDisplay key={dc.id} dataConnectorLink={dc} />
              ))}
            </ListGroup>
          )}
        </CardBody>
      </Card>
      <ProjectConnectDataConnectorsModal
        isOpen={isModalOpen}
        namespace={project.namespace}
        project={project}
        toggle={toggleOpen}
      />
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
                <PlusLg className="icon-text" />
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
}
function DataConnectorLinkDisplay({
  dataConnectorLink,
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
    />
  );
}
