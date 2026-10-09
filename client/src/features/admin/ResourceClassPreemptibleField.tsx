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
import { FormText, Input, Label } from "reactstrap";

import type { ResourceClassForm } from "./adminComputeResources.types";

interface ResourceClassPreemptibleFieldProps {
  control: Control<ResourceClassForm>;
  idPrefix: string;
}

export default function ResourceClassPreemptibleField({
  control,
  idPrefix,
}: ResourceClassPreemptibleFieldProps) {
  return (
    <div className="mb-3">
      <Controller
        control={control}
        name="preemptible"
        render={({ field }) => (
          <div className="form-check">
            <Input
              className="form-check-input"
              id={`${idPrefix}Preemptible`}
              type="checkbox"
              checked={field.value}
              innerRef={field.ref}
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
            <Label
              className={cx("form-check-label", "ms-2")}
              for={`${idPrefix}Preemptible`}
            >
              Preemptible
            </Label>
          </div>
        )}
      />
      <FormText>
        Sessions and jobs in this class have a low priority. Other sessions can
        stop them to get resources. Use this for classes on spot nodes.
      </FormText>
    </div>
  );
}
