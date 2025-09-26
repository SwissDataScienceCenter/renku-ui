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
  predefinedQuery?: {
    label: string;
    query: string;
    description?: string;
    icon?: string;
    unit: string;
    alertThreshold: number;
  };
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
  setPrometheusQueryBtnColor: (color: string) => void;
  showPrometheusQuery: boolean;
}

function usePrometheusWebSocket() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 10;
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds

  const pendingRequests = useRef<
    Map<
      string,
      {
        resolve: (result: PrometheusQueryResult) => void;
        reject: (error: Error) => void;
      }
    >
  >(new Map());

  const connect = useCallback(() => {
    const wsUrl = `wss://${window.location.host}/ui-server/ws`;

    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      setIsConnected(true);
      setWs(websocket);
      reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection
    };

    websocket.onmessage = (event) => {
      try {
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
      } catch (error) {
        // Ignore parsing errors
      }
    };

    websocket.onerror = () => {
      setIsConnected(false);
    };

    websocket.onclose = (event) => {
      setIsConnected(false);
      setWs(null);

      // Reject all pending requests
      if (pendingRequests.current.size > 0) {
        pendingRequests.current.forEach((pending) => {
          pending.reject(new Error("WebSocket connection closed"));
        });
        pendingRequests.current.clear();
      }

      // Attempt to reconnect if not at max attempts
      if (reconnectAttempts.current < maxReconnectAttempts && !event.wasClean) {
        const delay = Math.min(
          baseDelay * Math.pow(2, reconnectAttempts.current),
          maxDelay
        );

        reconnectTimeout.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      }
    };

    return websocket;
  }, []);

  useEffect(() => {
    const websocket = connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
      websocket.close(1000, "Component unmounting"); // Clean close
    };
  }, [connect]);

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

        try {
          ws.send(JSON.stringify(message));
        } catch (error) {
          pendingRequests.current.delete(requestId);
          reject(error);
        }
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
  setPrometheusQueryBtnColor,
  showPrometheusQuery,
}: PrometheusQueryBoxProps) {
  const [queryResults, setQueryResults] = useState<PrometheusQueryResult[]>([]);

  const { sendPrometheusQuery } = usePrometheusWebSocket();

  // Use refs to keep stable references to current values
  const predefinedQueriesRef = useRef(predefinedQueries);
  const setPrometheusQueryBtnColorRef = useRef(setPrometheusQueryBtnColor);
  const sendPrometheusQueryRef = useRef(sendPrometheusQuery);

  // Update refs when values change
  useEffect(() => {
    predefinedQueriesRef.current = predefinedQueries;
  }, [predefinedQueries]);

  useEffect(() => {
    setPrometheusQueryBtnColorRef.current = setPrometheusQueryBtnColor;
  }, [setPrometheusQueryBtnColor]);

  useEffect(() => {
    sendPrometheusQueryRef.current = sendPrometheusQuery;
  }, [sendPrometheusQuery]);

  const executeQuery = useCallback(
    async (predefinedQuery: {
      label: string;
      query: string;
      description?: string;
      icon?: string;
      unit: string;
      alertThreshold: number;
    }) => {
      if (!predefinedQuery.query.trim()) return;

      try {
        const result = await sendPrometheusQueryRef.current(
          predefinedQuery.query.trim()
        );
        return result;
      } catch (err) {
        return null;
      }
    },
    []
  );

  const getAllQueryResults = useCallback(async () => {
    const filteredResults = [];
    let newColor = "text-dark";

    for (const pq of predefinedQueriesRef.current || []) {
      const result = await executeQuery(pq);

      if (result?.data?.result?.length && result.data.result.length > 0) {
        filteredResults.push({ ...result, predefinedQuery: pq });
        if (
          result.data.result[0]?.value?.[1] &&
          parseFloat(result.data.result[0].value[1]) > pq.alertThreshold &&
          newColor !== "text-danger"
        ) {
          newColor = "text-danger";
        } else {
          if (newColor !== "text-danger") {
            newColor = "text-warning";
          }
        }
      }
    }
    setPrometheusQueryBtnColorRef.current(newColor);
    setQueryResults(filteredResults);
  }, [executeQuery]);

  const handleCloseButton = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    // Execute immediately on mount
    getAllQueryResults();

    const interval = setInterval(() => {
      getAllQueryResults();
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [getAllQueryResults]);

  if (queryResults.length === 0 || showPrometheusQuery === false) {
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
            <div className="fw-bold">{qr.predefinedQuery?.label}</div>
            <div className="mb-1">
              <div
                className={
                  qr.data?.result?.[0]?.value?.[1] &&
                  qr.predefinedQuery &&
                  parseFloat(qr.data.result[0].value[1]) >
                    qr.predefinedQuery.alertThreshold
                    ? "text-danger"
                    : "text-warning"
                }
              >
                {qr.data?.result?.[0]?.value
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
