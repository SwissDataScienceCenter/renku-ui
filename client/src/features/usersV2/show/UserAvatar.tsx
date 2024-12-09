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

export enum UserAvatarSize {
  small = "small",
  medium = "medium",
  large = "large",
  extraLarge = "extra-large",
}
interface UserAvatarProps {
  firstName?: string;
  size?: UserAvatarSize;
  lastName?: string;
  username?: string;
}

export default function UserAvatar({
  firstName,
  lastName,
  size = UserAvatarSize.small,
  username,
}: UserAvatarProps) {
  const firstLetters =
    firstName && lastName
      ? `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`
      : firstName || lastName
      ? `${firstName}${lastName}`.slice(0, 2)
      : username?.slice(0, 2) ?? "??";
  const firstLettersUpper = firstLetters.toUpperCase();
  const randomPastelColor = generatePastelColor(firstLettersUpper);

  return (
    <div
      style={{ backgroundColor: randomPastelColor }}
      className={cx(
        "align-content-center",
        "border",
        "flex-shrink-0",
        "rounded-circle",
        "text-center",
        styles.avatar,
        size === UserAvatarSize.large && styles.large,
        size === UserAvatarSize.extraLarge && styles.extraLarge
      )}
    >
      {firstLettersUpper}
    </div>
  );
}

function generatePastelColor(input: string) {
  const hash = hashStringToNumber(input);
  const hue = hash % 360; // Map hash to a hue value (0-359)
  const saturation = 70; // Pastel saturation
  const lightness = 95; // Pastel lightness
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
function hashStringToNumber(str: string) {
  return str
    .split("")
    .reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);
}
