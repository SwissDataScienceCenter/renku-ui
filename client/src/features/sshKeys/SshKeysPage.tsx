/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import { FiletypeKey } from "react-bootstrap-icons"; // eslint-disable-line spellcheck/spell-checker
import { Col, Row } from "reactstrap";

import { Loader } from "~/components/Loader";
import LoginAlert from "~/components/loginAlert/LoginAlert";
import { useGetUserQueryState } from "~/features/usersV2/api/users.api";

export default function SshKeysPage() {
  const { data: user, isLoading } = useGetUserQueryState();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Row>
        <Col>
          <h1>
            <FiletypeKey className="me-1" />
            SSH keys
          </h1>
          <SshPageInfo />
        </Col>
      </Row>
      {user?.isLoggedIn && (
        <Row>
          <Col>
            <p>TODO</p>
          </Col>
        </Row>
      )}
    </>
  );
}

function SshPageInfo() {
  const { data: user } = useGetUserQueryState();

  if (!user?.isLoggedIn) {
    return (
      <LoginAlert
        logged={false}
        textIntro="Only authenticated users can add and manage SSH keys."
        textPost="to access this page."
      />
    );
  }

  return <p>Here you can manage your SSH keys.</p>;
}
