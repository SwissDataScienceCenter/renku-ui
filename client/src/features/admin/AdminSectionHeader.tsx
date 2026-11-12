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

import cx from "classnames";
import type { ReactNode } from "react";
import type { Icon } from "react-bootstrap-icons";
import { Badge } from "reactstrap";

interface AdminSectionHeaderProps {
  action?: ReactNode;
  className?: string;
  count?: number;
  headerTag?: "h2" | "h3" | "h4";
  icon: Icon;
  title: ReactNode;
}

export default function AdminSectionHeader({
  action,
  className,
  count,
  headerTag: HeaderTag = "h2",
  icon: SectionIcon,
  title,
}: AdminSectionHeaderProps) {
  return (
    <div
      className={cx(
        "align-items-center",
        "d-flex",
        "flex-wrap",
        "gap-2",
        "mb-3",
        className,
      )}
    >
      <HeaderTag className="mb-0">
        <SectionIcon className="me-1" />
        {title}
      </HeaderTag>

      {count != null && <Badge>{count}</Badge>}

      {action != null && (
        <div className={cx("col-12", "col-md-auto", "ms-md-auto")}>
          {action}
        </div>
      )}
    </div>
  );
}
