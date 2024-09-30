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
import { Pencil } from "react-bootstrap-icons";
import {
  Link,
  generatePath,
  useNavigate,
  useParams,
} from "react-router-dom-v5-compat";

import { Loader } from "../../../components/Loader";
import ContainerWrap from "../../../components/container/ContainerWrap";
import LazyNotFound from "../../../not-found/LazyNotFound";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import MembershipGuard from "../../ProjectPageV2/utils/MembershipGuard";
import ProjectV2ListDisplay from "../../projectsV2/list/ProjectV2ListDisplay";
import GroupNotFound from "../../projectsV2/notFound/GroupNotFound";
import UserAvatar from "../../usersV2/show/UserAvatar";
import {
  type GroupResponse,
  useGetGroupsByGroupSlugMembersQuery,
  useGetGroupsByGroupSlugQuery,
  useGetNamespacesByNamespaceSlugQuery,
} from "../api/groupsV2.api";
import GroupV2MemberListDisplay from "../members/GroupV2MemberListDisplay";
import { EntityPill } from "../../searchV2/components/SearchV2Results";

export default function GroupV2Show() {
  const { slug } = useParams<{ slug: string }>();

  const navigate = useNavigate();

  const {
    data: namespace,
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
    }
  }, [namespace?.namespace_kind, navigate, slug]);

  if (!slug) {
    return <LazyNotFound />;
  }

  if (isLoading) {
    return <Loader className="align-self-center" />;
  }

  if (error || !namespace || !group) {
    return <GroupNotFound error={error} />;
  }

  return (
    <ContainerWrap>
      <div
        className={cx("d-flex", "flex-column", "flex-sm-row", "gap-3", "mb-3")}
      >
        <div>
          <div className={cx("d-flex", "flex-row", "flex-nowrap", "gap-2")}>
            <div className={cx("align-items-center", "d-flex", "gap-2")}>
              <UserAvatar username={group.name || slug} large />
              <h2 className="mb-0">{group.name ?? "Unknown group"}</h2>
            </div>
            <div className={cx("align-items-center", "d-flex")}>
              <EntityPill entityType="Group" size="sm" />
            </div>
          </div>
          <p className={cx("fst-italic", "mb-0")}>{`@${slug}`}</p>
        </div>
        <div className={cx("mb-0", "ms-sm-auto")}>
          <GroupSettingsButton group={group} />
        </div>
      </div>

      {group.description && (
        <section>
          <p>{group.description}</p>
        </section>
      )}
      <section>
        <h4>Group Members</h4>
        <GroupV2MemberListDisplay group={slug} />
      </section>

      <section>
        <h4>Group Projects</h4>
        <ProjectV2ListDisplay
          namespace={slug}
          pageParam="projects_page"
          emptyListElement={<p>No visible projects.</p>}
        />
      </section>
    </ContainerWrap>
  );
}

interface GroupSettingsButtonProps {
  group: GroupResponse;
}

function GroupSettingsButton({ group }: GroupSettingsButtonProps) {
  const { data: members } = useGetGroupsByGroupSlugMembersQuery({
    groupSlug: group.slug,
  });

  return (
    <MembershipGuard
      enabled={
        <Link
          to={generatePath(ABSOLUTE_ROUTES.v2.groups.show.settings, {
            slug: group.slug,
          })}
          className={cx("btn", "btn-outline-primary")}
        >
          <Pencil className={cx("bi", "me-1")} />
          Edit settings
        </Link>
      }
      disabled={null}
      members={members}
      minimumRole="editor"
    />
  );
}
