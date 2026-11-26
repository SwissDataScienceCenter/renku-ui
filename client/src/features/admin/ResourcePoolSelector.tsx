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
import {
  Controller,
  FieldValues,
  UseControllerProps,
  useWatch,
} from "react-hook-form";
import Select, { SingleValue } from "react-select";
import { Label } from "reactstrap";

import { ErrorAlert, WarnAlert } from "~/components/Alert";
import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import type { ResourcePoolWithId } from "../sessionsV2/api/computeResources.api";
import { useGetResourcePoolsQuery } from "../sessionsV2/api/computeResources.api";

interface ResourcePoolSelectorProps<
  T extends FieldValues,
> extends UseControllerProps<T> {
  idPrefix?: string;
}

export default function ResourcePoolSelector<T extends FieldValues>({
  idPrefix,
  ...controllerProps
}: ResourcePoolSelectorProps<T>) {
  const {
    data: resourcePools,
    isLoading,
    error,
  } = useGetResourcePoolsQuery({});

  const defaultValue = useMemo(
    () =>
      resourcePools?.find((rp) => !rp.public)?.id ?? resourcePools?.at(0)?.id,
    [resourcePools],
  );

  const selectedResourcePoolId = useWatch({
    control: controllerProps.control,
    name: controllerProps.name,
  }) as number;

  const selectedResourcePool = useMemo(
    () => resourcePools?.find(({ id }) => id == selectedResourcePoolId),
    [resourcePools, selectedResourcePoolId],
  );

  if (isLoading) {
    return (
      <>
        <Label>Resource pool</Label>
        <p className="mb-0">
          <Loader className="me-1" inline size={16} />
          Loading resource pools...
        </p>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Label>Resource pool</Label>
        <RtkOrDataServicesError dismissible={false} error={error} />
      </>
    );
  }

  if (resourcePools == null || resourcePools.length == 0) {
    return (
      <>
        <Label>Resource pool</Label>
        <ErrorAlert dismissible={false} timeout={0}>
          No resource pool has been defined yet.
        </ErrorAlert>
      </>
    );
  }

  return (
    <>
      <Label for={`${idPrefix}-resource-pool-select-input`}>
        Resource pool
      </Label>
      <Controller
        {...controllerProps}
        render={({
          field: { onBlur, onChange, value, disabled },
          fieldState: { error },
        }) => (
          <>
            <div data-cy="resource-pool-select">
              <ResourcePoolSelect
                idPrefix={idPrefix}
                defaultValue={defaultValue}
                disabled={disabled}
                name={controllerProps.name}
                onBlur={onBlur}
                onChange={onChange}
                resourcePools={resourcePools}
                value={value}
              />
            </div>
            <div className="invalid-feedback">
              {error?.message ? (
                <>{error.message}</>
              ) : (
                <>Please select a valid resource pool.</>
              )}
            </div>
          </>
        )}
        rules={
          controllerProps.rules ?? {
            required: "Please select a resource pool.",
          }
        }
      />
      {selectedResourcePool?.public && (
        <WarnAlert className="mt-2" dismissible={false} timeout={0}>
          Adding a storage quota to a public pool will allow any user to create
          project storage.
        </WarnAlert>
      )}
    </>
  );
}

interface ResourcePoolSelectProps {
  idPrefix?: string;
  defaultValue?: number;
  disabled?: boolean;
  name: string;
  onBlur?: () => void;
  onChange?: (newValue?: number) => void;
  resourcePools: ResourcePoolWithId[];
  value: number;
}

function ResourcePoolSelect({
  idPrefix,
  defaultValue: defaultValue_,
  disabled,
  name,
  onBlur,
  onChange: onChange_,
  resourcePools,
  value: value_,
}: ResourcePoolSelectProps) {
  const defaultValue = useMemo(
    () => resourcePools.find(({ id }) => id == defaultValue_),

    [defaultValue_, resourcePools],
  );
  const value = useMemo(
    () => resourcePools.find(({ id }) => id == value_),
    [resourcePools, value_],
  );

  const onChange = useCallback(
    (newValue: SingleValue<ResourcePoolWithId>) => {
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
      options={resourcePools}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => `${option.id}`}
      onChange={onChange}
      onBlur={onBlur}
      value={value}
      isDisabled={disabled}
      defaultValue={defaultValue}
      //   unstyled
    />
  );
}
