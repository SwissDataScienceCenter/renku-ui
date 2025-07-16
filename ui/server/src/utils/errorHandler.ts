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

/**
 *  renku-ui-server
 *
 *  errorHandler.ts
 *  ErrorHandler class
 */

import logger from "./../logger";
import * as SentryLib from "@sentry/node";
import config from "../config";

class ErrorHandler {
  public async handleError(err: Error): Promise<void> {
    logger.error(err.message);
    if (config.sentry.enabled) {
      logger.info("Sending error to sentry");
      SentryLib.captureException(err);
    }
  }
}
export const errorHandler = new ErrorHandler();
