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
 *  Visibility.js
 *  Visibility field group component
 */
import React from "react";
import VisibilityInput from "../../../utils/components/visibility/Visibility";
import { FormGroup } from "reactstrap/lib";
import { NewProjectHandlers, NewProjectInputs, NewProjectMeta } from "./newProject.d";

interface VisibilityProps {
  handlers: NewProjectHandlers;
  meta: NewProjectMeta;
  input: NewProjectInputs;
}

const Visibility = ({ handlers, meta, input }: VisibilityProps) => {
  const error = meta.validation.errors["visibility"];

  return (
    <FormGroup className="field-group">
      <VisibilityInput
        isLoadingData={meta.namespace.fetching || !meta.namespace.visibilities || !input.visibility}
        namespaceVisibility={meta.namespace.visibility}
        isInvalid={!!error && !input.visibilityPristine}
        data-cy="visibility-select"
        isRequired={true}
        onChange={(value: string) => handlers.setProperty("visibility", value)}
        value={input.visibility ?? null} />
    </FormGroup>
  );
};

export default Visibility;
