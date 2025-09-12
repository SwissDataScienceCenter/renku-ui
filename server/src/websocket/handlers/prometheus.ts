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

import fetch from "cross-fetch";
import ws from "ws";

import config from "../../config";
import logger from "../../logger";
import { WsMessage } from "../WsMessages";
import type { Channel } from "./handlers.types";

export function handlerPrometheusQuery(
  data: Record<string, unknown>,
  channel: Channel,
  socket: ws
): void {
  const { query, requestId } = data;

  if (!config.prometheus.url) {
    const errorMessage = new WsMessage(
      {
        error: "Prometheus server not configured",
        requestId,
      },
      "user",
      "prometheusQuery"
    ).toString();
    socket.send(errorMessage);
    return;
  }

  if (!query || typeof query !== "string") {
    const errorMessage = new WsMessage(
      {
        error: "Missing required 'query' parameter",
        requestId,
      },
      "user",
      "prometheusQuery"
    ).toString();
    socket.send(errorMessage);
    return;
  }

  executePrometheusQuery(query as string, requestId as string, socket);
}

async function executePrometheusQuery(
  query: string,
  requestId: string,
  socket: ws
): Promise<void> {
  try {
    const prometheusUrl = new URL("/api/v1/query", config.prometheus.url);
    prometheusUrl.searchParams.set("query", query);

    const prometheusResponse = await fetch(prometheusUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!prometheusResponse.ok) {
      logger.error(
        `Prometheus query failed with status ${prometheusResponse.status}`
      );
      const errorMessage = new WsMessage(
        {
          error: `Prometheus server error: ${prometheusResponse.statusText}`,
          requestId,
        },
        "user",
        "prometheusQuery"
      ).toString();
      socket.send(errorMessage);
      return;
    }

    const responseData = await prometheusResponse.json();
    const successMessage = new WsMessage(
      {
        ...responseData,
        requestId,
      },
      "user",
      "prometheusQuery"
    ).toString();
    socket.send(successMessage);
  } catch (error) {
    logger.error("Error executing Prometheus query:", error);

    const failureMessage = new WsMessage(
      {
        error: "Error executing Prometheus query",
        details: error.message,
        requestId,
      },
      "user",
      "prometheusQuery"
    ).toString();
    socket.send(failureMessage);
  }
}
