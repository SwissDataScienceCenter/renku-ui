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
import { ChevronDown } from "react-bootstrap-icons";
import { Controller, type FieldValues } from "react-hook-form";
import Select, {
  components,
  type ClassNamesConfig,
  type GroupBase,
  type SelectComponentsConfig,
} from "react-select";
import { Input, Label } from "reactstrap";

import { RtkOrNotebooksError } from "../../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../../components/Loader";
import {
  useGetUserSecretsQuery,
  type SecretWithId,
} from "../../../../usersV2/api/users.api";
import type { SessionSecretFormFieldProps } from "./fields.types";

import styles from "./SelectUserSecretField.module.scss";

interface SelectUserSecretFieldProps<T extends FieldValues>
  extends SessionSecretFormFieldProps<T> {
  formId?: string;
}

export default function SelectUserSecretField<T extends FieldValues>({
  control,
  errors,
  formId,
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
      You do not have any user secrets saved at the moment.
    </p>
  ) : (
    <UserSecretSelector
      control={control}
      errors={errors}
      formId={formId}
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
  formId,
  name,
  userSecrets,
}: UserSecretSelectorProps<T>) {
  const fieldIdSuffix = `session-secret-${name}`;
  const fieldId = formId ? `${formId}-${fieldIdSuffix}` : fieldIdSuffix;

  return (
    <>
      <Label for={fieldId}>User secret</Label>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ...rest } }) => (
          <div data-cy="session-secret-select-user-secret">
            <Select
              classNames={selectClassNames}
              classNamePrefix="session-secret-select-user-secret"
              components={selectComponents}
              getOptionValue={(option) => option.id}
              getOptionLabel={(option) => option.name}
              inputId="session-secret-select-user-secret"
              isClearable={false}
              options={userSecrets}
              onChange={(newValue) => {
                onChange(newValue?.id);
              }}
              unstyled
              value={userSecrets.find(({ id }) => id === value)}
              {...rest}
            />
          </div>
        )}
      />
    </>
  );
}

const selectClassNames: ClassNamesConfig<SecretWithId, false> = {
  control: ({ menuIsOpen, isFocused }) =>
    cx(
      menuIsOpen ? "rounded-top" : "rounded",
      "border",
      "cursor-pointer",
      isFocused && "border-primary-subtle"
      // styles.control
    ),
  dropdownIndicator: () => cx("pe-3"),
  input: () => cx("px-3"),
  menu: () =>
    cx(
      "bg-white",
      "rounded-bottom",
      "border",
      "border-top-0",
      "border-primary-subtle"
    ),
  menuList: () => cx("d-grid"),
  option: ({ isFocused, isSelected }) =>
    cx(
      "px-3",
      "py-2",
      "cursor-pointer",
      styles.option,
      isFocused && styles.optionIsFocused,
      !isFocused && isSelected && styles.optionIsSelected
    ),
  placeholder: () => cx("px-3"),
  singleValue: () => cx("px-3"),
};

const selectComponents: SelectComponentsConfig<
  SecretWithId,
  false,
  GroupBase<SecretWithId>
> = {
  DropdownIndicator: (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <ChevronDown className="bi" />
      </components.DropdownIndicator>
    );
  },
};
