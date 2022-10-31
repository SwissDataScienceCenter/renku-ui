/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PopoverBody, UncontrolledPopover } from "../ts-wrappers";

import React, { ReactNode, useRef } from "react";

interface InformativeIconProps {
  children: string | ReactNode;
}
function InformativeIcon({ children }: InformativeIconProps) {
  const ref = useRef(null);
  return (
    <>
      <span ref={ref} className="text-rk-text">
        <FontAwesomeIcon className="cursor-pointer align-middle" size="sm" icon={faInfoCircle} />
      </span>
      <UncontrolledPopover target={ref} trigger="legacy" placement="bottom">
        <PopoverBody className="p-2">
          {children}
        </PopoverBody>
      </UncontrolledPopover>
    </>
  );
}

export default InformativeIcon;
