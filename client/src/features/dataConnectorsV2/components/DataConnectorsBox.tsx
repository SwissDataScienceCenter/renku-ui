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

import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import cx from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Database, PlusLg } from "react-bootstrap-icons";
import { useSearchParams } from "react-router";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ListGroup,
  ListGroupItem,
} from "reactstrap";

import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../components/Loader";
import Pagination from "../../../components/Pagination";
import useGroupPermissions from "../../groupsV2/utils/useGroupPermissions.hook";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import type { NamespaceKind } from "../../projectsV2/api/namespace.api";
import {
  useGetDataConnectorsQuery,
  type GetDataConnectorsApiResponse,
} from "../api/data-connectors.enhanced-api";
import DataConnectorModal from "./DataConnectorModal";
import DataConnectorBoxListDisplay, {
  DataConnectorBoxListDisplayPlaceholder,
} from "./DataConnectorsBoxListDisplay";

const DEFAULT_PER_PAGE = 12;
const DEFAULT_PAGE_PARAM = "page";

function AddButtonForGroupNamespace({
  namespace,
  toggleOpen,
}: Pick<DataConnectorBoxHeaderProps, "namespace" | "toggleOpen">) {
  const { permissions } = useGroupPermissions({ groupSlug: namespace });

  return (
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
  );
}

function AddButtonForUserNamespace({
  namespace,
  toggleOpen,
}: Pick<DataConnectorBoxHeaderProps, "namespace" | "toggleOpen">) {
  const { data: currentUser } = useGetUserQueryState();

  if (currentUser?.isLoggedIn && currentUser.username === namespace) {
    return (
      <Button
        data-cy="add-data-connector"
        color="outline-primary"
        onClick={toggleOpen}
        size="sm"
      >
        <PlusLg className="bi" />
      </Button>
    );
  }
  return null;
}

interface DataConnectorListDisplayProps {
  children?: React.ReactNode;
  limit?: number;
  namespace: string;
  namespaceKind: NamespaceKind;
  pageParam?: string;
  perPage?: number;
}

