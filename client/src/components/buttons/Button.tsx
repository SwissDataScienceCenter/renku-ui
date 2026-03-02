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
/**
 *  renku-ui
 *
 *  Button.js
 *  Button code and presentation.
 */

import cx from "classnames";
import { ReactNode, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ThreeDotsVertical,
} from "react-bootstrap-icons";
import { Link } from "react-router";
import {
  ButtonDropdown,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  UncontrolledTooltip,
} from "reactstrap";

type ButtonWithMenuProps = {
  children?:
    | React.ReactElement[]
    | React.ReactNode[]
    | JSX.Element[]
    | JSX.Element;
  className?: string;
  color?: "rk-blue" | "rk-green" | "rk-pink";
  default: React.ReactNode;
  direction?: "up" | "down" | "start" | "end";
  disabled?: boolean;
  id?: string;
  isPrincipal?: boolean;
  size?: string;
};

/**
 * A button with a menu (dropdown button)
 *
 * @param {component} [default] - The main, default item to show
 * @param {[DropdownItem]} [children] - The items to show in the menu
 * @param {"rk-blue" | "rk-green"| "rk-pink" } props.color - Indicate the color of the button
 * @param {string} props.id - Identifier
 * @param {boolean} props.isPrincipal -  Indicate if is principal or secondary button
 */
export function ButtonWithMenu(props: ButtonWithMenuProps) {
  const [dropdownOpen, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!dropdownOpen);
  const size = props.size ? props.size : "md";
  const bgColor = props.color || "rk-green";
  const classes = props.isPrincipal
    ? `btn-${bgColor}`
    : `btn-outline-${bgColor}`;

  const options = props.children ? (
    <>
      <DropdownToggle
        data-cy="more-menu"
        className={cx(props.className, classes, "rounded-end-pill")}
        disabled={props.disabled}
      >
        <ChevronDown
          data-cy="more-options-button"
          size="20"
          className="btn-with-menu-icon"
        />
      </DropdownToggle>
      <DropdownMenu className="btn-with-menu-options" end>
        {props.children}
      </DropdownMenu>
    </>
  ) : null;

  return (
    <ButtonDropdown
      id={props.id}
      className={cx(props.className, "btn-with-menu")}
      size={size}
      isOpen={dropdownOpen}
      toggle={toggleOpen}
      color={bgColor}
      direction={props.direction ?? "down"}
      disabled={props.disabled}
    >
      {props.default}
      {options}
    </ButtonDropdown>
  );
}

interface ButtonWithMenuV2Props {
  children?: React.ReactNode;
  className?: string;
  color?: string;
  dataCy?: string;
  default: React.ReactNode;
  direction?: "up" | "down" | "start" | "end";
  disabled?: boolean;
  id?: string;
  preventPropagation?: boolean;
  size?: string;
  isDisabledDropdownToggle?: boolean;
}
export function ButtonWithMenuV2({
  children,
  className,
  color,
  dataCy,
  default: defaultButton,
  direction,
  disabled,
  id,
  preventPropagation,
  size,
  isDisabledDropdownToggle,
}: ButtonWithMenuV2Props) {
  // ! Temporary workaround to quickly implement a design solution -- to be removed ASAP #3250
  const additionalProps = preventPropagation
    ? { onClick: (e: React.MouseEvent) => e.stopPropagation() }
    : {};
  return (
    <UncontrolledDropdown
      {...additionalProps}
      className={className}
      color={color ?? "primary"}
      direction={direction ?? "down"}
      disabled={disabled}
      group
      id={id}
      size={size ?? "md"}
    >
      {defaultButton}
      <DropdownToggle
        caret
        className={cx("border-start-0", "dropdown-toggle-split")}
        data-bs-toggle="dropdown"
        color={color ?? "primary"}
        data-cy={dataCy ?? "button-with-menu-dropdown"}
        disabled={isDisabledDropdownToggle ?? disabled}
      />
      <DropdownMenu end>{children}</DropdownMenu>
    </UncontrolledDropdown>
  );
}

export function SingleButtonWithMenu({
  children,
  className,
  color,
  direction,
  disabled,
  id,
  size,
}: Omit<ButtonWithMenuV2Props, "default" | "preventPropagation">) {
  return (
    <UncontrolledDropdown
      className={className}
      color={color ?? "primary"}
      direction={direction ?? "down"}
      disabled={disabled}
      id={id}
      size={size ?? "md"}
    >
      <DropdownToggle
        caret={false}
        data-bs-toggle="dropdown"
        color={color ?? "primary"}
        data-cy="button-with-menu-dropdown"
        disabled={disabled}
      >
        <ThreeDotsVertical />
      </DropdownToggle>
      <DropdownMenu end>{children}</DropdownMenu>
    </UncontrolledDropdown>
  );
}

/*
 * underline Link with icon
 */
export function UnderlineArrowLink({
  to,
  text,
  tooltip,
}: {
  text: string;
  to: string;
  tooltip: ReactNode;
}) {
  const ref = useRef(null);
  return (
    <>
      <span ref={ref}>
        <Link to={to}>
          {text}
          <ArrowRight className={cx("bi", "ms-1")} />
        </Link>
      </span>
      <UncontrolledTooltip target={ref}>{tooltip}</UncontrolledTooltip>
    </>
  );
}
