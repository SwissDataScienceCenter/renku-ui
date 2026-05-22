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
import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowsFullscreen, CloudArrowUp, XLg } from "react-bootstrap-icons";
import { generatePath, Link } from "react-router";
import {
  Card,
  CardBody,
  CardHeader,
  Offcanvas,
  OffcanvasBody,
  UncontrolledTooltip,
} from "reactstrap";

import ExternalLink from "~/components/ExternalLink";
import { TimeCaption } from "~/components/TimeCaption";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import type {
  DataConnectorRead,
  DataConnectorToProjectLink,
  Deposit,
} from "../api/data-connectors.api";
import DepositActions from "../deposits/DepositActions";
import DepositStatusBadge from "../deposits/DepositStatusBadge";
import useDataConnectorPermissions from "../utils/useDataConnectorPermissions.hook";
import { getDataConnectorScope } from "./dataConnector.utils";
import DataConnectorActions from "./DataConnectorActions";
import DataConnectorCredentialsBox from "./DataConnectorCredentialsBox";
import DataConnectorInfoBox from "./DataConnectorInfoBox";
import { DataConnectorIntegrationBox } from "./DataConnectorIntegrationBox";
import DataConnectorModal from "./DataConnectorModal";
import DataConnectorProjectsBox from "./DataConnectorProjectsBox";

interface DataConnectorPropertyProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
}

function DataConnectorPropertyValue({
  title,
  children,
}: DataConnectorPropertyProps) {
  return (
    <>
      <div className="fw-semibold">{title}</div>
      <div className="mb-3">{children}</div>
    </>
  );
}

interface DataConnectorViewProps {
  dataConnector: DataConnectorRead;
  dataConnectorLink?: DataConnectorToProjectLink;
  lastDeposit?: Deposit;
  showView: boolean;
  toggleView: () => void;
  toggleEdit: (initialStep?: number) => void;
  dataConnectorPotentiallyInaccessible?: boolean;
}
export default function DataConnectorView({
  dataConnector,
  dataConnectorLink,
  lastDeposit,
  showView,
  toggleView,
  dataConnectorPotentiallyInaccessible = false,
}: Omit<DataConnectorViewProps, "toggleEdit">) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [initialStep, setInitialStep] = useState(2);

  const toggleEdit = useCallback((initialStep?: number) => {
    if (initialStep) setInitialStep(initialStep);
    setIsEditOpen((open) => !open);
  }, []);

  const scope = useMemo(
    () => getDataConnectorScope(dataConnector.namespace),
    [dataConnector.namespace],
  );

  const namespaceParts = dataConnector.namespace?.split("/") ?? [];
  const dataConnectorStandaloneLink = generatePath(
    ABSOLUTE_ROUTES.v2.dataConnectors.show.root,
    {
      projectNamespace: namespaceParts[0] ?? null,
      dataConnectorNamespace: namespaceParts[1] ?? null,
      slug: dataConnector.slug,
    },
  );

  const refClose = useRef(null);
  const refExpand = useRef(null);

  return (
    <Offcanvas
      toggle={toggleView}
      isOpen={showView}
      direction="end"
      backdrop={true}
    >
      <OffcanvasBody data-cy="data-connector-view">
        <div className={cx("align-items-center", "d-flex", "gap-2", "mb-3")}>
          <button
            aria-label="Close"
            className={cx(
              "border-0",
              "btn",
              "d-flex",
              "fs-2",
              "link-secondary",
              "p-0",
              "shadow-none",
            )}
            data-cy="data-connector-view-back-button"
            data-bs-dismiss="offcanvas"
            ref={refClose}
            onClick={toggleView}
          >
            <XLg />
            <span className="visually-hidden">Close side panel</span>
          </button>
          <UncontrolledTooltip target={refClose}>
            Close side panel
          </UncontrolledTooltip>
          <Link
            className={cx("d-flex", "fs-3", "link-secondary")}
            data-cy="data-connector-standalone-page-link"
            ref={refExpand}
            to={dataConnectorStandaloneLink}
          >
            <ArrowsFullscreen />
            <span className="visually-hidden">Open full page</span>
          </Link>
          <UncontrolledTooltip target={refExpand}>
            Open full page
          </UncontrolledTooltip>
        </div>

        <DataConnectorViewHeader
          {...{ dataConnector, dataConnectorLink, toggleView, toggleEdit }}
        />

        <div className={cx("d-flex", "flex-column", "gap-3")}>
          <DataConnectorInfoBox
            dataConnector={dataConnector}
            headerTag="h3"
            visibilityWarning={dataConnectorPotentiallyInaccessible}
          />

          <DataConnectorIntegrationBox
            dataConnector={dataConnector}
            headerTag="h3"
          />

          <DataConnectorCredentialsBox
            dataConnector={dataConnector}
            headerTag="h3"
          />

          {scope !== "global" && (
            <>
              {lastDeposit && (
                <DataConnectorLastDeposit
                  dataConnector={dataConnector}
                  deposit={lastDeposit}
                />
              )}
            </>
          )}

          <DataConnectorProjectsBox
            dataConnector={dataConnector}
            headerTag="h3"
          />
        </div>
      </OffcanvasBody>
      <DataConnectorModal
        dataConnector={dataConnector}
        isOpen={isEditOpen}
        namespace={dataConnector.namespace}
        toggle={toggleEdit}
        initialStep={initialStep}
      />
    </Offcanvas>
  );
}

