/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import type { Express } from "express";
import type { PrometheusContentType, Registry } from "prom-client";

interface MetricsArgs {
  app: Express;
  metricsApp: Express;
}

export async function metrics({
  app,
  metricsApp,
}: MetricsArgs): Promise<Registry<PrometheusContentType>> {
  // Initialize metrics
  const promClient = await import("prom-client");
  const promBundle = (await import("express-prom-bundle")).default;
  const register = new promClient.Registry();

  // Collect default metrics
  promClient.collectDefaultMetrics({ register });

  // Register the "prom-bundle" middleware
  app.use(
    promBundle({
      autoregister: false,
      includeMethod: true,
      includeStatusCode: true,
      metricsApp,
      promRegistry: register,
    })
  );

  // Collect HTTP requests total (App only)
  const requestCounter = new promClient.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests.",
    labelNames: ["method", "status_code"],
    registers: [register],
  });
  app.use(async (req, res, next) => {
    res.on("close", () => {
      requestCounter
        .labels({
          method: req.method,
          status_code: res.statusCode,
        })
        .inc();
    });
    next();
  });

  return register;
}
