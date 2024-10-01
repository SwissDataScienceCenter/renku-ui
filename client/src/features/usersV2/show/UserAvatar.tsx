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

import styles from "./UserAvatar.module.scss";

interface UserAvatarProps {
  firstName?: string;
  large?: boolean;
  lastName?: string;
  username?: string;
}

export default function UserAvatar({
  firstName,
  lastName,
  large,
  username,
}: UserAvatarProps) {
  const firstLetters =
    firstName && lastName
      ? `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`
      : firstName || lastName
      ? `${firstName}${lastName}`.slice(0, 2)
      : username?.slice(0, 2) ?? "??";
  const firstLettersUpper = firstLetters.toUpperCase();

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
      {firstLettersUpper}
    </div>
  );
}
