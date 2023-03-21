/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  Description.tsx
 *  Description field group component
 */
import * as React from "react";
import FieldGroup from "../../../components/FieldGroups";
import { NewProjectInputs, NewProjectMeta } from "./newProject.d";

interface DescriptionProps {
  handlers: {
    setProperty: Function // eslint-disable-line @typescript-eslint/ban-types
  };
  meta: NewProjectMeta;
  input: NewProjectInputs;
}

function Description({ handlers, meta, input }: DescriptionProps) {
  const error = meta.validation.errors["description"];
  const isInvalid = !!error && !input.descriptionPristine;

  return (
    <FieldGroup
      id="description"
      label="Description"
      type="textarea"
      value={input.description ?? ""}
      help="Let people know what the project is about"
      isRequired={false}
      feedback={error} invalid={isInvalid}
      onChange={(e) => handlers.setProperty("description", e.target.value)} />
  );
}

export default Description;
