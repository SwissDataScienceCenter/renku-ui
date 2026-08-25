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

import { useMemo } from "react";

import { useGetGroupsByGroupSlugQuery } from "../projectsV2/api/namespace.api";
import { useGetNamespacesByNamespaceProjectsAndSlugQuery } from "../projectsV2/api/projectV2.enhanced-api";
import type { MemberType } from "./addMemberToResourcePool.types";
import { useGetKeycloakUsersQuery } from "./adminKeycloak.api";
import useKeycloakRealm from "./useKeycloakRealm.hook";

export default function useResolveBatchItem(
  memberType: MemberType,
  input: string,
) {
  const realm = useKeycloakRealm();

  const {
    data: users,
    isFetching: isFetchingUser,
    isError: isUserError,
  } = useGetKeycloakUsersQuery(
    { realm, search: input },
    { skip: memberType !== "user" },
  );

  const matchedUser = useMemo(() => {
    if (memberType !== "user" || users == null) {
      return undefined;
    }
    return users.find(
      (keycloakUser) =>
        keycloakUser.email.toLowerCase() === input.toLowerCase(),
    );
  }, [input, memberType, users]);

  const {
    data: group,
    isFetching: isFetchingGroup,
    isError: isGroupError,
  } = useGetGroupsByGroupSlugQuery(
    { groupSlug: input },
    { skip: memberType !== "group" },
  );

  const [firstSlug, secondSlug] = useMemo(() => {
    const parts = input.split("/").map((part) => part.trim());
    return parts.length === 2 ? parts : ["", ""];
  }, [input]);
  const enabled = firstSlug.length > 0 && secondSlug.length > 0;

  const {
    data: project,
    isFetching: isFetchingProject,
    isError: isProjectError,
  } = useGetNamespacesByNamespaceProjectsAndSlugQuery(
    { namespace: firstSlug, slug: secondSlug },
    { skip: memberType !== "project" || !enabled },
  );

  return useMemo(() => {
    switch (memberType) {
      case "user": {
        if (isFetchingUser) {
          return { isFetching: true, found: false };
        }
        if (isUserError || matchedUser == null) {
          return { isFetching: false, found: false };
        }
        return {
          isFetching: false,
          found: true,
          id: matchedUser.id,
          name: `${matchedUser.firstName} ${matchedUser.lastName}`,
        };
      }
      case "group": {
        if (isFetchingGroup) {
          return { isFetching: true, found: false };
        }
        if (isGroupError || group == null) {
          return { isFetching: false, found: false };
        }
        return {
          isFetching: false,
          found: true,
          id: group.id,
          name: group.name,
        };
      }
      case "project": {
        if (isFetchingProject) {
          return { isFetching: true, found: false };
        }
        if (isProjectError || project == null) {
          return { isFetching: false, found: false };
        }
        return {
          isFetching: false,
          found: true,
          id: project.id,
          name: project.name ?? project.slug,
        };
      }
    }
  }, [
    group,
    isFetchingGroup,
    isFetchingProject,
    isFetchingUser,
    isGroupError,
    isProjectError,
    isUserError,
    matchedUser,
    memberType,
    project,
  ]);
}
