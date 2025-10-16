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
} from "react-hook-form";
import { FormText, Input, Label } from "reactstrap";

import { ExternalLink } from "~/components/ExternalLinks";
import { NEW_DOCS_ADMIN_OPERATIONS_REMOTE_CLUSTERS } from "~/utils/constants/NewDocs";

const DEFAULT_ERROR_MESSAGE =
  "Please provide a valid Cluster ID or leave empty.";

interface ResourcePoolClusterIdInputProps<T extends FieldValues> {
  className?: string;
  control: Control<T>;
  formPrefix: string;
  name: FieldPathByValue<T, string>;
}

export default function ResourcePoolClusterIdInput<T extends FieldValues>({
  className,
  control,
  formPrefix,
  name,
}: ResourcePoolClusterIdInputProps<T>) {
  const inputId = `${formPrefix}ClusterId`;

  return (
    <div className={className}>
      <Label for={inputId}>
        Cluster ID
        <span className={cx("small", "text-muted", "ms-2")}>(Optional)</span>
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState: { error } }) => (
          <>
            <Input
              className={cx("form-control", error && "is-invalid")}
              id={inputId}
              placeholder="Remote cluster ID"
              type="text"
              {...field}
            />
            <div className="invalid-feedback">
              {error?.message ?? DEFAULT_ERROR_MESSAGE}
            </div>
          </>
        )}
        rules={{
          validate: (value) => {
            if (value == null) {
              return true;
            }
            if (typeof value !== "string") {
              return `Invalid type for Cluster ID: ${typeof value}.`;
            }
            const value_: string = value;
            if (value_.trim() === "") {
              return true;
            }
            if (value_.trim().length != 26) {
              return "Cluster ID should have exactly 26 characters.";
            }
            return true;
          },
        }}
      />

      <FormText>
        See:{" "}
        <ExternalLink
          role="text"
          showLinkIcon
          iconAfter
          title="admin documentation about remote clusters"
          url={NEW_DOCS_ADMIN_OPERATIONS_REMOTE_CLUSTERS}
        />
      </FormText>
    </div>
  );
}
