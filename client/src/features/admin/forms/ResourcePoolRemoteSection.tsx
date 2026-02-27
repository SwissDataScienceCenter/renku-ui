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
  Controller,
  useWatch,
  type Control,
  type FieldPathByValue,
  type FieldValues,
} from "react-hook-form";
import { Collapse, FormText, Input, Label } from "reactstrap";

import CollapseBody from "~/components/container/CollapseBody";
import { ExternalLink } from "~/components/LegacyExternalLinks";
import { NEW_DOCS_ADMIN_OPERATIONS_REMOTE_SESSIONS } from "~/utils/constants/NewDocs";
import type { RemoteConfiguration } from "../adminComputeResources.types";

interface ResourcePoolRemoteSectionProps<T extends FieldValues> {
  className?: string;
  control: Control<T>;
  formPrefix: string;
  name: FieldPathByValue<T, RemoteConfiguration>;
}

export default function ResourcePoolRemoteSection<T extends FieldValues>({
  className,
  control,
  formPrefix,
  name,
}: ResourcePoolRemoteSectionProps<T>) {
  const inputId = `${formPrefix}Remote`;
  const remoteEnabled = `${name}.enabled` as FieldPathByValue<T, boolean>;
  const remoteEnabledWatch = useWatch({ control, name: remoteEnabled });
  const remoteKindWatch = useWatch({
    control,
    name: `${name}.kind` as FieldPathByValue<T, RemoteConfiguration["kind"]>,
  });

  return (
    <div className={className}>
      <Controller
        control={control}
        name={remoteEnabled}
        render={({ field }) => (
          <>
            <div className={cx("form-check", "form-switch", "mb-0")}>
              <Input
                id={inputId}
                type="checkbox"
                checked={field.value}
                {...field}
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
          See:{" "}
          <ExternalLink
            role="text"
            showLinkIcon
            iconAfter
            title="admin documentation about remote sessions"
            url={NEW_DOCS_ADMIN_OPERATIONS_REMOTE_SESSIONS}
          />
        </FormText>
      </div>

      <Collapse isOpen={remoteEnabledWatch}>
        <CollapseBody className={cx("d-flex", "flex-column", "gap-1")}>
          <ResourcePoolRemoteKind
            control={control}
            formPrefix={formPrefix}
            name={name}
          />

          {remoteKindWatch === "firecrest" && (
            <ResourcePoolRemoteSectionFirecrest
              control={control}
              formPrefix={formPrefix}
              name={
                `${name}.firecrestConfiguration` as FieldPathByValue<
                  T,
                  RemoteConfiguration
                >
              }
            />
          )}
          {remoteKindWatch === "runai" && (
            <ResourcePoolRemoteSectionRunai
              control={control}
              formPrefix={formPrefix}
              name={
                `${name}.runaiConfiguration` as FieldPathByValue<
                  T,
                  RemoteConfiguration
                >
              }
            />
          )}
        </CollapseBody>
      </Collapse>
    </div>
  );
}

interface ResourcePoolRemoteKindProps<T extends FieldValues> {
  control: Control<T>;
  formPrefix: string;
  name: FieldPathByValue<T, RemoteConfiguration>;
}

function ResourcePoolRemoteKind<T extends FieldValues>({
  control,
  formPrefix,
  name,
}: ResourcePoolRemoteKindProps<T>) {
  const inputId = `${formPrefix}Kind`;
  const fieldName = `${name}.kind` as FieldPathByValue<
    T,
    RemoteConfiguration["kind"]
  >;

  const kindOptions: {
    value: RemoteConfiguration["kind"];
    label: string;
  }[] = [
    { value: null, label: "None" },
    { value: "firecrest", label: "Firecrest" },
    { value: "runai", label: "Run:AI" },
  ];

  return (
    <div>
      <Label className="mb-1">Kind</Label>
      <Controller
        control={control}
        name={fieldName}
        render={({ field }) => (
          <div className={cx("d-flex", "gap-3")}>
            {kindOptions.map(({ value, label }) => (
              <div key={label} className="form-check">
                <Input
                  id={`${inputId}-${value ? value : "none"}`}
                  type="radio"
                  checked={field.value === value}
                  onChange={() => field.onChange(value)}
                />
                <Label
                  className={cx("form-check-label", "ms-2")}
                  for={`${inputId}-${value ? value : "none"}`}
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        )}
      />
    </div>
  );
}

function ResourcePoolRemoteSectionFirecrest<T extends FieldValues>({
  control,
  formPrefix,
  name,
}: ResourcePoolRemoteKindProps<T>) {
  return (
    <>
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

      <ResourcePoolRemoteSystemName
        control={control}
        formPrefix={formPrefix}
        name={name}
      />

      <ResourcePoolRemotePartition
        control={control}
        formPrefix={formPrefix}
        name={name}
      />
    </>
  );
}

function ResourcePoolRemoteSectionRunai<T extends FieldValues>({
  control,
  formPrefix,
  name,
}: ResourcePoolRemoteKindProps<T>) {
  return (
    <>
      <ResourcePoolRemoteBaseUrl
        control={control}
        formPrefix={formPrefix}
        name={name}
      />
    </>
  );
}

interface ResourcePoolRemoteStringInputProps<T extends FieldValues> {
  control: Control<T>;
  formPrefix: string;
  name: FieldPathByValue<T, RemoteConfiguration>;
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
              className={cx(error && "is-invalid")}
              id={inputId}
              placeholder="Provider ID"
              type="text"
              {...field}
              value={field.value ?? ""}
            />
            <div className="invalid-feedback">
              {error?.message ??
                "Please provide a valid value for provider ID."}
            </div>
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
              className={cx(error && "is-invalid")}
              id={inputId}
              placeholder="FirecREST API URL" // eslint-disable-line spellcheck/spell-checker
              type="text"
              {...field}
              value={field.value ?? ""}
            />
            <div className="invalid-feedback">
              {error?.message ?? "Please provide a valid value for API URL."}
            </div>
          </>
        )}
        rules={{
          validate: {
            required: (value) => {
              if (value) {
                return true;
              }
              return "Please provide a value for the API URL.";
            },
          },
        }}
      />
    </div>
  );
}

function ResourcePoolRemoteBaseUrl<T extends FieldValues>({
  control,
  formPrefix,
  name,
}: ResourcePoolRemoteStringInputProps<T>) {
  const inputId = `${formPrefix}RemoteBaseUrl`;
  const fieldName = `${name}.baseUrl` as FieldPathByValue<T, string>;

  return (
    <div>
      <Label className="mb-1" for={inputId}>
        Base URL
      </Label>
      <Controller
        control={control}
        name={fieldName}
        render={({ field, fieldState: { error } }) => (
          <>
            <Input
              className={cx(error && "is-invalid")}
              id={inputId}
              placeholder="Run:AI Base URL" // eslint-disable-line spellcheck/spell-checker
              type="text"
              {...field}
              value={field.value ?? ""}
            />
            <div className="invalid-feedback">
              {error?.message ?? "Please provide a valid value for Base URL."}
            </div>
          </>
        )}
        rules={{
          validate: {
            required: (value) => {
              if (!value || value.trim().length < 1)
                return "Please provide a value for the Base URL.";
              return true;
            },
          },
        }}
      />
    </div>
  );
}

function ResourcePoolRemoteSystemName<T extends FieldValues>({
  control,
  formPrefix,
  name,
}: ResourcePoolRemoteStringInputProps<T>) {
  const inputId = `${formPrefix}SystemName`;

  const fieldName = `${name}.systemName` as FieldPathByValue<T, string>;

  return (
    <div>
      <Label className="mb-1" for={inputId}>
        System Name
      </Label>
      <Controller
        control={control}
        name={fieldName}
        render={({ field, fieldState: { error } }) => (
          <>
            <Input
              className={cx(error && "is-invalid")}
              id={inputId}
              placeholder='System name, e.g. "eiger"' // eslint-disable-line spellcheck/spell-checker
              type="text"
              {...field}
              value={field.value ?? ""}
            />
            <div className="invalid-feedback">
              {error?.message ??
                "Please provide a valid value for system name."}
            </div>
          </>
        )}
        rules={{
          validate: {
            required: (value) => {
              if (value) {
                return true;
              }
              return "Please provide a value for the system name.";
            },
          },
        }}
      />
    </div>
  );
}

function ResourcePoolRemotePartition<T extends FieldValues>({
  control,
  formPrefix,
  name,
}: ResourcePoolRemoteStringInputProps<T>) {
  const inputId = `${formPrefix}Partition`;
  const fieldName = `${name}.partition` as FieldPathByValue<
    T,
    string | undefined
  >;

  return (
    <div>
      <Label className="mb-1" for={inputId}>
        Partition
        <span className={cx("small", "text-muted", "ms-2")}>(Optional)</span>
      </Label>
      <Controller
        control={control}
        name={fieldName}
        render={({ field, fieldState: { error } }) => (
          <>
            <Input
              className={cx(error && "is-invalid")}
              id={inputId}
              placeholder='SLURM partition, e.g. "normal"'
              type="text"
              {...field}
              value={field.value ?? ""}
            />
            <div className="invalid-feedback">
              {error?.message ?? "Please provide a valid value for partition."}
            </div>
          </>
        )}
      />
    </div>
  );
}
