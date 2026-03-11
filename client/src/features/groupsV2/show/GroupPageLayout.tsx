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
import { ReactNode } from "react";
import { generatePath } from "react-router";
import { Col, Row } from "reactstrap";

import ContainerWrap from "../../../components/container/ContainerWrap";
import { EntityWatermark } from "../../../components/entityWatermark/EntityWatermark";
import PageNav, { PageNavOptions } from "../../../components/PageNav";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import type { GroupResponse } from "../../projectsV2/api/namespace.api";
import UserAvatar, { AvatarTypeWrap } from "../../usersV2/show/UserAvatar";

interface GroupPageLayoutProps {
  group: GroupResponse;
  children?: ReactNode;
}

export default function GroupPageLayout({
  group,
  children,
}: GroupPageLayoutProps) {
  const options: PageNavOptions = {
    overviewUrl: generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
      slug: group.slug,
    }),
    searchUrl: generatePath(ABSOLUTE_ROUTES.v2.groups.show.search, {
      slug: group.slug,
    }),
    settingsUrl: generatePath(ABSOLUTE_ROUTES.v2.groups.show.settings, {
      slug: group.slug,
    }),
  };
  return (
    <ContainerWrap className="py-0">
      <EntityWatermark type="group" />
      <Row className="py-3">
        <Col xs={12}>
          <GroupHeader group={group} slug={group.slug} />
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

function GroupHeader({ group, slug }: { group: GroupResponse; slug: string }) {
  return (
    <div className={cx("d-flex", "flex-row", "flex-nowrap", "gap-2")}>
      <div className={cx("d-flex", "gap-2")}>
        <AvatarTypeWrap type={"Group"}>
          <UserAvatar namespace={slug} size="lg" />
        </AvatarTypeWrap>
        <div>
          <h1 className="mb-0" data-cy="group-name">
            {group.name ?? "Unknown group"}
          </h1>
          {group.description && (
            <section>
              <p data-cy="group-description">{group.description}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
