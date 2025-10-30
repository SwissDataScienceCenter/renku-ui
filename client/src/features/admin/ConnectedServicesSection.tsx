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
import { useCallback, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardText,
  Col,
  Collapse,
  Container,
  Row,
} from "reactstrap";

import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import ChevronFlippedIcon from "../../components/icons/ChevronFlippedIcon";
import { Loader } from "../../components/Loader";
import {
  Provider,
  ProviderList,
  useGetOauth2ProvidersQuery,
} from "../connectedServices/api/connectedServices.api";
import AddConnectedServiceButton from "./AddConnectedServiceButton";
import DeleteConnectedServiceButton from "./DeleteConnectedServiceButton";
import UpdateConnectedServiceButton from "./UpdateConnectedServiceButton";

export default function ConnectedServicesSection() {
  return (
    <section className="mt-4">
      <h2>Integrations</h2>
      <ConnectedServices />
    </section>
  );
}

function ConnectedServices() {
  const { data: providers, isLoading, error } = useGetOauth2ProvidersQuery();

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
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  return (
    <Col xs={12} md={6}>
      <Card>
        <CardHeader className={cx("fs-4", "p-0")} tag="h3">
          <button
            className={cx(
              "align-items-center",
              "bg-transparent",
              "border-0",
              "d-flex",
              "fw-bold",
              "gap-3",
              "p-3",
              "w-100"
            )}
            onClick={toggle}
            type="button"
          >
            {provider.display_name}
            <div className="ms-auto">
              <ChevronFlippedIcon flipped={isOpen} />
            </div>
          </button>
        </CardHeader>

        <Collapse isOpen={isOpen}>
          <CardBody className="pt-0">
            <CardText className="mb-2">ID: {provider.id}</CardText>
            <CardText className="mb-2">Kind: {provider.kind}</CardText>
            <CardText className="mb-2">
              Application slug: {provider.app_slug}
            </CardText>
            <CardText className="mb-2">URL: {provider.url}</CardText>
            <CardText className="mb-2">
              Image Registry URL:{" "}
              {provider.image_registry_url ?? (
                <span className="fst-italic">Not configured</span>
              )}
            </CardText>
            <CardText className="mb-2">
              Client ID: {provider.client_id}
            </CardText>
            <CardText className="mb-2">
              Client secret: {provider.client_secret}
            </CardText>
            <CardText className="mb-2">Scope: {provider.scope}</CardText>
            <CardText className="mb-2">
              Use PKCE: {provider.use_pkce.toString()}
            </CardText>
            {provider.oidc_issuer_url && (
              <CardText>
                OpenID Connect Issuer URL: {provider.oidc_issuer_url}
              </CardText>
            )}
          </CardBody>

          <CardBody
            className={cx(
              "d-flex",
              "flex-row",
              "gap-2",
              "justify-content-end",
              "pt-0"
            )}
          >
            <UpdateConnectedServiceButton provider={provider} />
            <DeleteConnectedServiceButton provider={provider} />
          </CardBody>
        </Collapse>
      </Card>
    </Col>
  );
}
