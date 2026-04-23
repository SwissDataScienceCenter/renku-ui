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
import { Col, Row } from "reactstrap";

import {
  EntityWatermark,
  EntityWatermarkPlaceholder,
} from "~/components/entityWatermark/EntityWatermark";
import RenkuBadge from "~/components/renkuBadge/RenkuBadge";
import GroupNew from "~/features/groupsV2/new/GroupNew";
import ProjectV2New from "~/features/projectsV2/new/ProjectV2New";
import {
  useGetUserQueryState,
  type UserWithId,
} from "~/features/usersV2/api/users.api";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import ContainerWrap from "../../../components/container/ContainerWrap";
import PageNav, { PageNavOptions } from "../../../components/PageNav";
import UserAvatar from "./UserAvatar";

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
    type: "user",
  };
  return (
    <ContainerWrap>
      <ProjectV2New />
      <GroupNew />

      <Row className="my-3">
        <Col xs={12}>
          <Row>
            <Col className="mb-3">
              <UserHeader name={name ?? ""} username={user.username} />
            </Col>
            <Col className={cx("d-md-block", "d-none")} md="auto">
              <div className="position-relative">
                <EntityWatermarkPlaceholder />
                <EntityWatermark
                  className={cx("end-0", "position-absolute", "top-0")}
                  type="user"
                />
              </div>
            </Col>
          </Row>
        </Col>
        <Col xs={12} className="mb-3">
          <PageNav options={options} />
        </Col>
        <Col xs={12}>
          <main>{children}</main>
        </Col>
      </Row>
    </ContainerWrap>
  );
}

interface UserHeaderProps {
  name: string;
  username: string;
}
function UserHeader({ name, username }: UserHeaderProps) {
  const { data: currentUser } = useGetUserQueryState();

  return (
    <header className={cx("d-flex", "flex-nowrap", "flex-row", "gap-2")}>
      <UserAvatar namespace={username} size="md" />
      <div className={cx("align-items-center", "d-flex", "gap-2")}>
        <h1 className={cx("mb-0", "text-break")} data-cy="user-name">
          {name}
        </h1>
        {currentUser?.isLoggedIn && currentUser.username === username && (
          <RenkuBadge pill color="info">
            It&apos;s you!
          </RenkuBadge>
        )}
      </div>
    </header>
  );
}
