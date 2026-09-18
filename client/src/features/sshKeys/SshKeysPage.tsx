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

import cx from "classnames";
import { useCallback, useState } from "react";
import { FiletypeKey, PlusLg } from "react-bootstrap-icons"; // eslint-disable-line spellcheck/spell-checker
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  ListGroup,
  Row,
} from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import LoginAlert from "~/components/loginAlert/LoginAlert";
import {
  useGetUserQueryState,
  useGetUserSshKeysQuery,
} from "~/features/usersV2/api/users.api";
import AddSshKeyModal from "./AddSshKeyModal";
import SshKeyItem from "./SshKeyItem";

export default function SshKeysPage() {
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useGetUserQueryState();
  const { isLoading: isLoadingSshKeys, error: sshKeysError } =
    useGetUserSshKeysQuery();

  if (isLoadingUser || isLoadingSshKeys) {
    return <Loader />;
  }
  if (userError) {
    return <RtkOrDataServicesError error={userError} dismissible={false} />;
  }
  if (sshKeysError) {
    return <RtkOrDataServicesError error={sshKeysError} dismissible={false} />;
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
            <SshKeysList />
          </Col>
        </Row>
      )}
    </>
  );
}

function SshPageInfo() {
  // INFO: We handle loading and error on the ancestor component
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

function SshKeysList() {
  // INFO: We handle loading and error on the ancestor component
  const { data: sshKeys } = useGetUserSshKeysQuery();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const toggleAdd = useCallback(() => setIsAddOpen((isOpen) => !isOpen), []);

  const content = !sshKeys ? (
    <p>Unexpected error while loading SSH keys.</p>
  ) : sshKeys.length === 0 ? (
    <p className={cx("mb-0", "text-muted")}>
      You have no SSH keys yet.{" "}
      <Button color="primary" onClick={toggleAdd} size="sm">
        Add your first SSH key
      </Button>
    </p>
  ) : (
    <ListGroup flush>
      {sshKeys.map((sshKey) => (
        <SshKeyItem key={sshKey.id} sshKey={sshKey} />
      ))}
    </ListGroup>
  );

  return (
    <>
      <Card data-cy="ssh-keys-list">
        <CardHeader className={cx("d-flex", "gap-2")}>
          <h2 className={cx("mb-0", "my-auto")}>My SSH keys</h2>
          {sshKeys && <Badge className="my-auto">{sshKeys.length}</Badge>}
          <Button
            aria-label="Add an SSH key"
            className={cx("ms-auto", "my-auto")}
            color="outline-primary"
            data-cy="add-ssh-key-button"
            onClick={toggleAdd}
            size="sm"
            type="button"
          >
            <PlusLg />
          </Button>
        </CardHeader>
        <CardBody>{content}</CardBody>
      </Card>
      <AddSshKeyModal isOpen={isAddOpen} toggle={toggleAdd} />
    </>
  );
}
