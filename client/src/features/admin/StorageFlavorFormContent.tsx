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

import cx from "classnames";
import { Controller, type Control } from "react-hook-form";
import { Input, Label } from "reactstrap";

import type { StorageFlavorForm } from "./adminComputeResources.types";

const STORAGE_FLAVOR_CLASSNAME_MIN_LENGTH = 3;

interface StorageFlavorFormContentProps {
  control: Control<StorageFlavorForm>;
  editMode?: boolean;
  idPrefix: string;
}

export default function StorageFlavorFormContent({
  control,
  editMode,
  idPrefix,
}: StorageFlavorFormContentProps) {
  return (
    <>
      {!editMode && (
        <div className="mb-3">
          <Label for={`${idPrefix}-storage-class-name`}>
            Kubernetes storage class name
          </Label>
          <Controller
            control={control}
            name="k8s_storage_class_name"
            render={({ field, fieldState: { error } }) => (
              <>
                <Input
                  className={cx(error && "is-invalid")}
                  id={`${idPrefix}-storage-class-name`}
                  type="text"
                  {...field}
                />
                <div className="invalid-feedback">
                  {error?.message ||
                    "Please provide a valid value for the Kubernetes storage class name."}
                </div>
              </>
            )}
            rules={{
              required: "Please provide a Kubernetes storage class name.",
              minLength: {
                value: STORAGE_FLAVOR_CLASSNAME_MIN_LENGTH,
                message: `Please provide a Kubernetes storage class name of at least ${STORAGE_FLAVOR_CLASSNAME_MIN_LENGTH} characters.`,
              },
            }}
          />
        </div>
      )}

      <div className="mb-3">
        <Label for={`${idPrefix}-display-name`}>Display name</Label>
        <Controller
          control={control}
          name="display_name"
          render={({ field, fieldState: { error } }) => (
            <>
              <Input
                className={cx(error && "is-invalid")}
                id={`${idPrefix}-display-name`}
                type="text"
                {...field}
              />
              <div className="invalid-feedback">
                {error?.message ||
                  "Please provide a valid value for the storage flavor name."}
              </div>
            </>
          )}
          rules={{
            required: "Please provide a name for the storage flavor.",
          }}
        />
      </div>

      <div className="mb-3">
        <Label for={`${idPrefix}-min-size`}>Minimum size (GB)</Label>
        <Controller
          control={control}
          name="min_size"
          render={({ field, fieldState: { error } }) => (
            <>
              <Input
                className={cx(error && "is-invalid")}
                id={`${idPrefix}-min-size`}
                min={1}
                step={1}
                type="number"
                {...field}
              />
              <div className="invalid-feedback">
                {error?.message ||
                  "Please provide a valid value for the minimum size."}
              </div>
            </>
          )}
          rules={{
            required: "Please provide a value for the minimum size.",
            min: {
              value: 1,
              message: "The minimum size must be greater or equal to 1.",
            },
            validate: {
              integer: (value: unknown) =>
                Number.isInteger(Number(value)) ||
                "Please provide an integer value.",
            },
          }}
        />
      </div>

      <div className="mb-3">
        <Label for={`${idPrefix}-admin-documentation`}>
          Admin documentation (optional)
        </Label>
        <Controller
          control={control}
          name="admin_documentation"
          render={({ field, fieldState: { error } }) => (
            <>
              <Input
                className={cx(error && "is-invalid")}
                id={`${idPrefix}-admin-documentation`}
                type="textarea"
                {...field}
              />
              <div className="invalid-feedback">
                {error?.message ||
                  "Please provide a valid value for the admin documentation."}
              </div>
            </>
          )}
          rules={{ required: false }}
        />
      </div>

      <div className="mb-3">
        <Label for={`${idPrefix}-documentation`}>
          User documentation (optional)
        </Label>
        <Controller
          control={control}
          name="documentation"
          render={({ field, fieldState: { error } }) => (
            <>
              <Input
                className={cx(error && "is-invalid")}
                id={`${idPrefix}-documentation`}
                type="textarea"
                {...field}
              />
              <div className="invalid-feedback">
                {error?.message ||
                  "Please provide a valid value for the user documentation."}
              </div>
            </>
          )}
          rules={{ required: false }}
        />
      </div>
    </>
  );
}
