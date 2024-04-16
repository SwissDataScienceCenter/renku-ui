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

import { Loader } from "../../components/Loader";
import { useGetSecretsQuery } from "./secrets.api";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import SecretsListItem from "./SecretsListItem";

export default function SecretsList() {
  const secrets = useGetSecretsQuery();

  if (secrets.isLoading) return <Loader />;

  if (secrets.isError)
    return <RtkOrNotebooksError dismissible={false} error={secrets.error} />;

  if (secrets.data?.length === 0) return <p>No secrets found</p>;

  const secretsList = secrets.data?.map((secret) => {
    return (
      <Col key={secret}>
        <SecretsListItem secretName={secret} />
      </Col>
    );
  });
  return (
    <Container className={cx("p-0", "mt-2")} fluid data-cy="cloud-storage-rows">
      <Row className={cx("gy-2", "row-cols-1", "row-cols-lg-2")}>
        {secretsList}
      </Row>
    </Container>
  );
}
