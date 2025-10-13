/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import {
  type Control,
  Controller,
  type FieldPathByValue,
  type FieldValues,
  useWatch,
} from "react-hook-form";

import { Collapse, FormText, Input, Label } from "reactstrap";
import type { RemoteConfigurationFirecrest } from "../adminComputeResources.types";

const DEFAULT_REMOTE_VALUE: RemoteConfigurationFirecrest = {
  kind: "firecrest",
  providerId: "",
  apiUrl: "",
  systemName: "",
  partition: "",
};

interface ResourcePoolRemoteSectionProps<T extends FieldValues> {
  className?: string;
  control: Control<T>;
  formPrefix: string;
  name: FieldPathByValue<T, RemoteConfigurationFirecrest | undefined>;
}

export default function ResourcePoolRemoteSection<T extends FieldValues>({
  className,
  control,
  formPrefix,
  name,
}: ResourcePoolRemoteSectionProps<T>) {
  const inputId = `${formPrefix}Remote`;
  const remoteWatch = useWatch({ control, name });

  return (
    <div className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <>
            <div className={cx("form-check", "form-switch", "mb-0")}>
              <Input
                id={inputId}
                type="checkbox"
                checked={field.value != null}
                onBlur={field.onBlur}
                disabled={field.disabled}
                name={`${field.name}-switch`}
                ref={field.ref}
                onChange={() => {
                  if (field.value == null) {
                    field.onChange(DEFAULT_REMOTE_VALUE);
                  } else {
                    field.onChange(undefined);
                  }
                }}
              />
              <Label
                className={cx("form-check-label", "ms-2", "mb-0")}
                for={inputId}
              >
                Remote
                <span className={cx("small", "text-muted", "ms-2")}>
                  (Optional)
                </span>
              </Label>
            </div>
          </>
        )}
      />

      <div>
        <FormText>
          See: admin documentation about remote sessions (TODO)
        </FormText>
      </div>

      <Collapse isOpen={remoteWatch != null}>
        <div
          className={cx(
            "border-3",
            "border-dark-subtle",
            "border-start",
            "ms-1",
            "ps-2",
            "d-flex",
            "flex-column",
            "gap-1"
          )}
        >
          <ResourcePoolRemoteKind />

          <ResourcePoolRemoteProviderId
            control={control}
            formPrefix={formPrefix}
            name={name}
          />

          <ResourcePoolRemoteApiUrl
            control={control}
            formPrefix={formPrefix}
            name={name}
          />

          {/* <div className="row">
            <Label for="staticEmail" className="col-sm-2 col-form-label">
              Email
            </Label>
            <div className="col-sm-10">
              <Input
                type="text"
                readonly
                class="form-control-plaintext"
                id="staticEmail"
                value="email@example.com"
              />
            </div>
          </div> */}
        </div>

        <pre>{JSON.stringify(remoteWatch)}</pre>
      </Collapse>
    </div>
  );
}

function ResourcePoolRemoteKind<T extends FieldValues>({}) {
  return <div>Kind</div>;
}

interface ResourcePoolRemoteStringInputProps<T extends FieldValues> {
  control: Control<T>;
  formPrefix: string;
  name: FieldPathByValue<T, RemoteConfigurationFirecrest | undefined>;
}

function ResourcePoolRemoteProviderId<T extends FieldValues>({
  control,
  formPrefix,
  name,
}: ResourcePoolRemoteStringInputProps<T>) {
  const inputId = `${formPrefix}RemoteProviderId`;
  const fieldName = `${name}.providerId` as FieldPathByValue<
    T,
    string | undefined
  >;

  return (
    <div>
      <Label className="mb-1" for={inputId}>
        Provider ID
        <span className={cx("small", "text-muted", "ms-2")}>(Optional)</span>
      </Label>
      <Controller
        control={control}
        name={fieldName}
        render={({ field, fieldState: { error } }) => (
          <>
            <Input
              className={cx("form-control", error && "is-invalid")}
              id={inputId}
              placeholder="Provider ID"
              type="text"
              {...field}
            />
            <div className="invalid-feedback">{error?.message ?? "Hi"}</div>
          </>
        )}
      />
    </div>
  );
}

function ResourcePoolRemoteApiUrl<T extends FieldValues>({
  control,
  formPrefix,
  name,
}: ResourcePoolRemoteStringInputProps<T>) {
  const inputId = `${formPrefix}RemoteApiUrl`;
  const fieldName = `${name}.apiUrl` as FieldPathByValue<T, string>;

  return (
    <div>
      <Label className="mb-1" for={inputId}>
        API URL
      </Label>
      <Controller
        control={control}
        name={fieldName}
        render={({ field, fieldState: { error } }) => (
          <>
            <Input
              className={cx("form-control", error && "is-invalid")}
              id={inputId}
              placeholder="FirecREST API URL"
              type="text"
              {...field}
            />
            <div className="invalid-feedback">{error?.message ?? "Hi"}</div>
          </>
        )}
        rules={{ required: "Please provide a value for the API URL" }}
      />
    </div>
  );
}
