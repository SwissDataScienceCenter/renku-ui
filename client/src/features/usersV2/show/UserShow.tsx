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
import { InfoCircle, JournalAlbum } from "react-bootstrap-icons";
import {
  generatePath,
  useNavigate,
  useParams,
} from "react-router-dom-v5-compat";
import { Badge, Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import { EntityWatermark } from "../../../components/EntityWatermark.tsx";

import { Loader } from "../../../components/Loader";
import ContainerWrap from "../../../components/container/ContainerWrap";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";

import DataConnectorsBox from "../../dataConnectorsV2/components/DataConnectorsBox";
import { useGetNamespacesByNamespaceSlugQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import ProjectV2ListDisplay from "../../projectsV2/list/ProjectV2ListDisplay";
import UserNotFound from "../../projectsV2/notFound/UserNotFound";
import {
  useGetUserByIdQuery,
  useGetUserQuery,
  UserWithId,
} from "../api/users.api";
import UserAvatar, { AvatarTypeWrap, UserAvatarSize } from "./UserAvatar";

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

  const information = (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <div>
        <p className={cx("align-items-center", "d-flex", "gap-2", "mb-0")}>
          <JournalAlbum className="bi" />
          Identifier:
        </p>
        <div className="ms-4">@{username}</div>
      </div>
    </div>
  );

  return (
    <ContainerWrap className="position-relative">
      <EntityWatermark type="user" />
      <Row>
        <Col xs={12} className={cx("mb-3", "pt-2", "pb-5")}>
          <UserHeader user={user} username={username} name={name ?? ""} />
        </Col>
        <Col xs={12}>
          <Row className="g-4">
            <Col xs={12} md={8} xl={9}>
              <Row className="g-4">
                <Col xs={12}>
                  <ProjectV2ListDisplay
                    namespace={username}
                    pageParam="projects_page"
                    namespaceKind="user"
                  />
                </Col>
                <Col className="order-3" xs={12}>
                  <DataConnectorsBox
                    namespace={username}
                    namespaceKind="user"
                    pageParam="data_connectors_page"
                  />
                </Col>
              </Row>
            </Col>
            <Col xs={12} md={4} xl={3}>
              <Card data-cy="project-info-card">
                <CardHeader>
                  <div
                    className={cx(
                      "align-items-center",
                      "d-flex",
                      "justify-content-between"
                    )}
                  >
                    <h4 className="m-0">
                      <InfoCircle className={cx("me-1", "bi")} />
                      Info
                    </h4>
                  </div>
                </CardHeader>
                <CardBody>{information}</CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </ContainerWrap>
  );
}

interface ItsYouBadgeProps {
  username: string;
}

function ItsYouBadge({ username }: ItsYouBadgeProps) {
  const { data: currentUser } = useGetUserQuery();

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
          <UserAvatar username={username} size={UserAvatarSize.large} />
        </AvatarTypeWrap>
        <div className="d-flex gap-2">
          <h2 className="mb-0">{name}</h2>
          <div>
            <ItsYouBadge username={username} />
          </div>
        </div>
      </div>
    </div>
  );
}
