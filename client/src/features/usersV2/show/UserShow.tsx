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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useEffect } from "react";
import {
  generatePath,
  useNavigate,
  useParams,
} from "react-router-dom-v5-compat";
import { Badge } from "reactstrap";

import { Loader } from "../../../components/Loader";
import ContainerWrap from "../../../components/container/ContainerWrap";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { useGetNamespacesByNamespaceSlugQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import ProjectV2ListDisplay from "../../projectsV2/list/ProjectV2ListDisplay";
import UserNotFound from "../../projectsV2/notFound/UserNotFound";
import {
  useGetUserQuery,
  useGetUsersByUserIdQuery,
} from "../../user/dataServicesUser.api/dataServicesUser.api";
import UserAvatar from "./UserAvatar";

export default function UserShow() {
  const { username } = useParams<{ username: string }>();

  const navigate = useNavigate();

  const {
    data: namespace,
    isLoading: isLoadingNamespace,
    error: namespaceError,
  } = useGetNamespacesByNamespaceSlugQuery(
    username ? { namespaceSlug: username } : skipToken
  );
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useGetUsersByUserIdQuery(
    namespace?.namespace_kind === "user" && namespace.created_by
      ? { userId: namespace.created_by }
      : skipToken
  );

  const isLoading = isLoadingNamespace || isLoadingUser;
  const error = namespaceError ?? userError;

  useEffect(() => {
    if (username && namespace?.namespace_kind === "group") {
      navigate(
        generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, { slug: username }),
        {
          replace: true,
        }
      );
    }
  }, [namespace?.namespace_kind, navigate, username]);

  if (isLoading) {
    return <Loader className="align-self-center" />;
  }

  if (error || !username || !namespace || !user) {
    return <UserNotFound error={error} />;
  }

  const name =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.first_name || user.last_name;

  return (
    <ContainerWrap>
      <div className={cx("d-flex", "flex-column", "flex-sm-row")}>
        <div className={cx("mb-1", "me-3")}>
          <UserAvatar
            firstName={user.first_name}
            lastName={user.last_name}
            username={username}
            large
          />
        </div>
        <div>
          <div
            className={cx(
              "d-flex",
              "flex-row",
              "flex-wrap",
              "flex-sm-nowrap",
              "align-items-start",
              "h1"
            )}
          >
            <h1 className={cx("mb-0", "me-4")}>{name ?? "Unknown user"}</h1>
            <div>
              <UserBadge />
              <ItsYouBadge username={username} />
            </div>
          </div>
          <p className="fs-4">{`@${username}`}</p>
        </div>
      </div>

      <section>
        <h2 className="fs-4">Personal Projects</h2>
        <ProjectV2ListDisplay
          namespace={username}
          pageParam="projects_page"
          emptyListElement={
            <p>{name ?? username} has no visible personal projects.</p>
          }
        />
      </section>
    </ContainerWrap>
  );
}

function UserBadge() {
  return (
    <Badge
      className={cx(
        "border",
        "border-success",
        "bg-success-subtle",
        "text-success"
      )}
      pill
    >
      User
    </Badge>
  );
}

interface ItsYouBadgeProps {
  username: string;
}

function ItsYouBadge({ username }: ItsYouBadgeProps) {
  const { data: currentUser } = useGetUserQuery();

  if (currentUser?.username === username) {
    return (
      <Badge
        className={cx(
          "ms-2",
          "border",
          "border-warning",
          "bg-warning-subtle",
          "text-warning"
        )}
        pill
      >
        It&apos;s you!
      </Badge>
    );
  }

  return null;
}
