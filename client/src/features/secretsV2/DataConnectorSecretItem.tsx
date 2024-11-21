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
import { Fragment, ReactNode, useMemo } from "react";
import { Badge, Col, ListGroupItem, Row } from "reactstrap";

import { skipToken } from "@reduxjs/toolkit/query";
import { generatePath, Link } from "react-router-dom-v5-compat";
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
          <div className={cx("align-items-center", "d-flex")}>
            <span className={cx("fw-bold", "me-2")}>{name}</span>
            {isOrphanSecret && <Badge color="danger">Orphan Secret</Badge>}
          </div>
          <div className={cx("text-light-emphasis", "small")}>
            Edited{" "}
            <TimeCaption datetime={modification_date} enableTooltip noCaption />
          </div>
          <DataConnectorSecretUsedFor secret={secret} />
        </Col>
        <SecretItemActions secret={secret} />
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

  return (
    <div>
      <p className={cx("mb-0", "fw-medium")}>Used for:</p>
      <ul>
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
      ? ({ children }: { children: ReactNode }) => (
          <Link to={{ pathname: namespaceUrl, hash: dcHash }}>{children}</Link>
        )
      : Fragment;

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
    <li>
      <div>
        <LinkTag>
          {dataConnector.name}
          {" - "}
          <span className="fst-italic">
            {"@"}
            {dataConnector.namespace}/{dataConnector.slug}
          </span>
        </LinkTag>
      </div>
      <div>
        {dcSecret ? (
          <>
            Field: <code>{dcSecret.name}</code>
          </>
        ) : (
          <span className="fst-italic">
            Error: could not find the corresponding field.
          </span>
        )}
      </div>
    </li>
  );
}
