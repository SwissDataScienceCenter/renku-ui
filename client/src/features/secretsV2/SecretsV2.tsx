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
 * limitations under the License.
 */

import cx from "classnames";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  ListGroup,
  Row,
} from "reactstrap";

import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Loader } from "../../components/Loader";
import LoginAlert from "../../components/loginAlert/LoginAlert";
import type { User } from "../../model/renkuModels.types";
import useLegacySelector from "../../utils/customHooks/useLegacySelector.hook";
import {
  type SecretWithId,
  useGetUserSecretsQuery,
} from "../usersV2/api/users.api";
import { Database, QuestionSquare, ShieldLock } from "react-bootstrap-icons";
import { useMemo } from "react";

export default function SecretsV2() {
  const user = useLegacySelector<User>((state) => state.stateModel.user);

  if (!user.fetched) return <Loader />;

  return (
    <>
      <Row>
        <Col>
          <h2>User Secrets</h2>
          <SecretsPageInfo />
        </Col>
      </Row>
      {user.logged && (
        <div className={cx("d-flex", "flex-column", "gap-4")}>
          <SessionSecrets />
          <DataConnectorSecrets />
          <UnusedSecrets />
        </div>
      )}
    </>
  );
}

function SecretsPageInfo() {
  const userLogged = useLegacySelector<User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  if (!userLogged) {
    return (
      <LoginAlert
        logged={false}
        textIntro="Only authenticated users can create and manage secrets."
        textPost="to access this page."
      />
    );
  }

  return <p>Here you can store secrets to use in your sessions.</p>;
}

function SessionSecrets() {
  const {
    data: secrets,
    isLoading,
    error,
  } = useGetUserSecretsQuery({ userSecretsParams: { kind: "general" } });

  const secretsUsedInSessions = useMemo(
    () =>
      secrets?.filter(
        ({ session_secret_ids }) => session_secret_ids.length > 0
      ),
    [secrets]
  );

  const content = isLoading ? (
    <p>
      <Loader className="me-1" inline size={16} />
      Loading secrets...
    </p>
  ) : error || !secretsUsedInSessions ? (
    <>
      <p>Error: could not load user secrets.</p>
      {error && <RtkOrNotebooksError error={error} dismissible={false} />}
    </>
  ) : (
    <SessionSecretsContent secretsUsedInSessions={secretsUsedInSessions} />
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className={cx("align-items-center", "d-flex")}>
            <h4 className={cx("m-0", "me-2")}>
              <ShieldLock className={cx("me-1", "bi")} />
              Session Secrets
            </h4>
            {secretsUsedInSessions && (
              <Badge>{secretsUsedInSessions.length}</Badge>
            )}
          </div>
        </CardHeader>
        <CardBody className={cx(secretsUsedInSessions?.length == 0 && "pb-0")}>
          {content}
        </CardBody>
      </Card>
    </>
  );
}

interface SessionSecretsContentProps {
  secretsUsedInSessions: SecretWithId[];
}

function SessionSecretsContent({
  secretsUsedInSessions,
}: SessionSecretsContentProps) {
  if (!secretsUsedInSessions.length) {
    return (
      <p className="fst-italic">
        You do not have secrets ready to be used in sessions at the moment.
      </p>
    );
  }

  return (
    <ListGroup flush>
      {/* {sessionSecretSlotsWithSecrets.map((secretSlot) => (
            <SessionSecretSlotItem
              key={secretSlot.secretSlot.id}
              secretSlot={secretSlot}
            />
          ))} */}
    </ListGroup>
  );
}

function DataConnectorSecrets() {
  return (
    <>
      <Card>
        <CardHeader>
          <div className={cx("align-items-center", "d-flex")}>
            <h4 className={cx("m-0", "me-2")}>
              <Database className={cx("me-1", "bi")} />
              Data Connector Secrets
            </h4>
            {/* {secretsUsedInSessions && (
                  <Badge>{secretsUsedInSessions.length}</Badge>
                )} */}
          </div>
        </CardHeader>
        <CardBody
        //  className={cx(secretsUsedInSessions?.length == 0 && "pb-0")}
        >
          TODO: Data Connector Secrets
        </CardBody>
      </Card>
    </>
  );
}

function UnusedSecrets() {
  return (
    <>
      <Card>
        <CardHeader>
          <div className={cx("align-items-center", "d-flex")}>
            <h4 className={cx("m-0", "me-2")}>
              <QuestionSquare className={cx("me-1", "bi")} />
              Unused Secrets
            </h4>
            {/* {secretsUsedInSessions && (
                    <Badge>{secretsUsedInSessions.length}</Badge>
                  )} */}
          </div>
        </CardHeader>
        <CardBody
        //  className={cx(secretsUsedInSessions?.length == 0 && "pb-0")}
        >
          TODO: Unused Secrets
        </CardBody>
      </Card>
    </>
  );
}
