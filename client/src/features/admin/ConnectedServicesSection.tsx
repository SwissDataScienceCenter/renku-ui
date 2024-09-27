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
  CardFooter,
  CardHeader,
  CardText,
  Col,
  Collapse,
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
import ChevronFlippedIcon from "../../components/icons/ChevronFlippedIcon";
import { useCallback, useState } from "react";
import DeleteConnectedServiceButton from "./DeleteConnectedServiceButton";

export default function ConnectedServicesSection() {
  return (
    <section className="mt-4">
      <h2 className="fs-4">Connected Services - Renku 2.0</h2>
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
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  return (
    <Col xs={12} md={6}>
      <Card>
        <CardHeader
          className={cx("bg-white", "border-0", "rounded", "fs-6", "p-0")}
          tag="h5"
        >
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
            <CardText>
              Use PKCE: <i>{provider.use_pkce.toString()}</i>
            </CardText>
          </CardBody>
          <CardFooter
            className={cx(
              "bg-white",
              "border-0",
              "d-flex",
              "justify-content-end",
              "gap-2",
              "rounded",
              "pb-3",
              "pt-0"
            )}
          >
            <DeleteConnectedServiceButton provider={provider} />
            {/* <EditConnectedServiceButton provider={provider} /> */}
          </CardFooter>
        </Collapse>
      </Card>
    </Col>
  );
}
