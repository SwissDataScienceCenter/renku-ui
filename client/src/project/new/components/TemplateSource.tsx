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

import { Button, ButtonGroup, FormGroup } from "reactstrap";

import { InputLabel } from "../../../components/formlabels/FormLabels";
import { NewProjectInputs } from "./newProject.types";

interface TemplateSourceProps {
  handlers: {
    setProperty: Function; // eslint-disable-line @typescript-eslint/ban-types
  };
  input: NewProjectInputs;
  isRequired: boolean;
}

const TemplateSource = ({
  handlers,
  input,
  isRequired,
}: TemplateSourceProps) => {
  return (
    <FormGroup className="field-group">
      <InputLabel text="Template source" isRequired={isRequired} />
      <br />
      <ButtonGroup size="sm">
        <Button
          active={!input.userRepo}
          data-cy="renkulab-source-button"
          onClick={() => handlers.setProperty("userRepo", false)}
        >
          RenkuLab
        </Button>
        <Button
          active={!!input.userRepo}
          data-cy="custom-source-button"
          onClick={() => handlers.setProperty("userRepo", true)}
        >
          Custom
        </Button>
      </ButtonGroup>
    </FormGroup>
  );
};

export default TemplateSource;
