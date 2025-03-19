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
import { ReactNode, useMemo } from "react";
import { Badge, Col, ListGroupItem, Row } from "reactstrap";

import { skipToken } from "@reduxjs/toolkit/query";
import { Database, NodePlus } from "react-bootstrap-icons";
import { generatePath, Link } from "react-router";
import { Loader } from "../../components/Loader";
import { TimeCaption } from "../../components/TimeCaption";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import {
  useGetDataConnectorsByDataConnectorIdQuery,
  useGetDataConnectorsByDataConnectorIdSecretsQuery,
} from "../dataConnectorsV2/api/data-connectors.enhanced-api";
import { useGetNamespacesByNamespaceSlugQuery } from "../projectsV2/api/projectV2.enhanced-api";
import { type SecretWithId } from "../usersV2/api/users.api";
import UserAvatar from "../usersV2/show/UserAvatar";
import SecretItemActions from "./SecretItemActions";

interface DataConnectorSecretItemProps {
  secret: SecretWithId;
}

export default function DataConnectorSecretItem({
  secret,
}: DataConnectorSecretItemProps) {
  const { name, modification_date, data_connector_ids } = secret;

  const isOrphanSecret = data_connector_ids.length == 0;

  return (
    <ListGroupItem action>
      <Row>
        <Col>
          <div className={cx("align-items-center", "d-flex", "mb-2")}>
            <span className={cx("fw-bold", "me-2")}>{name}</span>
            {isOrphanSecret && <Badge color="danger">Orphan Secret</Badge>}
          </div>
          {isOrphanSecret && (
            <p className={cx("mb-0", "fst-italic")}>
              This secret was used as a credential for a data connector which
              has been deleted.
            </p>
          )}
          <DataConnectorSecretUsedFor secret={secret} />
        </Col>
        <Col
          xs={12}
          sm="auto"
          className={cx(
            "ms-auto",
            "d-flex",
            "flex-column",
            "align-items-end",
            "gap-1"
          )}
        >
          <SecretItemActions isV2 secret={secret} />
          <div className={cx("text-light-emphasis", "small")}>
            Edited{" "}
            <TimeCaption datetime={modification_date} enableTooltip noCaption />
          </div>
        </Col>
      </Row>
    </ListGroupItem>
  );
}

interface DataConnectorSecretUsedForProps {
  secret: SecretWithId;
}

function DataConnectorSecretUsedFor({
  secret,
}: DataConnectorSecretUsedForProps) {
  const { data_connector_ids: dataConnectorIds } = secret;

  if (dataConnectorIds.length == 0) {
    return null;
  }

  const dataConnectorsStr =
    dataConnectorIds.length > 1 ? "data connectors" : "data connector";

  return (
    <div>
      <p className={cx("mb-1", "fw-medium")}>
        <NodePlus className={cx("bi", "me-1")} />
        This secret is used in <Badge>{dataConnectorIds.length}</Badge>{" "}
        {dataConnectorsStr}
      </p>
      <ul className={cx("list-unstyled", "d-flex", "flex-column", "gap-2")}>
        {dataConnectorIds.map((dataConnectorId) => (
          <DataConnectorSecretUsedForItem
            key={dataConnectorId}
            dataConnectorId={dataConnectorId}
            secret={secret}
          />
        ))}
      </ul>
    </div>
  );
}

interface DataConnectorSecretUsedForItemProps {
  dataConnectorId: string;
  secret: SecretWithId;
}

function DataConnectorSecretUsedForItem({
  dataConnectorId,
  secret,
}: DataConnectorSecretUsedForItemProps) {
  const {
    data: dataConnector,
    isLoading: isLoadingDataConnector,
    error: dataConnectorError,
  } = useGetDataConnectorsByDataConnectorIdQuery({ dataConnectorId });
  const {
    data: dataConnectorSecrets,
    isLoading: isLoadingSecrets,
    error: secretsError,
  } = useGetDataConnectorsByDataConnectorIdSecretsQuery({ dataConnectorId });
  const {
    data: namespace,
    isLoading: isLoadingNamespace,
    error: namespaceError,
  } = useGetNamespacesByNamespaceSlugQuery(
    dataConnector ? { namespaceSlug: dataConnector.namespace } : skipToken
  );

  const isLoading =
    isLoadingDataConnector || isLoadingSecrets || isLoadingNamespace;
  const error = dataConnectorError ?? secretsError ?? namespaceError;

  const dcSecret = useMemo(
    () =>
      dataConnectorSecrets?.find(({ secret_id }) => secret_id === secret.id),
    [dataConnectorSecrets, secret.id]
  );

  const namespaceName = useMemo(
    () => namespace?.name ?? dataConnector?.namespace,
    [dataConnector?.namespace, namespace?.name]
  );

  const namespaceUrl = useMemo(
    () =>
      dataConnector && namespace?.namespace_kind === "group"
        ? generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
            slug: dataConnector.namespace,
          })
        : dataConnector && namespace?.namespace_kind === "user"
        ? generatePath(ABSOLUTE_ROUTES.v2.users.show, {
            username: dataConnector.namespace,
          })
        : undefined,
    [dataConnector, namespace?.namespace_kind]
  );
  const dcHash = dataConnector ? `data-connector-${dataConnector.id}` : "";

  const LinkTag =
    namespaceUrl && dcHash
      ? ({
          className,
          children,
        }: {
          className?: string;
          children: ReactNode;
        }) => (
          <Link
            className={className}
            to={{ pathname: namespaceUrl, hash: dcHash }}
          >
            {children}
          </Link>
        )
      : "span";

  if (isLoading) {
    return (
      <li>
        <Loader className="me-1" inline size={16} />
        Loading data connector...
      </li>
    );
  }

  if (error || !dataConnector) {
    return (
      <li>
        <p>
          Error: could not load data connector <code>{dataConnectorId}</code>.
        </p>
        {error && <RtkOrNotebooksError error={error} dismissible={false} />}
      </li>
    );
  }

  return (
    <li className={cx("d-flex", "flex-row")}>
      <div>
        <Database className={cx("bi", "me-1")} />
      </div>
      <div>
        <div className={cx("d-flex", "flex-row", "gap-4")}>
          <LinkTag className={cx("fw-bold")}>{dataConnector.name}</LinkTag>
          <div
            className={cx("d-flex", "flex-row", "align-items-center", "gap-1")}
          >
            <UserAvatar namespace={dataConnector.namespace} />
            <span>{namespaceName}</span>
          </div>
        </div>
        <div>
          {dcSecret ? (
            <>
              Field: <span className="fw-bold">{dcSecret.name}</span>
            </>
          ) : (
            <span className="fst-italic">
              Error: could not find the corresponding field.
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
