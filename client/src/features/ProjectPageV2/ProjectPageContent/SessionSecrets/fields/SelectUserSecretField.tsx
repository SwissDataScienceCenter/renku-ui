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
import { Controller, type FieldValues } from "react-hook-form";
import Select, { type ClassNamesConfig } from "react-select";

import { Input, Label } from "reactstrap";
import { Loader } from "../../../../../components/Loader";
import { RtkOrNotebooksError } from "../../../../../components/errors/RtkErrorAlert";
import {
  type SecretWithId,
  useGetUserSecretsQuery,
} from "../../../../usersV2/api/users.api";
import type { SessionSecretFormFieldProps } from "./fields.types";

import styles from "./SelectUserSecretField.module.scss";

type SelectUserSecretFieldProps<T extends FieldValues> =
  SessionSecretFormFieldProps<T>;

export default function SelectUserSecretField<T extends FieldValues>({
  control,
  errors,
  name,
}: SelectUserSecretFieldProps<T>) {
  const {
    data: userSecrets,
    isLoading,
    error,
  } = useGetUserSecretsQuery({ userSecretsParams: { kind: "general" } });

  const content = isLoading ? (
    <p>
      <Loader inline className="me-1" size={16} />
      Loading user secrets...
    </p>
  ) : error || userSecrets == null ? (
    <>
      <p>Error: could not load user secrets.</p>
      {error && <RtkOrNotebooksError error={error} dismissible={false} />}
    </>
  ) : userSecrets.length < 1 ? (
    <p className="fst-italic">
      You do not have any user secret saved at the moment.
    </p>
  ) : (
    <UserSecretSelector
      control={control}
      errors={errors}
      name={name}
      userSecrets={userSecrets}
    />
  );

  return (
    <div className="mb-3">
      {content}

      {/* NOTE: This allows to prevent sending a request when there is no valid user secret picked. */}
      <Controller
        name={name}
        control={control}
        render={({ field: { ref, ...rest } }) => (
          <Input
            className={cx(errors[name] && "is-invalid")}
            type="hidden"
            innerRef={ref}
            {...rest}
          />
        )}
        rules={{ required: "Please pick an existing user secret" }}
      />
      <div className="invalid-feedback">
        {errors[name]?.message ? (
          <>{errors[name]?.message}</>
        ) : (
          <>Invalid user secret</>
        )}
      </div>
    </div>
  );
}

interface UserSecretSelectorProps<T extends FieldValues>
  extends SelectUserSecretFieldProps<T> {
  userSecrets: SecretWithId[];
}

function UserSecretSelector<T extends FieldValues>({
  control,
  name,
  userSecrets,
}: UserSecretSelectorProps<T>) {
  return (
    <>
      <Label>User secret</Label>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ...rest } }) => (
          <Select
            classNames={selectClassNames}
            getOptionValue={(option) => option.id}
            getOptionLabel={(option) => option.name}
            isClearable={false}
            options={userSecrets}
            onChange={(newValue) => {
              onChange(newValue?.id);
            }}
            unstyled
            value={userSecrets.find(({ id }) => id === value)}
            {...rest}
          />
        )}
      />
    </>
  );
}

const selectClassNames: ClassNamesConfig<SecretWithId, false> = {
  control: ({ menuIsOpen }) =>
    cx(
      menuIsOpen ? "rounded-top" : "rounded",
      "bg-white",
      "border",
      "cursor-pointer",
      styles.control
    ),
  dropdownIndicator: () => cx("pe-3"),
  input: () => cx("px-3"),
  menu: () => cx("bg-white", "rounded-bottom", "border", "border-top-0"),
  menuList: () => cx("d-grid", "gap-2"),
  option: ({ isFocused, isSelected }) =>
    cx(
      "px-3",
      "py-2",
      styles.option,
      isFocused && styles.optionIsFocused,
      !isFocused && isSelected && styles.optionIsSelected
    ),
  placeholder: () => cx("px-3"),
  singleValue: () => cx("px-3"),
};
