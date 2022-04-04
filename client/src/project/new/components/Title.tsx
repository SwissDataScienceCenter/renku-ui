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
 *  Title.js
 *  Project Title field group component
 */
import * as React from "react";
import { ExternalLink } from "../../../utils/components/ExternalLinks";
import FieldGroup from "../../../utils/components/FieldGroups";
import { NewProjectHandlers, NewProjectInputs, NewProjectMeta } from "./newProject.d";

interface TitleProps {
  handlers: NewProjectHandlers;
  meta: NewProjectMeta;
  input: NewProjectInputs;
}

const Title = ({ handlers, meta, input }: TitleProps) => {
  const error = meta.validation.errors["title"];
  const url = "https://docs.gitlab.com/ce/user/reserved_names.html#reserved-project-names";

  const help = (
    <span>A brief name to identify the project. There are a
      few <ExternalLink url={url} title="reserved names" role="link" /> you cannot use
    </span>
  );

  return (
    <FieldGroup
      id="title"
      label="Title"
      data-cy="project-title-input"
      value={input.title ?? ""}
      help={help}
      feedback={error}
      invalid={!!error && !input.titlePristine}
      isRequired={true}
      onChange={(e: any) => handlers.setProperty("title", e.target.value)} />
  );
};

export default Title;
