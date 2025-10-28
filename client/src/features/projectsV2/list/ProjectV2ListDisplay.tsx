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
import { useEffect, useMemo } from "react";
import { Folder, PlusLg } from "react-bootstrap-icons";
import { Link, useLocation, useSearchParams } from "react-router";
import {
  Badge,
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
import { NamespaceKind } from "../api/namespace.api";
import { useGetProjectsQuery } from "../api/projectV2.enhanced-api";
import { PROJECT_CREATION_HASH } from "../new/createProjectV2.constants";
import ProjectShortHandDisplay from "../show/ProjectShortHandDisplay";

const DEFAULT_PER_PAGE = 5;
const DEFAULT_PAGE_PARAM = "page";

interface ProjectListDisplayProps {
  children?: React.ReactNode;
  limit?: number;
  namespace?: string;
  pageParam?: string;
  perPage?: number;
  namespaceKind: NamespaceKind;
}

export default function ProjectListDisplay({
  children,
  limit,
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
                  {limit && data.total > limit && (
                    <ListGroupItem className="fst-italic">
                      And {data.total - data.projects.length} more...
                    </ListGroupItem>
                  )}
                </ListGroup>
              </div>
              {!limit && (
                <Pagination
                  className="mt-3"
                  currentPage={data.page}
                  pageQueryParam={pageParam}
                  perPage={perPage}
                  totalItems={data.total}
                />
              )}
            </>
          )}
          {children}
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
          <h2 className={cx("mb-0", "me-2")}>
            <Folder className={cx("me-1", "bi")} />
            Projects
          </h2>
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
  const location = useLocation();

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
          data-cy="group-create-project-button"
          to={{ hash: PROJECT_CREATION_HASH, search: location.search }}
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
  const { data: currentUser } = useGetUserQueryState();
  const location = useLocation();

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
        to={{ hash: PROJECT_CREATION_HASH, search: location.search }}
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
  const { data: currentUser } = useGetUserQueryState();

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
