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

import CollapseBody from "~/components/container/CollapseBody";
import { ExternalLink } from "~/components/ExternalLinks";
import { NEW_DOCS_ADMIN_OPERATIONS_REMOTE_SESSIONS } from "~/utils/constants/NewDocs";
import type { RemoteConfiguration } from "../adminComputeResources.types";

const DEFAULT_REMOTE_KIND_VALUE: RemoteConfiguration["kind"] = "firecrest";

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
          <ResourcePoolRemoteKind formPrefix={formPrefix} />

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
        </CollapseBody>
      </Collapse>
    </div>
  );
}

interface ResourcePoolRemoteKindProps {
  formPrefix: string;
}

function ResourcePoolRemoteKind({ formPrefix }: ResourcePoolRemoteKindProps) {
  const inputId = `${formPrefix}Kind`;
  return (
    <div>
      <Label className="mb-1" for={inputId}>
        Kind
      </Label>
      <Input
        id={inputId}
        type="text"
        value={DEFAULT_REMOTE_KIND_VALUE}
        disabled
        readOnly
      />
    </div>
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
            required: (value, formValues) => {
              const remote = formValues[name] as RemoteConfiguration;
              if (!remote.enabled || value) {
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
            required: (value, formValues) => {
              const remote = formValues[name] as RemoteConfiguration;
              if (!remote.enabled || value) {
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
