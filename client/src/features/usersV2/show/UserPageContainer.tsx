/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { generatePath, Outlet, useNavigate, useOutletContext, useParams } from "react-router";
import { Badge, Col, Row } from "reactstrap";

import { EntityWatermark } from "~/components/entityWatermark/EntityWatermark";
import { Loader } from "~/components/Loader";
import UserNotFound from "~/features/projectsV2/notFound/UserNotFound";
import { NamespaceContextType } from "~/features/searchV2/hooks/useNamespaceContext.hook";
import {
  useGetUserByIdQuery,
  useGetUserQueryState,
  UserWithId,
} from "~/features/usersV2/api/users.api";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import ContainerWrap from "../../../components/container/ContainerWrap";
import PageNav, { PageNavOptions } from "../../../components/PageNav";
import { useGetNamespacesByNamespaceSlugQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import UserAvatar, { AvatarTypeWrap } from "../../usersV2/show/UserAvatar";

export default function UserPageContainer() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const {
    currentData: namespace,
    isLoading: isLoadingNamespace,
    error: namespaceError,
  } = useGetNamespacesByNamespaceSlugQuery(
    username ? { namespaceSlug: username } : skipToken
  );

  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useGetUserByIdQuery(
    namespace?.namespace_kind === "user" && namespace.created_by
      ? { userId: namespace.created_by }
      : skipToken
  );

  const name =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name || user?.last_name;

  const isLoading = isLoadingNamespace || isLoadingUser;
  const error = namespaceError ?? userError;

  useEffect(() => {
    if (username && namespace?.namespace_kind === "group") {
      navigate(
        generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, { slug: username }),
        { replace: true }
      );
    } else if (
      username &&
      namespace?.namespace_kind === "user" &&
      namespace.slug !== username
    ) {
      navigate(
        generatePath(ABSOLUTE_ROUTES.v2.users.show.root, {
          username: namespace.slug,
        }),
        { replace: true }
      );
    }
  }, [namespace?.namespace_kind, namespace?.slug, navigate, username]);

  if (isLoading) {
    return <Loader className="align-self-center" />;
  }

  if (error || !username || !namespace || !user) {
    return <UserNotFound error={error} />;
  }

  const options: PageNavOptions = {
    overviewUrl: generatePath(ABSOLUTE_ROUTES.v2.users.show.root, {
      username: namespace.slug,
    }),
    searchUrl: generatePath(ABSOLUTE_ROUTES.v2.users.show.search, {
      username: namespace.slug,
    }),
  };
  return (
    <ContainerWrap className="py-0">
      <EntityWatermark type="user" />
      <Row className="py-3">
        <Col xs={12}>
          <UserHeader user={user} username={username} name={name ?? ""} />
        </Col>
        <Col xs={12} className="mb-0">
          <div className="my-3">
            <PageNav options={options} />
          </div>
        </Col>
        <Col xs={12}>
          <main>
            <Outlet
              context={
                {
                  kind: "user",
                  namespace: username,
                  user: user,
                } satisfies NamespaceContextType
              }
            />
          </main>
        </Col>
      </Row>
    </ContainerWrap>
  );
}

function UserHeader({
  username,
  name,
}: {
  user: UserWithId;
  username: string;
  name: string;
}) {
  return (
    <div className={cx("d-flex", "flex-row", "flex-nowrap", "gap-2")}>
      <div className={cx("d-flex", "gap-2")}>
        <AvatarTypeWrap type={"User"}>
          <UserAvatar namespace={username} size="lg" />
        </AvatarTypeWrap>
        <div className={cx("d-flex", "gap-2")}>
          <h1 className="mb-0" data-cy="user-name">
            {name}
          </h1>
          <div>
            <ItsYouBadge username={username} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ItsYouBadgeProps {
  username: string;
}
function ItsYouBadge({ username }: ItsYouBadgeProps) {
  const { data: currentUser } = useGetUserQueryState();

  if (currentUser?.isLoggedIn && currentUser.username === username) {
    return (
      <Badge
        className={cx(
          "border",
          "border-warning",
          "bg-warning-subtle",
          "text-warning-emphasis"
        )}
        pill
      >
        It&apos;s you!
      </Badge>
    );
  }

  return null;
}