export function DataConnectorLastDepositBody({
  deposit,
}: DataConnectorLastDepositProps) {
  return (
    <>
      <DataConnectorPropertyValue key="name" title="Name">
        {deposit.name}
      </DataConnectorPropertyValue>
      <DataConnectorPropertyValue key="provider" title="Provider">
        {deposit.provider}
      </DataConnectorPropertyValue>
      {deposit.external_url && (
        <DataConnectorPropertyValue key="external_url" title="URL">
          <ExternalLink href={deposit.external_url}>
            {deposit.external_url}
          </ExternalLink>
        </DataConnectorPropertyValue>
      )}
      <DataConnectorPropertyValue key="status" title="Status">
        <DepositStatusBadge status={deposit.status} />
      </DataConnectorPropertyValue>
      <DataConnectorPropertyValue key="path" title="Path">
        {deposit.path ?? <span className="fst-italic">N/A</span>}
      </DataConnectorPropertyValue>
      {deposit.creation_date && (
        <DataConnectorPropertyValue key="creation_date" title="Created">
          <TimeCaption
            datetime={deposit.creation_date}
            enableTooltip
            noCaption
            prefix=""
          />
        </DataConnectorPropertyValue>
      )}
      {deposit.updated_at && deposit.updated_at !== deposit.creation_date && (
        <DataConnectorPropertyValue key="updated_at" title="Last updated">
          <TimeCaption
            datetime={deposit.updated_at}
            enableTooltip
            noCaption
            prefix=""
          />
        </DataConnectorPropertyValue>
      )}
    </>
  );
}

interface DataConnectorLastDepositProps {
  dataConnector?: DataConnectorRead | null;
  deposit: Deposit;
}
export function DataConnectorLastDeposit({
  dataConnector,
  deposit,
}: DataConnectorLastDepositProps) {
  const { permissions } = useDataConnectorPermissions({
    dataConnectorId: dataConnector?.id,
  });

  return (
    <Card data-cy="data-connector-deposits">
      <CardHeader
        className={cx(
          "align-items-center",
          "d-flex",
          "justify-content-between",
        )}
      >
        <h3 className="mb-0">
          <CloudArrowUp className="me-1" />
          Data export
        </h3>
        <PermissionsGuard
          disabled={null}
          enabled={<DepositActions deposit={deposit} />}
          requestedPermission="write"
          userPermissions={permissions}
        />
      </CardHeader>
      <CardBody>
        <DataConnectorLastDepositBody deposit={deposit} />
      </CardBody>
    </Card>
  );
}

function DataConnectorViewHeader({
  dataConnector,
  dataConnectorLink,
  toggleView,
  toggleEdit,
}: Omit<DataConnectorViewProps, "showView">) {
  return (
    <div className="mb-3">
      <span className={cx("small", "text-muted", "me-3")}>Data connector</span>
      <div>
        <div className={cx("float-end", "mt-1", "ms-1")}>
          <DataConnectorActions
            dataConnector={dataConnector}
            dataConnectorLink={dataConnectorLink}
            toggleView={toggleView}
            toggleEdit={toggleEdit}
          />
        </div>
        <h2 className={cx("m-0", "text-break")} data-cy="data-connector-title">
          {dataConnector.name}
        </h2>
      </div>
    </div>
  );
}
