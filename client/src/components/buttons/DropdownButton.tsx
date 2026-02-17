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
import { Button, ButtonGroup, DropdownMenu } from "reactstrap";

interface DropdownButtonProps {
  children?: React.ReactNode;
  color?: string;
  dataCy?: string;
  primaryButtonContent: React.ReactNode;
  primaryButtonOnclick: () => void;
  size?: "sm" | "lg";
}
// ! TODO: support Link/ExternalLink tags as primary "button"
export default function DropdownButton({
  children,
  color = "outline-primary",
  dataCy = "dropdown-button",
  primaryButtonContent,
  primaryButtonOnclick,
  size,
}: DropdownButtonProps) {
  return (
    <ButtonGroup data-cy={dataCy}>
      <Button
        color={color}
        data-cy={`${dataCy}-main`}
        size={size}
        onClick={primaryButtonOnclick}
      >
        {primaryButtonContent}
      </Button>

      <Button
        aria-expanded="false"
        className={cx(
          "border-start-0",
          "dropdown-toggle",
          "dropdown-toggle-split"
        )}
        color={color}
        data-bs-toggle="dropdown"
        data-cy={`${dataCy}-toggle`}
        size={size}
      >
        <span className="visually-hidden">Toggle Dropdown</span>
      </Button>

      <DropdownMenu tag="ul" data-cy={`${dataCy}-menu`}>
        {children}
      </DropdownMenu>
    </ButtonGroup>
  );
}
