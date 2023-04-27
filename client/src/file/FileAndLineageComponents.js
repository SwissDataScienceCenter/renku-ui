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

import React from "react";
import { Button, ButtonGroup } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faProjectDiagram } from "@fortawesome/free-solid-svg-icons";

import "../../node_modules/highlight.js/styles/atom-one-light.css";

function FileAndLineageSwitch(props) {
  const performSwitch = () => {
    props.history.push(props.switchToPath);
  };

  return (
    <div className="form-rk-green">
      <ButtonGroup size="sm">
        <Button onClick={performSwitch} active={props.insideFile}>
          <FontAwesomeIcon icon={faFile} />
        </Button>
        <Button onClick={performSwitch} active={!props.insideFile}>
          <FontAwesomeIcon icon={faProjectDiagram} />
        </Button>
      </ButtonGroup>
    </div>
  );
}

export { FileAndLineageSwitch };
