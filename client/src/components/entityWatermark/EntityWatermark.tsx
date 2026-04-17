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
import { People, Person } from "react-bootstrap-icons";

import styles from "./entityWatermark.module.scss";

interface EntityWatermarkProps {
  className?: string;
  type: "user" | "group";
}
export function EntityWatermark({ className, type }: EntityWatermarkProps) {
  return (
    <div
      className={cx(
        "d-flex",
        "text-body-secondary",
        "opacity-25",
        className,
        styles.EntityWatermark
      )}
    >
      {type === "group" && <People />}
      {type === "user" && <Person />}
    </div>
  );
}

interface EntityWatermarkPlaceholderProps {
  className?: string;
}
export function EntityWatermarkPlaceholder({
  className,
}: EntityWatermarkPlaceholderProps) {
  return <div className={cx(className, styles.EntityWatermarkPlaceholder)} />;
}
