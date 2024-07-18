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
import { ArrowLeft } from "react-bootstrap-icons";
import { Link, generatePath, useParams } from "react-router-dom-v5-compat";

import { Loader } from "../../../components/Loader";
import ContainerWrap from "../../../components/container/ContainerWrap";
import LazyNotFound from "../../../not-found/LazyNotFound";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { useGetGroupsByGroupSlugQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import GroupNotFound from "../../projectsV2/notFound/GroupNotFound";
import {
  GroupMembersForm,
  GroupMetadataForm,
} from "../../projectsV2/show/groupEditForms";

export default function GroupV2Settings() {
  const { slug } = useParams<{ slug: string }>();

  const {
    data: group,
    isLoading,
    error,
  } = useGetGroupsByGroupSlugQuery(slug ? { groupSlug: slug } : skipToken);

  if (!slug) {
    return <LazyNotFound />;
  }

  if (isLoading) {
    return <Loader className="align-self-center" />;
  }

  if (error || !group) {
    return <GroupNotFound error={error} />;
  }

  return (
    <ContainerWrap>
      <div className={cx("d-flex", "flex-column", "gap-3")}>
        <div>
          <h2>{group.name ?? "Unknown group"}</h2>
          <div>
            <Link
              to={generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
                slug: group.slug,
              })}
            >
              <ArrowLeft className={cx("me-2", "text-icon")} />
              Back to group
            </Link>
          </div>
        </div>

        <section>
          <h4>General settings</h4>
          <GroupMetadataForm group={group} />
        </section>

        <section>
          <GroupMembersForm group={group} />
        </section>
      </div>
    </ContainerWrap>
  );
}
