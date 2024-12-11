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
import { useMemo } from "react";

import type { GroupResponse } from "../../projectsV2/api/namespace.api";
import type { UserWithId } from "../api/users.api";
import styles from "./UserAvatar.module.scss";

type UserOrGroupArg =
  | {
      user: UserWithId;
    }
  | {
      group: GroupResponse;
    };

type UserAvatarProps = UserOrGroupArg & {
  large?: boolean;
};

export default function UserAvatar({ large, ...userOrGroup }: UserAvatarProps) {
  const initials = useMemo(() => {
    if ("user" in userOrGroup) {
      const {
        username,
        first_name: firstName,
        last_name: lastName,
      } = userOrGroup.user;
      return firstName && lastName
        ? `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`
        : firstName || lastName
        ? `${firstName}${lastName}`.slice(0, 2)
        : username.slice(0, 2) || "??";
    } else {
      const { name, slug } = userOrGroup.group;
      return (name || slug).slice(0, 2) || "??";
    }
  }, []);
  const initialsUpper = useMemo(() => initials.toUpperCase(), []);

  return (
    <div
      className={cx(
        "align-content-center",
        "bg-info-subtle",
        "border-info-subtle",
        "border",
        "flex-shrink-0",
        "fw-bold",
        "rounded-circle",
        "text-center",
        styles.avatar,
        large && styles.large
      )}
    >
      {initialsUpper}
    </div>
  );
}
