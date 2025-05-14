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
 * limitations under the License
 */

import cx from "classnames";
import { ReactNode, useRef } from "react";
import { Badge, UncontrolledTooltip } from "reactstrap";
import styles from "./WipBadge.module.scss";

interface WipBadeProps {
  className?: string;
  children?: ReactNode;
  tooltip?: ReactNode;
}

export default function WipBadge({
  className,
  children = "Work in progress",
  tooltip = "The platform is stable, but some core features are still being developed and will be added soon.",
}: WipBadeProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <>
      <Badge
        className={cx("rounded-pill", styles.EarlyAccessBadge, className)}
        color="pink"
        innerRef={ref}
      >
        {children}
      </Badge>
      <UncontrolledTooltip target={ref}>{tooltip}</UncontrolledTooltip>
    </>
  );
}
