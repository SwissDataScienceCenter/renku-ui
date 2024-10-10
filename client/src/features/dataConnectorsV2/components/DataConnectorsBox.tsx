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
import { useCallback, useEffect, useMemo, useState } from "react";
import { Database, PlusLg } from "react-bootstrap-icons";
import { useSearchParams } from "react-router-dom-v5-compat";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ListGroup,
} from "reactstrap";

import { Loader } from "../../../components/Loader";
import Pagination from "../../../components/Pagination";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import MembershipGuard from "../../ProjectPageV2/utils/MembershipGuard";
import type { NamespaceKind } from "../../projectsV2/api/namespace.api";
import { useGetGroupsByGroupSlugMembersQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import {
  useGetDataConnectorsQuery,
  type GetDataConnectorsApiResponse,
} from "../api/data-connectors.enhanced-api";
import { useGetUserQuery } from "../../user/dataServicesUser.api";

import DataConnectorBoxListDisplay from "./DataConnectorsBoxListDisplay";
import DataConnectorModal from "./DataConnectorModal";

const DEFAULT_PER_PAGE = 12;
const DEFAULT_PAGE_PARAM = "page";

function AddButtonForGroupNamespace({
  namespace,
  toggleOpen,
}: Pick<DataConnectorBoxHeaderProps, "namespace" | "toggleOpen">) {
  const { data: members } = useGetGroupsByGroupSlugMembersQuery({
    groupSlug: namespace,
  });
  return (
    <MembershipGuard
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
      members={members}
      minimumRole="editor"
    />
  );
}

function AddButtonForUserNamespace({
  namespace,
  toggleOpen,
}: Pick<DataConnectorBoxHeaderProps, "namespace" | "toggleOpen">) {
  const { data: currentUser } = useGetUserQuery();

  if (currentUser?.username === namespace) {
    return (
      <Button
        data-cy="add-data-connector"
        color="outline-primary"
        onClick={toggleOpen}
        size="sm"
      >
        <PlusLg className="icon-text" />
      </Button>
    );
  }
  return null;
}

interface DataConnectorListDisplayProps {
  namespace: string;
  namespaceKind: NamespaceKind;
  pageParam?: string;
  perPage?: number;
}

export default function DataConnectorsBox({
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
    () => (perPage_ ? perPage_ : DEFAULT_PER_PAGE),
    [perPage_]
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const onPageChange = useCallback(
    (pageNumber: number) => {
      setSearchParams((prevParams) => {
        if (pageNumber == 1) {
          prevParams.delete(pageParam);
        } else {
          prevParams.set(pageParam, `${pageNumber}`);
        }
        return prevParams;
      });
    },
    [pageParam, setSearchParams]
  );

  const page = useMemo(() => {
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
  }, [pageParam, searchParams]);

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
      namespace={ns ?? ""}
      namespaceKind={namespaceKind}
      onPageChange={onPageChange}
      perPage={perPage}
    />
  );
}

interface DataConnectorBoxContentProps {
  data: GetDataConnectorsApiResponse;
  namespace: string;
  namespaceKind: NamespaceKind;
  onPageChange: (pageNumber: number) => void;
  perPage: number;
}
function DataConnectorBoxContent({
  data,
  namespace,
  namespaceKind,
  onPageChange,
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
          {data.total === 0 && (
            <p className="m-0">
              Add published datasets from data repositories, and connect to
              cloud storage to read and write custom data.
            </p>
          )}
          <ListGroup flush>
            {data.dataConnectors?.map((dc) => (
              <DataConnectorBoxListDisplay key={dc.id} dataConnector={dc} />
            ))}
          </ListGroup>
          <Pagination
            currentPage={data.page}
            perPage={perPage}
            totalItems={data.total}
            onPageChange={onPageChange}
            className={cx(
              "d-flex",
              "justify-content-center",
              "rk-search-pagination"
            )}
          />
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
          <h4 className={cx("mb-0", "me-2")}>
            <Database className={cx("me-1", "bi")} />
            Data
          </h4>
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
