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

import React from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
  UncontrolledDropdown,
} from "reactstrap";

interface ServerOptionEnumProps<T extends string | number> {
  disabled: boolean;
  options: T[];
  selected: T | null | undefined;
}

const ServerOptionEnum = <T extends string | number>({
  disabled,
  options,
  selected,
  ...props
}: ServerOptionEnumProps<T> & { [key: string]: any }) => {
  console.log({ props: { disabled, options, selected, ...props } });

  const safeOptions =
    selected && options && options.length && !options.includes(selected)
      ? [...options, selected]
      : options;

  // if (selected && options && options.length && !options.includes(selected))
  //   options = options.concat(selected);
  if (safeOptions.length === 1)
    return (
      <Badge className="btn-outline-rk-green text-white">
        {safeOptions[0]}
      </Badge>
    );

  if (safeOptions.length > 5) {
    const picked = selected ? selected : options[0];

    let color: string | undefined = "rk-white";
        if (picked === selected) {
          color =
            props.warning != null && props.warning === picked
              ? "danger"
              : undefined;
        }
        const size = props.size ? props.size : null;

    return (
      <UncontrolledButtonDropdown group direction="down">
        <Button color={color}
            className="btn-outline-rk-green"
            size={size} active tag="div">{picked}</Button>
        <DropdownToggle caret className="btn-outline-rk-green btn-rk-white"></DropdownToggle>
        <DropdownMenu>
          <ButtonGroup vertical className="w-100">
          {safeOptions.map((optionName) => {
            let color: string | undefined = "rk-white";
            if (optionName === selected) {
              color =
                props.warning != null && props.warning === optionName
                  ? "danger"
                  : undefined;
            }
            const size = props.size ? props.size : null;
            return (
              <DropdownItem
                key={optionName}
                color={color}
                className="btn-outline-rk-green btn-rk-white btn"
                size={size}
                disabled={disabled}
                active={optionName === selected}
                onClick={(event) => props.onChange(event, optionName)}
                style={{border: 'unset !important'}}
              >
                {optionName}
              </DropdownItem>
            );
          })}
          </ButtonGroup>
        </DropdownMenu>
      </UncontrolledButtonDropdown>
    );
  }

  return (
    <ButtonGroup>
      {safeOptions.map((optionName) => {
        let color: string | undefined = "rk-white";
        if (optionName === selected) {
          color =
            props.warning != null && props.warning === optionName
              ? "danger"
              : undefined;
        }
        const size = props.size ? props.size : null;
        return (
          <Button
            key={optionName}
            color={color}
            className="btn-outline-rk-green"
            size={size}
            disabled={disabled}
            active={optionName === selected}
            onClick={(event) => props.onChange(event, optionName)}
          >
            {optionName}
          </Button>
        );
      })}
    </ButtonGroup>
  );
};

export { ServerOptionEnum };
