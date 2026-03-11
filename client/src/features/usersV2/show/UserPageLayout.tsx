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

import cx from "classnames";
import { ReactNode } from "react";
import { generatePath } from "react-router";
import { Badge, Col, Row } from "reactstrap";

import { EntityWatermark } from "~/components/entityWatermark/EntityWatermark";
import {
  useGetUserQueryState,
  type UserWithId,
} from "~/features/usersV2/api/users.api";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import ContainerWrap from "../../../components/container/ContainerWrap";
import PageNav, { PageNavOptions } from "../../../components/PageNav";
import UserAvatar, { AvatarTypeWrap } from "./UserAvatar";

interface UserPageLayoutProps {
  user: UserWithId;
  children?: ReactNode;
}

export default function UserPageLayout({
  user,
  children,
}: UserPageLayoutProps) {
  const name =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name || user?.last_name;
  const options: PageNavOptions = {
    overviewUrl: generatePath(ABSOLUTE_ROUTES.v2.users.show.root, {
      username: user.username,
    }),
    searchUrl: generatePath(ABSOLUTE_ROUTES.v2.users.show.search, {
      username: user.username,
    }),
  };
  return (
    <ContainerWrap className="py-0">
      <EntityWatermark type="user" />
      <Row className="py-3">
        <Col xs={12}>
          <UserHeader user={user} username={user.username} name={name ?? ""} />
        </Col>
        <Col xs={12} className="mb-0">
          <div className="my-3">
            <PageNav options={options} />
          </div>
        </Col>
        <Col xs={12}>
          <main>{children}</main>
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
