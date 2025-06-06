/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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
import { ReactNode } from "react";

interface ContainerWrapProps {
  children?: ReactNode;
  className?: string;
  fullSize?: boolean;
}

export default function ContainerWrap({
  children,
  className: className_,
  fullSize,
}: ContainerWrapProps) {
  if (!children) {
    return null;
  }

  const className = cx(
    fullSize
      ? "w-100"
      : ["container-xxl", "py-3", "px-2", "px-sm-3", "px-xxl-0"],
    className_
  );
  return <div className={className}>{children}</div>;
}
