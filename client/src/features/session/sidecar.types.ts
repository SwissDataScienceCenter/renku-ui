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

export interface HealthState {
  status: string;
  error?: {
    code: number;
    message: string;
  };
}

export interface SidecarRequestArgs {
  serverName: string;
}

export interface SaveArgs extends SidecarRequestArgs {
  message?: string;
}

interface JsonRpcResult {
  id: number;
  jsonRpc: string;
}

export interface GitStatusResult extends JsonRpcResult {
  result: {
    ahead: number;
    behind: number;
    branch: string;
    clean: boolean;
    commit: string;
    status: string;
  };
  error?: {
    code: number;
    message: string;
  };
}

interface RenkuOpResult extends JsonRpcResult {
  result: string;
  error?: {
    code: number;
    message: string;
  };
}

export type SaveResult = RenkuOpResult;
export type PullResult = RenkuOpResult;
