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
import { ReactNode, useEffect, useMemo } from "react";

import { projectV2Api } from "../../projectsV2/api/projectV2.enhanced-api";
import type { SearchEntity } from "../../searchV2/api/searchV2Api.api";
import { EntityPill } from "../../searchV2/components/EntityPill";
import { usersApi } from "../api/users.api";

import styles from "./UserAvatar.module.scss";

type AvatarSize = "sm" | "md" | "lg";

interface UserAvatarProps {
  className?: string;
  namespace: string;
  size?: AvatarSize;
}

export default function UserAvatar({
  className,
  namespace: namespaceSlug,
  size = "sm",
}: UserAvatarProps) {
  const { data: namespace, isUninitialized: isNamespaceUninitialized } =
    projectV2Api.endpoints.getNamespacesByNamespaceSlug.useQueryState(
      namespaceSlug ? { namespaceSlug } : skipToken
    );
  const [fetchNamespace] =
    projectV2Api.endpoints.getNamespacesByNamespaceSlug.useLazyQuery();
  useEffect(() => {
    if (namespaceSlug && isNamespaceUninitialized) {
      fetchNamespace({ namespaceSlug });
    }
  }, [fetchNamespace, isNamespaceUninitialized, namespaceSlug]);

  const { data: user, isUninitialized: isUserUninitialized } =
    usersApi.endpoints.getUsersByUserId.useQueryState(
      namespace?.namespace_kind === "user" && namespace.created_by
        ? { userId: namespace.created_by }
        : skipToken
    );
  const [fetchUser] = usersApi.endpoints.getUsersByUserId.useLazyQuery();
  useEffect(() => {
    if (
      namespace?.namespace_kind === "user" &&
      namespace.created_by &&
      isUserUninitialized
    ) {
      fetchUser({ userId: namespace.created_by });
    }
  }, [
    fetchUser,
    isUserUninitialized,
    namespace?.created_by,
    namespace?.namespace_kind,
  ]);

  const { data: group, isUninitialized: isGroupUninitialized } =
    projectV2Api.endpoints.getGroupsByGroupSlug.useQueryState(
      namespace?.namespace_kind === "group"
        ? { groupSlug: namespace.slug }
        : skipToken
    );
  const [fetchGroup] =
    projectV2Api.endpoints.getGroupsByGroupSlug.useLazyQuery();
  useEffect(() => {
    if (namespace?.namespace_kind === "group" && isGroupUninitialized) {
      fetchGroup({ groupSlug: namespace.slug });
    }
  }, [
    fetchGroup,
    isGroupUninitialized,
    namespace?.namespace_kind,
    namespace?.slug,
  ]);

  const initials = useMemo(() => {
    if (user) {
      const { username, first_name: firstName, last_name: lastName } = user;
      return firstName && lastName
        ? `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`
        : firstName || lastName
        ? `${firstName}${lastName}`.slice(0, 2)
        : username.slice(0, 2) || "??";
    }
    if (group) {
      const { name, slug } = group;
      const [first, second] = name.split(" ");
      return first && second
        ? `${first.slice(0, 1)}${second.slice(0, 1)}`
        : (name || slug).slice(0, 2) || "??";
    }
    return namespaceSlug.slice(0, 2) || "??";
  }, [group, namespaceSlug, user]);
  const initialsUpper = useMemo(() => initials.toUpperCase(), [initials]);

  const randomPastelColor = generatePastelColor(namespaceSlug);

  return (
    <div
      className={cx(
        "align-content-center",
        "border",
        "flex-shrink-0",
        "rounded-circle",
        "text-center",
        "text-black",
        styles.avatar,
        size === "lg" && styles.large,
        size === "md" && styles.medium,
        className
      )}
      style={{ backgroundColor: randomPastelColor }}
    >
      {initialsUpper}
    </div>
  );
}

function generatePastelColor(input: string) {
  const hash = hashStringToNumber(input);
  const hue = hash % 360; // Map hash to a hue value (0-359)
  const saturation = 70; // Pastel saturation
  const lightness = 97; // Pastel lightness
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
function hashStringToNumber(str: string) {
  return str.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

type EntityType = Extract<SearchEntity["type"], "User" | "Group">;

interface AvatarTypeWrapProps {
  type: EntityType;
  children?: ReactNode;
}
export function AvatarTypeWrap({ type, children }: AvatarTypeWrapProps) {
  return (
    <div
      className={cx(
        styles.typeBadge,
        "d-flex",
        "align-items-end",
        "position-relative"
      )}
    >
      {children}
      <div className={cx("position-absolute", "top-0", "end-0")}>
        <EntityPill entityType={type} size="sm" />
      </div>
    </div>
  );
}
