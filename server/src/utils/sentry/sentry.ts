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
 *  Sentry.ts
 *  Sentry class
 */

import * as SentryLib from "@sentry/node";
import express from "express";

import { getRelease } from "../index";
import config from "../../config";
import logger from "../../logger";
import requestHandlerMiddleware from "../middlewares/requestHandlerMiddleware";
import { clamp } from "../index";

export interface SentryConfiguration {
  url: string;
  namespace: string;
  version: string;
  telepresence: boolean;
  sampleRate: number;
}

const NAMESPACE_DEFAULT = "unknown";
const VERSION_DEFAULT = "unknown";
const UI_COMPONENT = "renku-ui-server";

class Sentry {
  sentryInitialized = false;
  private uiVersion = VERSION_DEFAULT;
  private sentryUrl: string = null;
  private sentryNamespace: string = NAMESPACE_DEFAULT;

  init(
    options: SentryConfiguration,
    app: express.Application
  ): typeof SentryLib {
    // Prevent re-initializing
    if (this.sentryInitialized)
      throw new Error("Cannot re-initialize the Sentry server-ui.");

    // Check url
    if (!options.url || typeof options.url !== "string")
      throw new Error("Please provide a Sentry URL to initialize it");

    // Check namespace
    if (options.namespace != null) {
      if (typeof options.namespace !== "string" || !options.namespace.length)
        throw new Error(
          "The optional <namespace> must be a valid string identifying the current namespace."
        );
      this.sentryNamespace = options.namespace;
    }

    // Check version
    if (options.version != null) {
      if (typeof options.version !== "string" || !options.version.length)
        throw new Error(
          "The optional <version> must be a valid string identifying the UI version."
        );
      this.uiVersion = options.version;
    }

    // Save data
    this.sentryUrl = options.url;
    this.sentryNamespace = options.namespace;

    // Initialize client
    // ? Reference: https://docs.sentry.io/platforms/javascript/configuration/options/
    SentryLib.init({
      dsn: this.sentryUrl,
      environment: this.sentryNamespace,
      release: getRelease(this.uiVersion),
      integrations: [
        // enable HTTP calls tracing
        new SentryLib.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new SentryLib.Integrations.Express({ app }),
      ],
      tracesSampleRate: clamp(options.sampleRate, 0, 1),
    });

    SentryLib.setTags({
      component: UI_COMPONENT,
      telepresence: options.telepresence,
    });

    // TODO Handle user data
    // SentryLib.setUser(user);
    // SentryLib.setTag("user.username", user.username);

    // Finalize and return SentryLib to allow further customization
    this.sentryInitialized = true;
    app.use(SentryLib.Handlers.requestHandler());
    app.use(SentryLib.Handlers.tracingHandler());
    return SentryLib;
  }
}

const initializeSentry = (app: express.Application): void => {
  let sentryInitialized = false;
  if (config.sentry.enabled) {
    logger.info(`Initializing Sentry`);
    const configSentry: SentryConfiguration = {
      url: config.sentry.url,
      namespace: config.sentry.namespace,
      version: config.server.serverUiVersion,
      telepresence: !!process.env.TELEPRESENCE,
      sampleRate: config.sentry.sampleRate,
    };

    try {
      const sentry = new Sentry();
      sentry.init(configSentry, app);
      sentryInitialized = sentry.sentryInitialized;
    } catch (e) {
      logger.profile("Sentry");
      logger.error(e.message);
      // include request Handler middleware to unblock the app if has a uncaughtException and Sentry is not available
      app.use(requestHandlerMiddleware);
    }
  } else {
    // include request Handler middleware to unblock app if has a uncaughtException
    app.use(requestHandlerMiddleware);
  }
  logger.info(`Sentry Initialized: ${sentryInitialized}`);
};

export { initializeSentry };
