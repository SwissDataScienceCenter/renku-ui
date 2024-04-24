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

import PageLoader from "../../components/PageLoader";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import {
  useGetConnectionsQuery,
  useGetProvidersQuery,
} from "./connectedServices.api";

export default function ConnectedServicesPage() {
  const {
    data: providers,
    isLoading: isLoadingProviders,
    error: providersError,
  } = useGetProvidersQuery();
  const {
    data: connections,
    isLoading: isLoadingConnections,
    error: connectionsError,
  } = useGetConnectionsQuery();

  const isLoading = isLoadingProviders || isLoadingConnections;
  const error = providersError || connectionsError;

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div>
        <RtkErrorAlert error={error} dismissible={false} />
      </div>
    );
  }

  return (
    <>
      <h1>Connected Services</h1>
      <p>TODO</p>
      {providers && (
        <div>
          {providers.map(({ id, display_name }) => (
            <p key={id}>
              {display_name}{" "}
              <a href={`/ui-server/api/data/oauth2/providers/${id}/authorize`}>
                Connect
              </a>
            </p>
          ))}
        </div>
      )}
      <div>
        <pre>{JSON.stringify(providers, null, 2)}</pre>
        <pre>{JSON.stringify(connections, null, 2)}</pre>
      </div>
    </>
  );
}
