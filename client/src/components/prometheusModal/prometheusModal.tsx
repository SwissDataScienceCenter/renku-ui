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

/* eslint-disable spellcheck/spell-checker */
import cx from "classnames";
import { useCallback, useState, useEffect, useRef } from "react";
import { Activity, Search, Cpu, Memory } from "react-bootstrap-icons";
import { Alert, Button, Card, CardBody, CloseButton } from "reactstrap";

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

interface PrometheusQueryBoxProps {
  className?: string;
  predefinedQueries?: Array<{
    label: string;
    query: string;
    description?: string;
    icon?: string;
    unit?: string;
  }>;
  onClose?: () => void;
}

export function PrometheusQueryBox({
  className,
  predefinedQueries,
  onClose,
}: PrometheusQueryBoxProps) {
  const [inputValue, setInputValue] = useState("");
  const [queryResult, setQueryResult] = useState<PrometheusQueryResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { sendPrometheusQuery, isConnected } = usePrometheusWebSocket();

  const executeQuery = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      setIsLoading(true);
      setError(null);
      setQueryResult(null);

      try {
        const result = await sendPrometheusQuery(query.trim());
        setQueryResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    [sendPrometheusQuery]
  );

  const handlePredefinedQuery = useCallback(
    (predefinedQuery: string) => {
      setInputValue(predefinedQuery);
      executeQuery(predefinedQuery);
    },
    [executeQuery]
  );

  {
    /* 
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );
          */
  }

  const handleCloseButton = useCallback(() => {
    setInputValue("");
    setQueryResult(null);
    setError(null);
    setIsLoading(false);
    onClose();
  }, [onClose]);

  const hasResults = queryResult?.data?.result?.length
    ? queryResult.data.result.length > 0
    : false;

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

          {predefinedQueries && predefinedQueries.length > 0 && (
            <div className="mb-2">
              <div className="d-flex flex-wrap gap-1">
                {predefinedQueries?.map((pq, index) => (
                  <Button
                    key={index}
                    color="outline-secondary"
                    size="sm"
                    onClick={() => handlePredefinedQuery(pq.query)}
                    title={pq.description}
                  >
                    {pq.icon === "memory" ? (
                      <Memory className="me-1 bi" />
                    ) : pq.icon === "cpu" ? (
                      <Cpu className="me-1 bi" />
                    ) : (
                      <Search className="me-1 bi" />
                    )}
                    {pq.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* 
          <InputGroup size="sm">
            <Input
              type="text"
              placeholder="Enter custom Prometheus query or use buttons above"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              color="primary"
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
            >
              <Search className="bi" />
            </Button>
          </InputGroup>
          */}
        </div>

        {!isConnected && (
          <Alert color="warning" className="mb-0">
            <small>WebSocket not connected</small>
          </Alert>
        )}

        {isLoading && (
          <div className="text-center">
            <small className="text-muted">Querying Prometheus...</small>
          </div>
        )}

        {error && (
          <Alert color="warning" className="mb-0">
            <small>Could not query Prometheus: {error}</small>
          </Alert>
        )}

        {queryResult && !hasResults && (
          <Alert color="info" className="mb-0">
            <small>No data returned from Prometheus</small>
          </Alert>
        )}

        {hasResults && (
          <div className={cx("mt-2", "border-top", "pt-2")}>
            <div
              className={cx("small", "font-monospace")}
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              {queryResult?.data?.result?.map((result, index) => (
                <div key={index} className="mb-1">
                  <div className="text-success">
                    {result.value
                      ? `${result.value[1]}`
                      : result.values
                      ? `${result.values.length} time series points`
                      : "No value"}
                    {predefinedQueries &&
                      predefinedQueries.length > 0 &&
                      predefinedQueries.map((pq) => {
                        if (
                          pq.query === inputValue.trim() &&
                          pq.unit &&
                          result.value
                        ) {
                          return ` ${pq.unit}`;
                        }
                        return "";
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
