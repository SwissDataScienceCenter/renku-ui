/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import RenkuBadge from "../renkuBadge/RenkuBadge";
import { XCircle } from "react-bootstrap-icons";

interface KeywordBadgeProps {
  children?: React.ReactNode;
  className?: string;
  removable?: boolean;
  removeHandler?: () => void;
}

export default function KeywordBadge({
  children,
  className,
  removable = true,
  removeHandler,
}: KeywordBadgeProps) {
  const remove =
    removable && removeHandler ? (
      <XCircle
        className={cx("cursor-pointer")}
        aria-label="Remove keyword"
        onClick={removeHandler}
      />
    ) : null;

  return (
    <RenkuBadge className={cx("d-flex", "fw-semibold", "gap-1", className)}>
      {children}
      {remove}
    </RenkuBadge>
  );
}
