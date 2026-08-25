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
import { MouseEvent, ReactNode } from "react";

import { Dropdown } from "~/utils/bootstrap/bootstrap.client";

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

// Bootstrap closes on document click; preventPropagation stops that, so close here.
function hideOwningDropdown(item: HTMLElement) {
  if (!Dropdown) return;
  const menu = item.closest(".dropdown-menu");
  const toggle = menu?.parentElement?.querySelector(
    "[data-bs-toggle='dropdown']",
  );
  if (toggle) Dropdown.getInstance(toggle)?.hide();
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
    hideOwningDropdown(event.currentTarget);
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

  return (
    <button
      className={classes}
      data-cy={dataCy}
      disabled={disabled}
      onClick={onItemClick}
      type="button"
    >
      {children}
    </button>
  );
}
