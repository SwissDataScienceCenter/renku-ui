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
import { Sliders } from "react-bootstrap-icons";
import { useParams } from "react-router-dom-v5-compat";
import { Card, CardBody, CardHeader } from "reactstrap";

import { Loader } from "../../../components/Loader";
import LazyNotFound from "../../../not-found/LazyNotFound";
import { useGetGroupsByGroupSlugQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import GroupNotFound from "../../projectsV2/notFound/GroupNotFound";
import GroupSettingsMembers from "./GroupSettingsMembers";
import GroupMetadataForm from "./GroupSettingsMetadata";

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
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <section>
        <Card data-cy="group-general-settings">
          <CardHeader>
            <h4 className="m-0">
              <Sliders className={cx("me-1", "bi")} />
              General settings
            </h4>
          </CardHeader>
          <CardBody>
            <GroupMetadataForm group={group} />
          </CardBody>
        </Card>
      </section>

      <section>
        <Card data-cy="group-members-settings">
          <GroupSettingsMembers group={group} />
        </Card>
      </section>
    </div>
  );
}
