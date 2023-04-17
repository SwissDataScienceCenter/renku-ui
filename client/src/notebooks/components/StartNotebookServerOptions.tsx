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

import React from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";

import styles from "./StartNotebookServerOptions.module.scss";

const FORM_MAX_WIDTH = 250; // pixels;

interface ServerOptionEnumProps<T extends string | number> {
  disabled: boolean;
  onChange: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    optionName: T
  ) => void;
  options: T[];
  selected?: T | null | undefined;
  size?: string | null | undefined;
  warning?: T | null | undefined;
}

export const ServerOptionEnum = <T extends string | number>({
  disabled,
  onChange,
  options,
  selected,
  size,
  warning,
}: ServerOptionEnumProps<T>) => {
  const safeOptions =
    selected && options && options.length && !options.includes(selected)
      ? [...options, selected]
      : options;

  if (safeOptions.length === 1) {
    return (
      <Badge className="btn-outline-rk-green text-white">
        {safeOptions[0]}
      </Badge>
    );
  }

  const approxSize = approximateButtonGroupSizeInPixels(safeOptions);
  const useDropdown = approxSize > FORM_MAX_WIDTH;

  if (useDropdown) {
    const picked = selected ? selected : options[0];

    let color: string | undefined = "rk-white";
    if (picked === selected)
      color = warning != null && warning === picked ? "danger" : undefined;

    return (
      <UncontrolledDropdown direction="down" className={styles.dropdown}>
        <DropdownToggle
          caret
          className="btn-outline-rk-green"
          size={size ?? undefined}
          color={color}
        >
          <span>{picked}</span>
        </DropdownToggle>
        <DropdownMenu>
          <ButtonGroup vertical className="w-100">
            {safeOptions.map((optionName) => {
              let color: string | undefined = "rk-white";
              if (optionName === selected) {
                color =
                  warning != null && warning === optionName
                    ? "danger"
                    : undefined;
              }
              return (
                <DropdownItem
                  key={optionName}
                  color={color}
                  className="btn-outline-rk-green btn"
                  size={size ?? undefined}
                  disabled={disabled}
                  active={optionName === selected}
                  onClick={(event) => onChange(event, optionName)}
                  style={{ border: "unset !important" }}
                >
                  {optionName}
                </DropdownItem>
              );
            })}
          </ButtonGroup>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  return (
    <ButtonGroup>
      {safeOptions.map((optionName) => {
        let color: string | undefined = "rk-white";
        if (optionName === selected) {
          color =
            warning != null && warning === optionName ? "danger" : undefined;
        }
        return (
          <Button
            key={optionName}
            color={color}
            className="btn-outline-rk-green"
            size={size ?? undefined}
            disabled={disabled}
            active={optionName === selected}
            onClick={(event) => onChange(event, optionName)}
          >
            {optionName}
          </Button>
        );
      })}
    </ButtonGroup>
  );
};

const approximateButtonGroupSizeInPixels = <T extends string | number>(
  options: T[]
): number =>
    // padding in x direction
    options.length * 2 * 10 +
    // safe approximate character size
    options.map((opt) => `${opt}`).reduce((len, opt) => len + opt.length, 0) * 12;
