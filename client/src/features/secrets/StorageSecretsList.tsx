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
import { Col, Container, Row } from "reactstrap";

import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Loader } from "../../components/Loader";
import { useGetUserSecretsQuery } from "../usersV2/api/users.api";
import type { SecretDetails } from "./secrets.types";
import { storageSecretNameToStorageId } from "./secrets.utils";
import SecretsListItem from "./SecretsListItem";

interface SecretGroupProps {
  group: string;
  secrets: SecretDetails[];
}
function SecretGroup({ group, secrets }: SecretGroupProps) {
  return (
    <>
      <Row className="g-2">
        <Col>
          <h5>{group}</h5>
        </Col>
      </Row>
      <Row className={cx("g-2", "row-cols-1", "row-cols-xl-2")}>
        {secrets.map((secret) => (
          <Col key={secret.id}>
            <SecretsListItem kind="storage" secret={secret} />
          </Col>
        ))}
      </Row>
    </>
  );
}

export default function StorageSecretsList() {
  const secrets = useGetUserSecretsQuery({
    userSecretsParams: { kind: "storage" },
  });

  if (secrets.isLoading) return <Loader />;

  if (secrets.isError)
    return <RtkOrNotebooksError dismissible={false} error={secrets.error} />;

  if (secrets.data == null || secrets.data?.length === 0) return null;
  const secretsGroups = secrets.data.reduce((acc, secret) => {
    const group = storageSecretNameToStorageId(secret);
    if (group in acc) {
      acc[group].push(secret);
    } else {
      acc[group] = [secret];
    }
    return acc;
  }, {} as Record<string, SecretDetails[]>);

  return (
    <Container className={cx("p-0", "mt-2")} data-cy="secrets-list" fluid>
      {Object.entries(secretsGroups).map(([group, secrets]) => (
        <SecretGroup key={group} group={group} secrets={secrets} />
      ))}
    </Container>
  );
}
