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

import { Link } from "react-router";
import cx from "classnames";
import { useCallback, useEffect, useMemo } from "react";
import { Folder, PlusLg } from "react-bootstrap-icons";
import { useSearchParams } from "react-router";
import { Badge, Card, CardBody, CardHeader, ListGroup } from "reactstrap";

import { Loader } from "../../../components/Loader";
import Pagination from "../../../components/Pagination";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import useGroupPermissions from "../../groupsV2/utils/useGroupPermissions.hook";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import { useGetUserQuery } from "../../usersV2/api/users.api";
import { NamespaceKind } from "../api/namespace.api";
import { useGetProjectsQuery } from "../api/projectV2.enhanced-api";
import ProjectShortHandDisplay from "../show/ProjectShortHandDisplay";

const DEFAULT_PER_PAGE = 5;
const DEFAULT_PAGE_PARAM = "page";

interface ProjectListDisplayProps {
  namespace?: string;
  pageParam?: string;
  perPage?: number;
  namespaceKind: NamespaceKind;
}

export default function ProjectListDisplay({
  namespace: ns,
  pageParam: pageParam_,
  perPage: perPage_,
  namespaceKind,
}: ProjectListDisplayProps) {
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

  const { data, error, isLoading } = useGetProjectsQuery({
    params: {
      namespace: ns,
      page: page,
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

  if (error || data == null) {
    return <RtkOrNotebooksError error={error} dismissible={false} />;
  }

  const emptyListElement =
    namespaceKind === "group" ? (
      <AddEmptyListForGroupNamespace namespace={ns ?? ""} />
    ) : (
      <AddEmptyListForUserNamespace namespace={ns ?? ""} />
    );

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <Card className="h-100" data-cy="project-box">
        <ProjectBoxHeader
          totalProjects={data.total ?? 0}
          namespaceKind={namespaceKind}
          namespace={ns ?? ""}
        />
        <CardBody>
          {isLoading && (
            <div className={cx("d-flex", "justify-content-center", "w-100")}>
              <div className={cx("d-flex", "flex-column")}>
                <Loader />
                <div>Retrieving projects...</div>
              </div>
            </div>
          )}
          {!data.total && emptyListElement}
          {data.projects.length > 0 && (
            <>
              <div className={cx("d-flex", "flex-column", "gap-3")}>
                <ListGroup flush data-cy="dashboard-project-list">
                  {data?.projects?.map((project) => (
                    <ProjectShortHandDisplay
                      key={project.id}
                      project={project}
                    />
                  ))}
                </ListGroup>
              </div>
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
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

interface ProjectBoxHeaderProps {
  totalProjects: number;
  namespace: string;
  namespaceKind: NamespaceKind;
}
function ProjectBoxHeader({
  totalProjects,
  namespaceKind,
  namespace,
}: ProjectBoxHeaderProps) {
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
            <Folder className={cx("me-1", "bi")} />
            Projects
          </h4>
          <Badge>{totalProjects}</Badge>
        </div>
        {namespaceKind === "group" && (
          <AddButtonForGroupNamespace namespace={namespace} />
        )}
        {namespaceKind === "user" && (
          <AddButtonForUserNamespace namespace={namespace} />
        )}
      </div>
    </CardHeader>
  );
}

function AddButtonForGroupNamespace({ namespace }: { namespace: string }) {
  const { permissions } = useGroupPermissions({ groupSlug: namespace });

  return (
    <PermissionsGuard
      disabled={null}
      enabled={
        <Link
          className={cx(
            "btn",
            "btn-outline-primary",
            "btn-sm",
            "ms-auto",
            "my-auto"
          )}
          to="/v2/projects/new"
        >
          <PlusLg className="bi" id="createPlus" />
        </Link>
      }
      requestedPermission="write"
      userPermissions={permissions}
    />
  );
}

function AddButtonForUserNamespace({ namespace }: { namespace: string }) {
  const { data: currentUser } = useGetUserQuery();

  if (currentUser?.isLoggedIn && currentUser.username === namespace) {
    return (
      <Link
        className={cx(
          "btn",
          "btn-outline-primary",
          "btn-sm",
          "ms-auto",
          "my-auto"
        )}
        to="/v2/projects/new"
      >
        <PlusLg className="bi" id="createPlus" />
      </Link>
    );
  }
  return null;
}

function AddEmptyListForGroupNamespace({ namespace }: { namespace: string }) {
  const { permissions } = useGroupPermissions({ groupSlug: namespace });

  return (
    <PermissionsGuard
      disabled={<p>This group has no visible projects.</p>}
      enabled={
        <p className="text-body-secondary">
          Collaborate on projects with anyone, with data, code, and compute
          together in one place.
        </p>
      }
      requestedPermission="write"
      userPermissions={permissions}
    />
  );
}

function AddEmptyListForUserNamespace({ namespace }: { namespace: string }) {
  const { data: currentUser } = useGetUserQuery();

  if (currentUser?.isLoggedIn && currentUser.username === namespace) {
    return (
      <p className="text-body-secondary">
        Collaborate on projects with anyone, with data, code, and compute
        together in one place.
      </p>
    );
  }
  return <p>This user has no visible personal projects.</p>;
}
