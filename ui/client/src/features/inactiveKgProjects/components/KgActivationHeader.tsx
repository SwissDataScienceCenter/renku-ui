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

import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UncontrolledTooltip } from "reactstrap";

import { WarnAlert } from "../../../components/Alert";
import { ExternalLink } from "../../../components/ExternalLinks";
import { Docs } from "../../../utils/constants/Docs";

interface KgActivationHeaderProps {
  isActivationSlow: boolean | null;
}
function KgActivationHeader({ isActivationSlow }: KgActivationHeaderProps) {
  const showWarning = isActivationSlow === true;
  const docKg = Docs.rtdTopicGuide("miscellaneous/knowledge-graph.html");
  const tooltip = (
    <>
      Indexing captures the relationships between projects, datasets, metadata,
      and more.
      <br />
      <ExternalLink
        url={docKg}
        size="sm"
        role="link"
        className="link-rk-white"
        title="Learn more about indexing"
      />
    </>
  );

  return (
    <>
      <h1 className="activationHeader d-flex gap-2 my-3 align-items-center">
        Projects requiring indexing
        <FontAwesomeIcon
          id="activation-question"
          className="cursor-pointer"
          size="sm"
          icon={faQuestionCircle}
        />
      </h1>
      <UncontrolledTooltip target="activation-question" autohide={false}>
        {tooltip}
      </UncontrolledTooltip>
      {showWarning && (
        <WarnAlert timeout={0} dismissible={false}>
          <p>
            <strong>Indexing is progressing slowly.</strong> Refresh this page
            or check the project later to see if indexing has completed, or
            contact us for help.
          </p>
        </WarnAlert>
      )}
    </>
  );
}

export default KgActivationHeader;
