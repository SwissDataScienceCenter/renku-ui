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
import { useCallback, useMemo, useState } from "react";
import { Plugin } from "react-bootstrap-icons";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardText,
  Collapse,
} from "reactstrap";

import { InfoAlert } from "~/components/Alert";
import ExternalLink from "~/components/ExternalLink";
import { NEW_DOCS_ADMIN_INTEGRATIONS } from "~/utils/constants/NewDocs";
import RtkOrDataServicesError from "../../components/errors/RtkOrDataServicesError";
import ChevronFlippedIcon from "../../components/icons/ChevronFlippedIcon";
import { Loader } from "../../components/Loader";
import {
  Provider,
  useGetOauth2ProvidersQuery,
} from "../connectedServices/api/connectedServices.api";
import AddConnectedServiceButton from "./AddIntegrationsButton";
import AdminListFilter from "./AdminListFilter";
import DeleteConnectedServiceButton from "./DeleteIntegrationsButton";
import UpdateConnectedServiceButton from "./UpdateIntegrationsButton";

export default function ConnectedServicesSection() {
  const { data: providers, isLoading, error } = useGetOauth2ProvidersQuery();

  return (
    <section>
      <div className={cx("align-items-center", "d-flex", "gap-2", "mb-3")}>
        <h2 className="mb-0">
          <Plugin className="me-1" />
          Integrations
        </h2>

        {providers && !isLoading && !error && (
          <Badge>{providers?.length}</Badge>
        )}

        <div className="ms-auto">
          <AddConnectedServiceButton />
        </div>
      </div>

      <p className="mb-2">
        Integrations enable connecting external services to import/export data
        seamlessly.
      </p>
      <p className="mb-4">
        Check out the{" "}
        <ExternalLink href={NEW_DOCS_ADMIN_INTEGRATIONS}>
          documentation for integrations
        </ExternalLink>
        .
      </p>

      <ConnectedServices />
    </section>
  );
}

function ConnectedServices() {
  const { data: providers, isLoading, error } = useGetOauth2ProvidersQuery();

  const [filter, setFilter] = useState("");
  const filteredProviders = useMemo(() => {
    if (!providers || !filter) return providers;
    const lowerCaseFilter = filter.toLowerCase();
    return providers.filter(
      ({ display_name, id }) =>
        display_name.toLowerCase().includes(lowerCaseFilter) ||
        id.toLowerCase().includes(lowerCaseFilter),
    );
  }, [providers, filter]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <RtkOrDataServicesError error={error} />;
  }

  if (!providers || !filteredProviders || providers.length === 0) {
    return (
      <InfoAlert dismissible={false} timeout={0}>
        No integration set up yet.
      </InfoAlert>
    );
  }
  return (
    <>
      <AdminListFilter filter={filter} onFilterChange={setFilter} />

      {filteredProviders.length === 0 ? (
        <p className="fst-italic">
          No integration matches the filter <code>{filter}</code>.
        </p>
      ) : (
        <div className={cx("d-flex", "flex-column", "gap-3")}>
          {filteredProviders.map((provider) => (
            <ConnectedService key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </>
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
            "w-100",
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
          <CardText className="mb-2">Client ID: {provider.client_id}</CardText>
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
            "pt-0",
          )}
        >
          <UpdateConnectedServiceButton provider={provider} />
          <DeleteConnectedServiceButton provider={provider} />
        </CardBody>
      </Collapse>
    </Card>
  );
}
