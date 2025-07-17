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
import { XCircle } from "react-bootstrap-icons";
import RenkuBadge from "../renkuBadge/RenkuBadge";

interface KeywordBadgeProps {
  children?: React.ReactNode;
  className?: string;
  "data-cy"?: string;
  highlighted?: boolean;
  remove?: () => void;
}

export default function KeywordBadge({
  children,
  className,
  "data-cy": dataCy = "keyword",
  highlighted,
  remove,
}: KeywordBadgeProps) {
  const removeButton = remove ? (
    <button
      aria-label="Remove keyword"
      className={cx("p-0", "border-0", "bg-transparent")}
      data-cy={`${dataCy}-remove`}
      onClick={remove}
      type="button"
    >
      <XCircle className="bi" />
    </button>
  ) : null;

  return (
    <RenkuBadge
      className={cx(
        "d-flex",
        "fw-semibold",
        "gap-1",
        "text-break",
        "text-wrap",
        highlighted && "bg-success-subtle",
        className
      )}
      data-cy={dataCy}
    >
      {children}
      {removeButton}
    </RenkuBadge>
  );
}
