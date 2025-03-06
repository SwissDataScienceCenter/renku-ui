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
  Outlet,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom-v5-compat";
import { Col, Row } from "reactstrap";

import ContainerWrap from "../../../components/container/ContainerWrap";
import { EntityWatermark } from "../../../components/entityWatermark/EntityWatermark";
import { Loader } from "../../../components/Loader";
import PageNav, { PageNavOptions } from "../../../components/PageNav";
import LazyNotFound from "../../../not-found/LazyNotFound";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { GroupResponse } from "../../projectsV2/api/namespace.api";
import {
  useGetGroupsByGroupSlugQuery,
  useGetNamespacesByNamespaceSlugQuery,
} from "../../projectsV2/api/projectV2.enhanced-api";
import GroupNotFound from "../../projectsV2/notFound/GroupNotFound";
import UserAvatar, { AvatarTypeWrap } from "../../usersV2/show/UserAvatar";

export default function GroupPageContainer() {
  const { slug } = useParams<{ slug: string }>();

  const navigate = useNavigate();

  const {
    currentData: namespace,
    isLoading: isLoadingNamespace,
    error: namespaceError,
  } = useGetNamespacesByNamespaceSlugQuery(
    slug ? { namespaceSlug: slug } : skipToken
  );
  const {
    data: group,
    isLoading: isLoadingGroup,
    error: groupError,
  } = useGetGroupsByGroupSlugQuery(slug ? { groupSlug: slug } : skipToken);

  const isLoading = isLoadingNamespace || isLoadingGroup;
  const error = namespaceError ?? groupError;

  useEffect(() => {
    if (slug && namespace?.namespace_kind === "user") {
      navigate(
        generatePath(ABSOLUTE_ROUTES.v2.users.show, { username: slug }),
        {
          replace: true,
        }
      );
    } else if (
      slug &&
      namespace?.namespace_kind === "group" &&
      namespace.slug !== slug
    ) {
      navigate(
        generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
          slug: namespace.slug,
        }),
        { replace: true }
      );
    }
  }, [namespace?.namespace_kind, namespace?.slug, navigate, slug]);

  if (!slug) {
    return <LazyNotFound />;
  }

  if (isLoading) {
    return <Loader className="align-self-center" />;
  }

  if (error || !namespace || !group) {
    return <GroupNotFound error={error} />;
  }

  const options: PageNavOptions = {
    overviewUrl: generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
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
          <GroupHeader group={group} slug={slug} />
        </Col>
        <Col xs={12} className="mb-0">
          <div className="my-3">
            <PageNav options={options} />
          </div>
        </Col>
        <Col xs={12}>
          <main>
            <Outlet context={{ group: group } satisfies ContextType} />
          </main>
        </Col>
      </Row>
    </ContainerWrap>
  );
}

type ContextType = { group: GroupResponse };
export function useGroup() {
  return useOutletContext<ContextType>();
}

function GroupHeader({ group, slug }: { group: GroupResponse; slug: string }) {
  return (
    <div className={cx("d-flex", "flex-row", "flex-nowrap", "gap-2")}>
      <div className={cx("d-flex", "gap-2")}>
        <AvatarTypeWrap type={"Group"}>
          <UserAvatar namespace={slug} size="lg" />
        </AvatarTypeWrap>
        <div>
          <h2 className="mb-0" data-cy="group-name">
            {group.name ?? "Unknown group"}
          </h2>
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
