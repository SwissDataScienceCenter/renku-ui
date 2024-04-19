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
 * limitations under the License
 */

import cx from "classnames";
import { Col, Row } from "reactstrap";

import SecretsList from "./SecretsList";
import SecretNew from "./SecretNew";
import { ExternalLink } from "../../components/ExternalLinks";
import { DOCS_SECRETS_URL } from "./secrets.utils";
import WipBadge from "../projectsV2/shared/WipBadge";

export default function Secrets() {
  return (
    <div data-cy="secrets-page">
      <Row>
        <Col>
          <div className={cx("d-flex", "mb-2")}>
            <h2 className={cx("mb-0", "me-2")}>User Secrets</h2>
            <div className="my-auto">
              <WipBadge />
            </div>
          </div>

          <p>
            Here you can add, edit and remove secrets that you can mount into
            your sessions. Please refer to the{" "}
            <ExternalLink
              role="text"
              iconSup={true}
              iconAfter={true}
              title="documentation page Secrets in RenkuLab"
              url={DOCS_SECRETS_URL}
            />
            .
          </p>
          <p>
            Mind that you will need to click on the &quot;Start with
            options&quot; menu entry on the Start Sessions dropdown button and
            manually select the secrets you want to mount.
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <SecretNew />
        </Col>
      </Row>
      <Row>
        <Col>
          <SecretsList />
        </Col>
      </Row>
    </div>
  );
}
