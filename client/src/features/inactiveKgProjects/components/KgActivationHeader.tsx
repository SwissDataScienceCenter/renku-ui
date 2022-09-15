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

import { ExternalLink } from "../../../utils/components/ExternalLinks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { ThrottledTooltip } from "../../../utils/components/Tooltip";
import React from "react";

function KgActivationHeader() {
  const docKg = "https://renku.readthedocs.io/en/latest/topic-guides/knowledge-graph.html";
  const tooltip = (
    <>
      The Renku Knowledge Graph captures the relationships between projects, datasets, metadata, and more.<br/>
      <ExternalLink url={docKg} size="sm" role="link" className="link-rk-white"
        title="Learn more about the Renku Knowledge Graph" />
    </>
  );

  return (
    <>
      <h1 className="activationHeader d-flex gap-2 my-3 align-items-center">
        Projects Inactive in the Knowledge Graph
        <FontAwesomeIcon id="activation-question" className="cursor-pointer" size="sm" icon={faQuestionCircle} />
      </h1>
      <ThrottledTooltip
        target="activation-question"
        tooltip={tooltip} />
    </>
  );
}

export default KgActivationHeader;
