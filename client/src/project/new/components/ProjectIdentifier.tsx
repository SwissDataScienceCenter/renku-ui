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
 *  ProjectIdentifier.tsx
 *  Identifier form group component.
 */
import React from "react";
import { slugFromTitle } from "../../../utils/helpers/HelperFunctions";
import { FormGroup, Input } from "../../../utils/ts-wrappers";
import { InputHintLabel, InputLabel } from "../../../utils/components/formlabels/FormLabels";
import { NewProjectInputs } from "./newProject.d";

interface ProjectIdentifierProps {
  input: NewProjectInputs;
  isRequired: boolean;
}

const ProjectIdentifier = ({ input, isRequired }: ProjectIdentifierProps) => {
  const namespace = input.namespace ? input.namespace : "<no namespace>";
  const title = input.title ? slugFromTitle(input.title, true) : "<no title>";
  const slug = `${namespace}/${title}`;

  return (
    <FormGroup className="field-group">
      <InputLabel text="Identifier" isRequired={isRequired} />
      <Input id="slug" data-cy="project-slug" readOnly value={slug} />
      <InputHintLabel text="This is automatically derived from Namespace and Title" />
    </FormGroup>
  );
};

export default ProjectIdentifier;
