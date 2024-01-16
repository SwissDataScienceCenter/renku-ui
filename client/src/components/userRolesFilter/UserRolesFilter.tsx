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
import { ChangeEvent, useCallback } from "react";

import { Input, Label } from "reactstrap";
import type { UserRoles } from "./userRolesFilter.types";

type UserRoleKey = keyof UserRoles;

interface UserRolesFilterProps {
  role: UserRoles;
  setUserRole: (role: UserRoles) => void;
}

export default function UserRolesFilter({
  role,
  setUserRole,
}: UserRolesFilterProps) {
  const onChangeUserRoleFilter = useCallback(
    (roleKey: UserRoleKey) => {
      return function onChangeValue(event: ChangeEvent<HTMLInputElement>) {
        setUserRole({
          ...role,
          [roleKey]: event.target.checked,
        });
      };
    },
    [role, setUserRole]
  );

  const items = [
    { title: "Owner", key: "owner" as const },
    { title: "Maintainer", key: "maintainer" as const },
    { title: "Reader", key: "reader" as const },
  ];

  return (
    <div className="input-filter-box">
      <h3 className="filter-label">User Role</h3>
      {items.map(({ key, title }) => (
        <div
          className={cx("form-rk-green", "d-flex", "align-items-center")}
          key={key}
        >
          <Input
            className="form-check-input"
            id={`user-role-${key}`}
            type="checkbox"
            checked={role[key]}
            onChange={onChangeUserRoleFilter(key)}
            data-cy={`user-role-${key}`}
          />
          <Label
            className={cx("form-check-label", "ms-2", "mt-1")}
            for={`user-role-${key}`}
          >
            {title}
          </Label>
        </div>
      ))}
    </div>
  );
}
