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
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Container,
  Row,
} from "reactstrap";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Loader } from "../../components/Loader";
import { useGetProvidersQuery } from "../connectedServices/connectedServices.api";
import {
  Provider,
  ProviderList,
} from "../connectedServices/connectedServices.types";
import AddConnectedServiceButton from "./AddConnectedServiceButton";

export default function ConnectedServicesSection() {
  return (
    <section className="mt-5">
      <h2 className="fs-5">Connected Services - Renku 2.0</h2>
      <ConnectedServices />
    </section>
  );
}

function ConnectedServices() {
  const { data: providers, isLoading, error } = useGetProvidersQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <RtkOrNotebooksError error={error} />;
  }

  return (
    <div>
      <div className="mb-2">
        <AddConnectedServiceButton />
      </div>
      <div>
        <ConnectedServicesList providers={providers} />
      </div>
    </div>
  );
}

interface ConnectedServicesListProps {
  providers?: ProviderList;
}
function ConnectedServicesList({ providers }: ConnectedServicesListProps) {
  if (!providers || providers.length === 0) {
    return <p>No connected services</p>;
  }
  return (
    <Container className="px-0" fluid>
      <Row className="gy-4">
        {providers.map((provider) => (
          <ConnectedService key={provider.id} provider={provider} />
        ))}
      </Row>
    </Container>
  );
}

interface ConnectedServiceProps {
  provider: Provider;
}
function ConnectedService({ provider }: ConnectedServiceProps) {
  return (
    <Col className={cx("col-12", "col-sm-6")}>
      <Card>
        <CardBody>
          <CardTitle className={cx("mb-2", "fs-5")} tag="h5">
            {provider.display_name}
          </CardTitle>

          <CardText className="mb-2">
            ID: <i>{provider.id}</i>
          </CardText>
          <CardText className="mb-2">
            Kind: <i>{provider.kind}</i>
          </CardText>
          <CardText className="mb-2">
            URL: <i>{provider.url}</i>
          </CardText>

          <CardText className="mb-2">
            Client ID: <i>{provider.client_id}</i>
          </CardText>
          <CardText className="mb-2">
            Client secret: <i>{provider.client_secret}</i>
          </CardText>

          <CardText className="mb-2">
            Scope: <i>{provider.scope}</i>
          </CardText>
          <CardText className="mb-2">
            Use PKCE: <i>{provider.use_pkce.toString()}</i>
          </CardText>

          {/* <div className={cx("d-flex", "justify-content-end", "gap-2")}>
            <UpdateConnectedServiceButton provider={provider} />
            <DeleteConnectedServiceButton provider={provider} />
          </div> */}
        </CardBody>
      </Card>
    </Col>
  );
}
