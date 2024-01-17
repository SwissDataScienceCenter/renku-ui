/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { TokenSet } from "openid-client";
import { RedisStorage } from "../storage/RedisStorage";

/**
 * NoOpAuthenticator is used to skip any authetication or header injection/modification
 * that would usually be done by a real implementation. Used because the authentication
 * is now handled by the gateway.
 */
class NoOpAuthenticator {
  ready = true;
  storage = new RedisStorage();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTokens(sessionId: string, autoRefresh: boolean): Promise<TokenSet> {
    return new TokenSet({ access_token: "do-not-inject" });
  }

  async refreshTokens(
    sessionId: string, // eslint-disable-line @typescript-eslint/no-unused-vars
    tokens?: TokenSet, // eslint-disable-line @typescript-eslint/no-unused-vars
    removeIfFailed?: boolean // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<TokenSet> {
    return new TokenSet({ access_token: "do-not-inject" });
  }

  async init(): Promise<boolean> {
    return true;
  }
}

export default NoOpAuthenticator;
