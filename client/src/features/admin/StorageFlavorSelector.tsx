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

import { useCallback, useEffect, useMemo } from "react";
import { Controller, FieldValues, UseControllerProps } from "react-hook-form";
import Select, { SingleValue } from "react-select";
import { Label } from "reactstrap";

import { ErrorAlert } from "~/components/Alert";
import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import type { StorageFlavor } from "../sessionsV2/api/computeResources.api";
import { useGetStorageFlavorsQuery } from "../sessionsV2/api/computeResources.api";

interface StorageFlavorSelectorProps<
  T extends FieldValues,
> extends UseControllerProps<T> {
  idPrefix?: string;
}

export default function StorageFlavorSelector<T extends FieldValues>({
  idPrefix,
  ...controllerProps
}: StorageFlavorSelectorProps<T>) {
  const {
    data: storageFlavors,
    isLoading,
    error,
  } = useGetStorageFlavorsQuery();

  const defaultValue = useMemo(
    () => storageFlavors?.at(0)?.id,
    [storageFlavors],
  );

  if (isLoading) {
    return (
      <>
        <Label>Storage flavor</Label>
        <p className="mb-0">
          <Loader className="me-1" inline size={16} />
          Loading storage flavors...
        </p>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Label>Storage flavor</Label>
        <RtkOrDataServicesError dismissible={false} error={error} />
      </>
    );
  }

  if (storageFlavors == null || storageFlavors.length == 0) {
    return (
      <>
        <Label>Storage flavor</Label>
        <ErrorAlert dismissible={false} timeout={0}>
          No storage flavor has been defined yet.
        </ErrorAlert>
      </>
    );
  }

  return (
    <>
      <Label for={`${idPrefix}-storage-flavor-select-input`}>
        Storage flavor
      </Label>
      <Controller
        {...controllerProps}
        render={({
          field: { onBlur, onChange, value, disabled },
          fieldState: { error },
        }) => (
          <>
            <div data-cy="resource-pool-select">
              <StorageFlavorSelect
                idPrefix={idPrefix}
                defaultValue={defaultValue}
                disabled={disabled}
                name={controllerProps.name}
                onBlur={onBlur}
                onChange={onChange}
                storageFlavors={storageFlavors}
                value={value}
              />
            </div>
            <div className="invalid-feedback">
              {error?.message ? (
                <>{error.message}</>
              ) : (
                <>Please select a valid storage flavor.</>
              )}
            </div>
          </>
        )}
        rules={
          controllerProps.rules ?? {
            required: "Please select a storage flavor.",
          }
        }
      />
    </>
  );
}

interface StorageFlavorSelectProps {
  idPrefix?: string;
  defaultValue?: string;
  disabled?: boolean;
  name: string;
  onBlur?: () => void;
  onChange?: (newValue?: string) => void;
  storageFlavors: StorageFlavor[];
  value: string;
}

function StorageFlavorSelect({
  idPrefix,
  defaultValue: defaultValue_,
  disabled,
  name,
  onBlur,
  onChange: onChange_,
  storageFlavors,
  value: value_,
}: StorageFlavorSelectProps) {
  const defaultValue = useMemo(
    () => storageFlavors.find(({ id }) => id === defaultValue_),

    [defaultValue_, storageFlavors],
  );
  const value = useMemo(
    () => storageFlavors.find(({ id }) => id === value_),
    [storageFlavors, value_],
  );

  const onChange = useCallback(
    (newValue: SingleValue<StorageFlavor>) => {
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
      id={`${idPrefix}-resource-pool-select`}
      inputId={`${idPrefix}-resource-pool-select-input`}
      name={name}
      isClearable={false}
      isSearchable={false}
      options={storageFlavors}
      getOptionLabel={(option) => option.display_name}
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
