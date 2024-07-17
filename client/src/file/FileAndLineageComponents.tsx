/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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

import { useRef } from "react";
import { Button, ButtonGroup, UncontrolledTooltip } from "reactstrap";
import { FileEarmarkFill, Diagram2 } from "react-bootstrap-icons";

import "../../node_modules/highlight.js/styles/atom-one-light.css";
import { useHistory } from "react-router-dom";

interface FileAndLineageSwitchProps {
  switchToPath: string;
  insideFile: boolean;
}
export default function FileAndLineageSwitch({
  switchToPath,
  insideFile,
}: FileAndLineageSwitchProps) {
  const fileIconRef = useRef(null);
  const lineageIconRef = useRef(null);
  const history = useHistory();

  const performSwitch = () => {
    history.push(switchToPath);
  };

  return (
    <div className="form-rk-green">
      <ButtonGroup size="sm">
        <Button
          onClick={performSwitch}
          active={insideFile}
          innerRef={fileIconRef}
        >
          <FileEarmarkFill className="bi" />
        </Button>
        <UncontrolledTooltip target={fileIconRef}>
          File content view
        </UncontrolledTooltip>
        <Button
          innerRef={lineageIconRef}
          onClick={performSwitch}
          active={!insideFile}
        >
          <Diagram2 className="bi" />
        </Button>
        <UncontrolledTooltip target={lineageIconRef}>
          File lineage view
        </UncontrolledTooltip>
      </ButtonGroup>
    </div>
  );
}
