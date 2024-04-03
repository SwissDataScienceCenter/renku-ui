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

import type { FieldValues } from "react-hook-form";

import SlugFormField from "./SlugFormField";
import type { GenericProjectFormFieldProps } from "./formField.types";

export default function ProjectSlugFormField<T extends FieldValues>({
  control,
  errors,
  name,
}: GenericProjectFormFieldProps<T>) {
  return (
    <SlugFormField
      control={control}
      entityName="project"
      errors={errors}
      name={name}
    />
  );
}
