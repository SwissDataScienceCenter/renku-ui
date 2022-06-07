/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

class WsMessage {
  timestamp: Date;
  type: string;
  scope: string;
  data: Record<string, unknown>;

  constructor(data: string | Record<string, unknown>, type: string, scope: string) {
    this.timestamp = new Date();
    if (typeof data === "string")
      this.data = { message: data };
    else
      this.data = data;
    this.type = type;
    this.scope = scope;
  }

  toString(): string {
    return JSON.stringify({
      timestamp: this.timestamp,
      type: this.type,
      scope: this.scope,
      data: this.data
    });
  }
}

export default WsMessage;
