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

import { useState } from "react";
import type {
  FieldValues,
  UseFormGetValues,
  UseFormWatch,
} from "react-hook-form";

import SlugFormField from "./SlugFormField";
import type { GenericProjectFormFieldProps } from "./formField.types";
import { Button } from "reactstrap";

interface ProjectOwnerSlugFormFieldProps<T extends FieldValues>
  extends GenericProjectFormFieldProps<T> {
  getValues: UseFormGetValues<T>;
  namespaceName: GenericProjectFormFieldProps<T>["name"];
  watch: UseFormWatch<T>;
}

export default function ProjectOwnerSlugFormField<T extends FieldValues>({
  control,
  errors,
  formId,
  getValues,
  name,
  namespaceName,
  watch,
}: ProjectOwnerSlugFormFieldProps<T>) {
  const [configure, setConfigure] = useState(false);
  if (configure) {
    return (
      <div className="mb-3">
        <SlugFormField
          control={control}
          entityName={`${formId}-project`}
          errors={errors}
          name={name}
        />
      </div>
    );
  }
  const slug = watch(name);
  return (
    <div className="mb-3">
      The identifier for the copy will be{" "}
      <i>
        {getValues(namespaceName)}/{slug}
      </i>
      .{" "}
      <Button size="sm" color="link" onClick={() => setConfigure(true)}>
        Configure
      </Button>
    </div>
  );
}
