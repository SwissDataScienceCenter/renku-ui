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
import { createContext, MouseEvent, ReactNode, useContext } from "react";

export const MenuButtonHideContext = createContext<(() => void) | null>(null);

export interface MenuButtonItemProps {
  children?: ReactNode;
  className?: string;
  "data-cy"?: string;
  disabled?: boolean;
  divider?: boolean;
  href?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  rel?: string;
  target?: string;
}

export function MenuButtonItem({
  children,
  className,
  "data-cy": dataCy,
  disabled,
  divider,
  href,
  onClick,
  rel,
  target,
}: MenuButtonItemProps) {
  const hide = useContext(MenuButtonHideContext);

  if (divider) {
    return (
      <div className={cx("dropdown-divider", className)} data-cy={dataCy} />
    );
  }

  const onItemClick = (event: MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    hide?.();
  };

  const classes = cx("dropdown-item", disabled && "disabled", className);

  if (href) {
    return (
      <a
        aria-disabled={disabled || undefined}
        className={classes}
        data-cy={dataCy}
        href={disabled ? undefined : href}
        onClick={onItemClick}
        rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
        target={target}
      >
        {children}
      </a>
    );
  }

  const onMouseDown = (event: MouseEvent<HTMLElement>) => {
    // Keep focus on the toggle so a modal/offcanvas can return to it.
    event.preventDefault();
  };

  return (
    <button
      className={classes}
      data-cy={dataCy}
      disabled={disabled}
      onClick={onItemClick}
      onMouseDown={onMouseDown}
      type="button"
    >
      {children}
    </button>
  );
}
