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

import fetch from "cross-fetch";

import config from "../../config";
import logger from "../../logger";
import { simpleHash } from "../../utils";


// ! This is only an example, it's not used yet in production
// TODO: cleanup and use it in the short loop

/**
 * Check user sessions
 * @param sessionId - user session ID
 * @param storage - storage component
 */
async function checkSession(sessionId: string, storage: Storage, headers: Record<string, string>): Promise<boolean> {
  // fetch sessions
  let hashedSessions: string;
  try {
    const { gatewayUrl } = config.deployment;
    const sessionsUrl = `${gatewayUrl}/notebooks/servers`;
    logger.info(`Fetching sessions from <${sessionsUrl}>`); // ? TMP

    const response = await fetch(sessionsUrl, { headers });
    const sessions = await response.json();

    hashedSessions = simpleHash(JSON.stringify(sessions)).toString();
    logger.info(`Session fetched succesfully. The hash is ${hashedSessions}`); // ? TMP
  }
  catch (e) {
    logger.warn("There was a problem while trying to fetch sessions");
    logger.warn(e);
    throw e;
  }

  // try to get old hash and compare it
  // TODO: should we store this in the channel cache instead?
  let changed = false;
  const storageKey = config.data.userSessionsPrefix + sessionId;
  const oldHash = await storage.get(storageKey) as string;
  if (oldHash && oldHash !== hashedSessions)
    changed = true;
  if (!oldHash || oldHash !== hashedSessions)
    await storage.save(storageKey, hashedSessions);
  return changed;
}

export { checkSession };
