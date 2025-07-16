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
import { ReactNode, useRef } from "react";
import { InfoCircle } from "react-bootstrap-icons";
import { PopoverBody, UncontrolledPopover } from "reactstrap";

export function MoreInfo({
  trigger = "hover focus",
  children,
}: {
  trigger?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <>
      <span ref={ref}>
        <InfoCircle
          className={cx("bi", "ms-1", "cursor-pointer")}
          tabIndex={0}
        />
      </span>
      <UncontrolledPopover target={ref} placement="right" trigger={trigger}>
        <PopoverBody>{children}</PopoverBody>
      </UncontrolledPopover>
    </>
  );
}
