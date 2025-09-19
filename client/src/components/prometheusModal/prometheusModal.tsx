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

/* eslint-disable spellcheck/spell-checker */
import cx from "classnames";
import { useCallback, useState, useEffect, useRef } from "react";
import { Activity } from "react-bootstrap-icons";
import { Card, CardBody, CloseButton } from "reactstrap";

interface PrometheusQueryResult {
  status: string;
  data: {
    resultType: string;
    result: Array<{
      metric: Record<string, string>;
      value?: [number, string];
      values?: Array<[number, string]>;
    }>;
  };
  requestId?: string;
  error?: string;
}

interface PrometheusQueryBoxProps {
  className?: string;
  predefinedQueries?: Array<{
    label: string;
    query: string;
    description?: string;
    icon?: string;
    unit: string;
    alertThreshold: number;
  }>;
  onClose: () => void;
}

function usePrometheusWebSocket() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const pendingRequests = useRef<
    Map<
      string,
      {
        resolve: (result: PrometheusQueryResult) => void;
        reject: (error: Error) => void;
      }
    >
  >(new Map());

  useEffect(() => {
    const wsUrl = `wss://${window.location.host}/ui-server/ws`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      setIsConnected(true);
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "prometheusQuery" && message.data?.requestId) {
        const pending = pendingRequests.current.get(message.data.requestId);
        if (pending) {
          pendingRequests.current.delete(message.data.requestId);
          if (message.data.error) {
            pending.reject(new Error(message.data.error));
          } else {
            pending.resolve(message.data);
          }
        }
      }
    };

    websocket.onerror = () => {
      setIsConnected(false);
    };

    websocket.onclose = () => {
      setIsConnected(false);
      setWs(null);
    };

    return () => {
      websocket.close();
    };
  }, []);

  const sendPrometheusQuery = useCallback(
    async (query: string): Promise<PrometheusQueryResult> => {
      if (!ws || !isConnected) {
        throw new Error("WebSocket not connected");
      }

      const requestId = `prometheus-${Date.now()}-${Math.random()}`;

      return new Promise((resolve, reject) => {
        pendingRequests.current.set(requestId, { resolve, reject });

        setTimeout(() => {
          if (pendingRequests.current.has(requestId)) {
            pendingRequests.current.delete(requestId);
            reject(new Error("Request timeout"));
          }
        }, 10000);

        const message = {
          timestamp: new Date(),
          type: "prometheusQuery",
          data: {
            query,
            requestId,
          },
        };

        ws.send(JSON.stringify(message));
      });
    },
    [ws, isConnected]
  );

  return { sendPrometheusQuery, isConnected };
}

export function PrometheusQueryBox({
  className,
  predefinedQueries,
  onClose,
}: PrometheusQueryBoxProps) {
  const [queryResult, setQueryResult] = useState<PrometheusQueryResult | null>(
    null
  );
  const [queryResults, setQueryResults] = useState<PrometheusQueryResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { sendPrometheusQuery, isConnected } = usePrometheusWebSocket();

  const executeQuery = useCallback(
    async (predefinedQuery: Array) => {
      if (!predefinedQuery.query.trim()) return;

      setIsLoading(true);
      setError(null);
      setQueryResult(null);

      try {
        const result = await sendPrometheusQuery(predefinedQuery.query.trim());
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    [sendPrometheusQuery]
  );

  const getAllQueryResults = useCallback(async () => {
    setQueryResults([]);
    const filteredResults = [];

    for (const pq of predefinedQueries || []) {
      const result = await executeQuery(pq);

      if (result?.data?.result?.length > 0) {
        filteredResults.push({ ...result, predefinedQuery: pq });
      }
    }
    setQueryResults(filteredResults);
  }, [executeQuery, predefinedQueries]);

  const handleCloseButton = useCallback(() => {
    setQueryResult(null);
    setError(null);
    setIsLoading(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Re-executing query");
      getAllQueryResults();
    }, 15000);
    return () => clearInterval(interval);
  }, [executeQuery]);

  if (queryResults.length === 0) {
    return null;
  }

  return (
    <Card className={cx("border-secondary-subtle", className)}>
      <CardBody className="p-3">
        <div className="mb-3">
          <h6 className={cx("mb-2", "d-flex", "align-items-center")}>
            <Activity className={cx("me-2", "bi")} />
            Metrics
          </h6>

          <CloseButton
            className="position-absolute top-0 end-0 m-2"
            onClick={handleCloseButton}
          />
        </div>

        {queryResults.map((qr, idx) => (
          <div key={idx} className="mb-2">
            <div className="fw-bold">{qr.predefinedQuery.label}</div>
            <div className="mb-1">
              <div
                className={
                  qr.data.result[0]?.value[1] >
                  qr.predefinedQuery.alertThreshold
                    ? "text-danger"
                    : "text-warning"
                }
              >
                {qr.data.result[0]?.value
                  ? `${qr.data.result[0].value[1]}${qr.predefinedQuery?.unit}`
                  : "No value"}
              </div>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