export default function DataConnectorsBox({
  children,
  limit,
  namespace: ns,
  namespaceKind,
  pageParam: pageParam_,
  perPage: perPage_,
}: DataConnectorListDisplayProps) {
  const pageParam = useMemo(
    () => (pageParam_ ? pageParam_ : DEFAULT_PAGE_PARAM),
    [pageParam_]
  );
  const perPage = useMemo(
    () => (limit ? limit : perPage_ ? perPage_ : DEFAULT_PER_PAGE),
    [limit, perPage_]
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const page = useMemo(() => {
    if (limit) return 1;
    const pageRaw = searchParams.get(pageParam);
    if (!pageRaw) {
      return 1;
    }
    try {
      const page = parseInt(pageRaw, 10);
      return page > 0 ? page : 1;
    } catch {
      return 1;
    }
  }, [limit, pageParam, searchParams]);

  const { data, error, isLoading } = useGetDataConnectorsQuery({
    params: {
      namespace: ns,
      page,
      per_page: perPage,
    },
  });

  useEffect(() => {
    if (data?.totalPages && page > data.totalPages) {
      setSearchParams(
        (prevParams) => {
          if (data.totalPages == 1) {
            prevParams.delete(pageParam);
          } else {
            prevParams.set(pageParam, `${data.totalPages}`);
          }
          return prevParams;
        },
        { replace: true }
      );
    }
  }, [data?.totalPages, page, pageParam, setSearchParams]);

  if (isLoading) return <DataConnectorLoadingBoxContent />;

  if (error || data == null) {
    return <RtkOrNotebooksError error={error} dismissible={false} />;
  }

  return (
    <DataConnectorBoxContent
      data={data}
      isLoading={isLoading}
      limit={limit}
      namespace={ns ?? ""}
      namespaceKind={namespaceKind}
      pageParam={pageParam}
      perPage={perPage}
    >
      {children}
    </DataConnectorBoxContent>
  );
}

interface DataConnectorBoxContentProps {
  children?: React.ReactNode;
  data: GetDataConnectorsApiResponse;
  isLoading: boolean;
  limit?: number;
  namespace: string;
  namespaceKind: NamespaceKind;
  pageParam: string;
  perPage: number;
}
function DataConnectorBoxContent({
  children,
  data,
  isLoading,
  limit,
  namespace,
  namespaceKind,
  pageParam,
  perPage,
}: DataConnectorBoxContentProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const toggleOpen = useCallback(() => {
    setModalOpen((open) => !open);
  }, []);
  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <Card className="h-100" data-cy="data-connector-box">
        <DataConnectorBoxHeader
          toggleOpen={toggleOpen}
          namespace={namespace}
          namespaceKind={namespaceKind}
          totalConnectors={data.total}
        />
        <CardBody>
          {data.total === 0 && namespaceKind === "group" && (
            <AddEmptyListForGroupNamespace namespace={namespace} />
          )}
          {data.total === 0 && namespaceKind === "user" && (
            <AddEmptyListForUserNamespace namespace={namespace} />
          )}
          {data.total > 0 && (
            <ListGroup flush>
              {data.dataConnectors?.map((dc) =>
                isLoading ? (
                  <DataConnectorBoxListDisplayPlaceholder key={dc.id} />
                ) : (
                  <DataConnectorBoxListDisplay
                    key={dc.id}
                    dataConnector={dc}
                    extendedPreview={true}
                  />
                )
              )}
              {limit && data.total > limit && (
                <ListGroupItem className="fst-italic">
                  And {data.total - data.dataConnectors.length} more...
                </ListGroupItem>
              )}
            </ListGroup>
          )}
          {!limit && (
            <Pagination
              className="mt-3"
              currentPage={data.page}
              pageQueryParam={pageParam}
              perPage={perPage}
              totalItems={data.total}
            />
          )}
          {children}
        </CardBody>
      </Card>
      <DataConnectorModal
        isOpen={isModalOpen}
        namespace={namespace}
        toggle={toggleOpen}
      />
    </div>
  );
}

interface DataConnectorBoxHeaderProps {
  toggleOpen: () => void;
  namespace: string;
  namespaceKind: NamespaceKind;
  totalConnectors: number;
}

function DataConnectorBoxHeader({
  toggleOpen,
  namespace,
  namespaceKind,
  totalConnectors,
}: DataConnectorBoxHeaderProps) {
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
          <h2 className={cx("mb-0", "me-2")}>
            <Database className={cx("me-1", "bi")} />
            Data
          </h2>
          <Badge>{totalConnectors}</Badge>
        </div>
        <div className="my-auto">
          {namespaceKind === "group" ? (
            <AddButtonForGroupNamespace
              namespace={namespace}
              toggleOpen={toggleOpen}
            />
          ) : (
            <AddButtonForUserNamespace
              namespace={namespace}
              toggleOpen={toggleOpen}
            />
          )}
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

function AddEmptyListForGroupNamespace({ namespace }: { namespace: string }) {
  const { permissions } = useGroupPermissions({ groupSlug: namespace });

  return (
    <PermissionsGuard
      disabled={<p>This group has no visible data connectors.</p>}
      enabled={
        <p className="text-body-secondary">
          Add published datasets from data repositories, and connect to cloud
          storage to read and write custom data.
        </p>
      }
      requestedPermission="write"
      userPermissions={permissions}
    />
  );
}

function AddEmptyListForUserNamespace({ namespace }: { namespace: string }) {
  const { data: currentUser } = useGetUserQueryState();

  if (currentUser?.isLoggedIn && currentUser.username === namespace) {
    return (
      <p className="text-body-secondary">
        Add published datasets from data repositories, and connect to cloud
        storage to read and write custom data.
      </p>
    );
  }
  return <p>This user has no visible data connectors.</p>;
}
