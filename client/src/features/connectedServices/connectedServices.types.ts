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

export interface Provider {
  id: string;
  kind: string;
  client_id: string;
  client_secret: string;
  display_name: string;
  scope: string;
  url: string;
  use_pkce: boolean;
}

export type ProviderList = Provider[];

export interface Connection {
  id: string;
  provider_id: string;
  status: ConnectionStatus;
}

export type ConnectionList = Connection[];

export type ConnectionStatus = "pending" | "connected";

export interface ConnectedAccount {
  username: string;
  web_url: string;
}

export interface GetConnectedAccountParams {
  connectionId: string;
}

export interface ConnectedServiceParams {
  id: string;
  kind: string;
  client_id: string;
  client_secret?: string;
  display_name: string;
  scope?: string;
  url: string;
  use_pkce: boolean;
}

export type ConnectedServiceForm = Provider;
