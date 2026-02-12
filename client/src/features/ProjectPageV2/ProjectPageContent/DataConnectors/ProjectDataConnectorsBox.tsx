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

import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useRef, useState } from "react";
import { Database, Gear, PlusLg } from "react-bootstrap-icons";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ListGroup,
  UncontrolledTooltip,
} from "reactstrap";

import {
  DataConnectorToProjectLink,
  DepositList,
  GetProjectsByProjectIdDataConnectorLinksApiResponse,
} from "~/features/dataConnectorsV2/api/data-connectors.api";
import {
  useGetDataConnectorsByDataConnectorIdQuery,
  useGetDepositQuery,
  useGetProjectsByProjectIdDataConnectorLinksQuery,
  useGetProjectsByProjectIdInaccessibleDataConnectorLinksQuery,
} from "~/features/dataConnectorsV2/api/data-connectors.enhanced-api";
import DepositListItem from "~/features/dataConnectorsV2/deposit/DepositListItem";
import { ErrorAlert } from "../../../../components/Alert";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import DataConnectorBoxListDisplay, {
  DataConnectorBoxListDisplayPlaceholder,
} from "../../../dataConnectorsV2/components/DataConnectorsBoxListDisplay";
import PermissionsGuard from "../../../permissionsV2/PermissionsGuard";
import type { Project } from "../../../projectsV2/api/projectV2.api";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";
import ProjectConnectDataConnectorsModal from "./ProjectConnectDataConnectorsModal";

interface DataConnectorListDisplayProps {
  project: Project;
}

export default function ProjectDataConnectorsBox({
  project,
}: DataConnectorListDisplayProps) {
  const {
    data: projectDataConnectors,
    error: errorProjectDataConnectors,
    isLoading: isLoadingProjectDataConnectors,
  } = useGetProjectsByProjectIdDataConnectorLinksQuery({
    projectId: project.id,
  });

  const {
    data: deposits,
    error: errorDeposits,
    isLoading: isLoadingDeposits,
    refetch: refetchDeposits,
  } = useGetDepositQuery();

  const {
    data: inaccessibleDataConnectors,
    isLoading: isLoadingInaccessibleDataConnectors,
  } = useGetProjectsByProjectIdInaccessibleDataConnectorLinksQuery({
    projectId: project.id,
  });

  if (
    isLoadingProjectDataConnectors ||
    isLoadingDeposits ||
    isLoadingInaccessibleDataConnectors
  )
    return <DataConnectorLoadingBoxContent />;

  if (errorProjectDataConnectors) {
    return (
      <RtkOrNotebooksError
        error={errorProjectDataConnectors}
        dismissible={false}
      />
    );
  }

  if (projectDataConnectors == null) {
    return (
      <ErrorAlert>
        Data connectors could not be loaded from the API, please contact a Renku
        administrator.
      </ErrorAlert>
    );
  }

  return (
    <ProjectDataConnectorBoxContent
      dataConnectors={projectDataConnectors}
      deposits={deposits}
      depositsError={errorDeposits}
      depositsRefetch={refetchDeposits}
      project={project}
      inaccessibleDataConnectorsCount={inaccessibleDataConnectors?.count || 0}
    />
  );
}

interface ProjectDataConnectorBoxContentProps
  extends DataConnectorListDisplayProps {
  dataConnectors: GetProjectsByProjectIdDataConnectorLinksApiResponse;
  deposits?: DepositList;
  depositsError?: FetchBaseQueryError | SerializedError;
  depositsRefetch: () => void;
  inaccessibleDataConnectorsCount: number;
}
function ProjectDataConnectorBoxContent({
  dataConnectors,
  deposits,
  // ! TODO: depositsError,
  // ! TODO: depositsRefetch,
  project,
  inaccessibleDataConnectorsCount,
}: ProjectDataConnectorBoxContentProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const toggleOpen = useCallback(() => {
    setModalOpen((open) => !open);
  }, []);

  // ! TEMP
  const deposits2 = [
    {
      name: "Mock deposit",
      provider: "zenodo",
      data_connector_id: "mock-data-connector-id",
      path: "/some/path",
      id: "mock-deposit-id",
      status: "complete",
      external_url: "https://zenodo.org/deposit/1234567",
    },
  ] as DepositList;

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <Card className="h-100" data-cy="data-connector-box">
        <ProjectDataConnectorBoxHeader
          projectId={project.id}
          toggleOpen={toggleOpen}
          accessibleDataConnectorsCount={dataConnectors.length}
          inaccessibleDataConnectorsCount={inaccessibleDataConnectorsCount}
        />
        <CardBody>
          {dataConnectors.length === 0 && (
            <p className={cx("m-0", "text-body-secondary")}>
              Add published datasets from data repositories, and connect to
              cloud storage to read and write custom data.
            </p>
          )}
          {dataConnectors != null && dataConnectors.length > 0 && (
            <ListGroup flush>
              {dataConnectors.map((dc) => (
                <DataConnectorLinkDisplay
                  key={dc.id}
                  dataConnectorLink={dc}
                  projectPath={`${project.namespace}/${project.slug}`}
                />
              ))}
            </ListGroup>
          )}
        </CardBody>
        <CardBody className="border-top">
          {(deposits ?? deposits2) && (deposits ?? deposits2).length > 0 && (
            <div>
              <h3 className="fw-semibold">
                <Gear className={cx("bi", "me-1")} />
                Dataset export jobs
              </h3>
              <p className="text-body-secondary">
                Dataset creation can be kickstarted from data connectors. They
                need to be finalized manually on the target platform.
              </p>
              <ListGroup data-cy="deposit-list" flush>
                {(deposits ?? deposits2).map((deposit) => (
                  <DepositListItem deposit={deposit} key={deposit.id} />
                ))}
              </ListGroup>

              {/* <p>Here</p> */}
            </div>
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
          "justify-content-between"
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
            "justify-content-between"
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
