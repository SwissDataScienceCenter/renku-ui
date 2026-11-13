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

// import cx from "classnames";

import { useCallback, useEffect, useMemo } from "react";
import { Controller, FieldValues, UseControllerProps } from "react-hook-form";
import Select, { type GroupBase, type SingleValue } from "react-select";
import { Label } from "reactstrap";

import type { StorageQuota } from "~/features/sessionsV2/api/computeResources.api";
import type { ResourcePoolWithStorageQuotas } from "./useGetStorageQuotasWithResourcePools.hook";

interface StorageQuotaSelectorProps<
  T extends FieldValues,
> extends UseControllerProps<T> {
  resourcePoolsWithStorageQuotas: ResourcePoolWithStorageQuotas[];
}

export default function StorageQuotaSelector<T extends FieldValues>({
  resourcePoolsWithStorageQuotas,
  ...controllerProps
}: StorageQuotaSelectorProps<T>) {
  const defaultValue = useMemo(
    () =>
      resourcePoolsWithStorageQuotas
        .find(({ storageQuotas }) => storageQuotas.length > 0)
        ?.storageQuotas.at(0)?.id,
    [resourcePoolsWithStorageQuotas],
  );

  return (
    <>
      <Label for="project-storage-quota-select-input">Storage Quota</Label>
      <Controller
        {...controllerProps}
        render={({
          field: { onBlur, onChange, value, disabled },
          fieldState: { error },
        }) => (
          <>
            <div
              //   className={cx(error && "is-invalid")}
              data-cy="project-storage-quota-select"
            >
              <StorageQuotaSelect
                defaultValue={defaultValue}
                disabled={disabled}
                name={controllerProps.name}
                onBlur={onBlur}
                onChange={onChange}
                resourcePoolsWithStorageQuotas={resourcePoolsWithStorageQuotas}
                value={value ?? ""}
              />
            </div>
            <div className="invalid-feedback">
              {error?.message ? (
                <>{error.message}</>
              ) : (
                <>Please select a valid storage quota.</>
              )}
            </div>
          </>
        )}
        rules={
          controllerProps.rules ?? {
            required: "Please select a storage quota.",
          }
        }
        // defaultValue={defaultValue as PathValue<T, Path<T>>}
      />
    </>
  );
}

interface StorageQuotaSelectProps {
  defaultValue?: string;
  disabled?: boolean;
  name: string;
  onBlur?: () => void;
  onChange?: (newValue?: string) => void;
  resourcePoolsWithStorageQuotas: ResourcePoolWithStorageQuotas[];
  value: string;
}

function StorageQuotaSelect({
  defaultValue: defaultValue_,
  disabled,
  name,
  onBlur,
  onChange: onChange_,
  resourcePoolsWithStorageQuotas,
  value: value_,
}: StorageQuotaSelectProps) {
  const options = useMemo(
    () => makeGroupedOptions(resourcePoolsWithStorageQuotas),
    [resourcePoolsWithStorageQuotas],
  );
  const defaultValue = useMemo(
    () =>
      options
        .flatMap(({ options }) => options)
        .find(({ id }) => id === defaultValue_),
    [defaultValue_, options],
  );
  const value = useMemo(
    () =>
      options.flatMap(({ options }) => options).find(({ id }) => id === value_),
    [options, value_],
  );

  const onChange = useCallback(
    (newValue: SingleValue<StorageQuota>) => {
      onChange_?.(newValue?.id);
    },
    [onChange_],
  );

  // We need to set the default value by hand here
  useEffect(() => {
    if (onChange_ != null && defaultValue_ && !value_) {
      onChange_(defaultValue_);
    }
  }, [defaultValue_, onChange_, value_]);

  return (
    <Select
      id="project-storage-quota-select"
      inputId="project-storage-quota-select-input"
      name={name}
      isClearable={false}
      isSearchable={false}
      options={options}
      getOptionLabel={(option) => option.storage_flavor_display_name}
      getOptionValue={(option) => option.id}
      onChange={onChange}
      onBlur={onBlur}
      value={value}
      isDisabled={disabled}
      defaultValue={defaultValue}
      //   unstyled
    />
  );
}

interface OptionGroup extends GroupBase<StorageQuota> {
  label: string;
  resourcePool: ResourcePoolWithStorageQuotas;
}

function makeGroupedOptions(
  resourcePools: ResourcePoolWithStorageQuotas[],
): OptionGroup[] {
  return resourcePools.map((resourcePool) => ({
    label: resourcePool.name,
    options: resourcePool.storageQuotas,
    resourcePool,
  }));
}
