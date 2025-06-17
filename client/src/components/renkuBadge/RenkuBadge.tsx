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

interface RenkuBadgeProps {
  children?: React.ReactNode;
  className?: string;
  color?: "success" | "danger" | "warning" | "light";
  "data-cy"?: string;
  pills?: boolean;
}

export default function RenkuBadge({
  children,
  className,
  color = "light",
  "data-cy": dataCy,
  pills = false,
}: RenkuBadgeProps) {
  const colorClasses =
    color === "success"
      ? ["border-success", "bg-success-subtle", "text-success-emphasis"]
      : color === "danger"
      ? ["border-danger", "bg-danger-subtle", "text-danger-emphasis"]
      : color === "warning"
      ? ["border-warning", "bg-warning-subtle", "text-warning-emphasis"]
      : ["border-dark-subtle", "bg-light", "text-dark-emphasis"];

  const baseClasses = [
    "border",
    "badge",
    pills ? "rounded-pill" : "",
    ...colorClasses,
  ];

  const finalClasses = className ? cx(className, baseClasses) : cx(baseClasses);

  return (
    <div className={finalClasses} data-cy={dataCy}>
      {children}
    </div>
  );
}
