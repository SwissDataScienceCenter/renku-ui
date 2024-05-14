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
import { SECRETS_DOCS_URL } from "./secrets.utils";
import WipBadge from "../projectsV2/shared/WipBadge";
import useLegacySelector from "../../utils/customHooks/useLegacySelector.hook";
import { User } from "../../model/renkuModels.types";
import { Loader } from "../../components/Loader";
import LoginAlert from "../../components/loginAlert/LoginAlert";

export default function Secrets() {
  const user = useLegacySelector<User>((state) => state.stateModel.user);

  if (!user.fetched) return <Loader />;

  const pageInfo = user.logged ? (
    <>
      <p>Here you can store secrets to use in your sessions.</p>

      <p>
        To use secrets in a session, start a session via “Start with Options” in
        the Session start drop down menu. Then scroll down to the User Secrets
        section and select the secrets you would like to include in the session.
        The secrets you select will be mounted in the session as files in a
        directory of your choice as <code>secret-name</code>.
      </p>
      <p>
        For more information, please refer to{" "}
        <ExternalLink
          role="text"
          iconSup={true}
          iconAfter={true}
          title="our documentation"
          url={SECRETS_DOCS_URL}
        />
        .
      </p>
    </>
  ) : (
    <>
      <LoginAlert
        logged={user.logged}
        textIntro="Only authenticated users can create and manage Secrets."
        textPost="to access this page."
      />
    </>
  );

  return (
    <div data-cy="secrets-page">
      <Row>
        <Col>
          <div className={cx("d-flex", "mb-2")}>
            <h2 className={cx("mb-0", "me-2")}>User Secrets</h2>
            <div className="my-auto">
              <WipBadge text="This feature is under development and certain pieces may not work correctly." />
            </div>
          </div>
          <div>{pageInfo}</div>
        </Col>
      </Row>
      {user.logged && (
        <>
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
        </>
      )}
    </div>
  );
}
