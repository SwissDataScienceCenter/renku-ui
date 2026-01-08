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
import { useMemo } from "react";
import { XCircle } from "react-bootstrap-icons";
import { generatePath, Link } from "react-router";

import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import RenkuBadge from "../renkuBadge/RenkuBadge";

interface KeywordBadgeProps {
  children?: React.ReactNode;
  className?: string;
  "data-cy"?: string;
  highlighted?: boolean;
  remove?: () => void;
  searchKeyword?: string;
}

export default function KeywordBadge({
  children,
  className,
  "data-cy": dataCy = "keyword",
  highlighted,
  remove,
  searchKeyword,
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
  const linkPath = useMemo(() => {
    if (searchKeyword == null || searchKeyword.length < 1) return null;
    const searchPath = generatePath(ABSOLUTE_ROUTES.v2.search);
    return (
      `${searchPath}?` +
      new URLSearchParams({ q: `keyword:"${searchKeyword}"` }).toString()
    );
  }, [searchKeyword]);

  const badge = (
    <RenkuBadge
      className={cx(
        "d-flex",
        "fw-semibold",
        "gap-1",
        "text-break",
        "text-start",
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
  if (linkPath) {
    return (
      <Link to={linkPath} className="text-decoration-none">
        {badge}
      </Link>
    );
  }
  return badge;
}
