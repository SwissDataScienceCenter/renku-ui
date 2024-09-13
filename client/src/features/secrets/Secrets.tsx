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

import { ExternalLink } from "../../components/ExternalLinks";
import { Loader } from "../../components/Loader";
import LoginAlert from "../../components/loginAlert/LoginAlert";
import { User } from "../../model/renkuModels.types";
import useLegacySelector from "../../utils/customHooks/useLegacySelector.hook";
import WipBadge from "../projectsV2/shared/WipBadge";

import GeneralSecretNew from "./GeneralSecretNew";
import SecretsList from "./SecretsList";
import StorageSecretsList from "./StorageSecretsList";
import { SECRETS_DOCS_URL } from "./secrets.utils";

function GeneralSecretSection() {
  return (
    <>
      <Row>
        <Col>
          <div className={cx("d-flex", "justify-content-between")}>
            <h3>General Secrets</h3>
            <GeneralSecretNew />
          </div>
          <p>
            To use general secrets in a session, start a session via “Start with
            Options” in the Session start drop down menu. Then scroll down to
            the User Secrets section and select the secrets you would like to
            include in the session. The secrets you select will be mounted in
            the session as files in a directory of your choice as{" "}
            <code>secret-name</code>.
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <SecretsList kind="general" />
        </Col>
      </Row>
    </>
  );
}

function StorageSecretSection() {
  return (
    <>
      <Row className="mt-5">
        <Col>
          <div className={cx("d-flex", "justify-content-between")}>
            <h3>Storage Secrets</h3>
          </div>
          <p>
            Credentials used to access data sources can be persisted as storage
            secrets. Credentials should be initially entered in the context of a
            project data sources, but the values can be updated here.
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <StorageSecretsList />
        </Col>
      </Row>
    </>
  );
}

function SecretsPageInfo() {
  return (
    <>
      <p>
        Here you can store secrets to use in your sessions. For more
        information, please refer to{" "}
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
  );
}

export default function Secrets() {
  const user = useLegacySelector<User>((state) => state.stateModel.user);

  if (!user.fetched) return <Loader />;

  return (
    <div data-cy="secrets-page">
      <Row>
        <Col>
          <div className={cx("d-flex", "mb-2")}>
            <h2 className={cx("mb-0", "me-2")}>User Secrets</h2>
            <div className="my-auto">
              <WipBadge tooltip="This feature is under development and certain pieces may not work correctly." />
            </div>
          </div>
          <div>
            {!user.logged ? (
              <LoginAlert
                logged={user.logged}
                textIntro="Only authenticated users can create and manage Secrets."
                textPost="to access this page."
              />
            ) : (
              <SecretsPageInfo />
            )}
          </div>
        </Col>
      </Row>
      {user.logged && <GeneralSecretSection />}
      {user.logged && <StorageSecretSection />}
    </div>
  );
}
