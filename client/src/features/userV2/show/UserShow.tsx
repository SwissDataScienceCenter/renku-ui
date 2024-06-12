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
import { useEffect } from "react";
import {
  generatePath,
  useNavigate,
  useParams,
} from "react-router-dom-v5-compat";

import { Loader } from "../../../components/Loader";
import ContainerWrap from "../../../components/container/ContainerWrap";
import LazyNotFound from "../../../not-found/LazyNotFound";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { useGetNamespacesByGroupSlugQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import ProjectV2ListDisplay from "../../projectsV2/list/ProjectV2ListDisplay";
import UserNotFound from "../../projectsV2/notFound/UserNotFound";

export default function UserShow() {
  const { username } = useParams<{ username: string }>();

  const navigate = useNavigate();

  const {
    data: namespace,
    isLoading,
    error,
  } = useGetNamespacesByGroupSlugQuery(
    username ? { groupSlug: username } : skipToken
  );

  useEffect(() => {
    if (username && namespace?.namespace_kind === "group") {
      navigate(
        generatePath(ABSOLUTE_ROUTES.v2.groups.show, { slug: username })
      );
    }
  }, [namespace?.namespace_kind, navigate, username]);

  if (!username) {
    return <LazyNotFound />;
  }

  if (isLoading) {
    return <Loader className="align-self-center" />;
  }

  if (error || !namespace) {
    return <UserNotFound error={error} />;
  }

  const { name } = namespace;

  return (
    <ContainerWrap>
      <h1>{name ?? "Unknown user"}</h1>
      <p className="fs-4">{`@${username}`}</p>

      <section>
        <h2 className="fs-4">Personal Projects</h2>
        <ProjectV2ListDisplay namespace={username} pageParam="projects_page" />
      </section>
    </ContainerWrap>
  );
}
