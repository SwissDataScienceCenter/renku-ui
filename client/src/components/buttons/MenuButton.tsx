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
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cx from "classnames";
import { MouseEvent, ReactNode, useLayoutEffect, useRef } from "react";

import { useBootstrapDropdown } from "./useBootstrapDropdown.hook";

export { MenuButtonItem } from "./MenuButtonItem";
export type { MenuButtonItemProps } from "./MenuButtonItem";

const DIRECTION_CLASS = {
  up: "dropup",
  down: undefined,
  start: "dropstart",
  end: "dropend",
} as const;

export interface MenuButtonProps {
  children?: ReactNode;
  className?: string;
  color?: string;
  dataCy?: string;
  default?: ReactNode;
  direction?: "up" | "down" | "start" | "end";
  disabled?: boolean;
  id?: string;
  label?: string;
  preventPropagation?: boolean;
  size?: "sm";
}

export function MenuButton({
  children,
  className,
  color = "primary",
  dataCy,
  default: defaultButton,
  direction = "down",
  disabled = false,
  id,
  label = "More actions",
  preventPropagation,
  size = "sm",
}: MenuButtonProps) {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isOpen, hide } = useBootstrapDropdown(toggleRef, menuRef);
  const isToggleDisabled = disabled;

  useLayoutEffect(() => {
    if (isToggleDisabled && isOpen) hide();
  }, [isToggleDisabled, isOpen, hide]);

  const onRootClick = preventPropagation
    ? (event: MouseEvent) => event.stopPropagation()
    : undefined;

  return (
    <div
      className={cx(
        "btn-group",
        `btn-group-${size}`,
        DIRECTION_CLASS[direction],
        className,
      )}
      id={id}
      onClick={onRootClick}
    >
      {defaultButton}
      <button
        aria-disabled={isToggleDisabled || undefined}
        aria-label={label}
        className={cx(
          "btn",
          `btn-${color}`,
          "dropdown-toggle",
          defaultButton && "dropdown-toggle-split",
          defaultButton && "border-start-0",
          isOpen && "show",
        )}
        data-bs-toggle="dropdown"
        data-cy={dataCy ?? "button-with-menu-dropdown"}
        disabled={isToggleDisabled && !isOpen}
        ref={toggleRef}
        type="button"
      />
      <div
        className={cx("dropdown-menu", "dropdown-menu-end", isOpen && "show")}
        ref={menuRef}
      >
        {children}
      </div>
    </div>
  );
}
