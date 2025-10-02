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
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
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
    path?: string;
    description?: string;
    icon?: string;
    unit: string;
  };
}

interface PrometheusQueryBoxProps {
  className?: string;
  sessionName: string;
  onClose: () => void;
  setPrometheusQueryBtnColor: (color: string) => void;
  showPrometheusQuery: boolean;
}

interface AlertDetails {
  alertName: string;
  severity: string;
  value: number;
  description: string;
  unit?: string;
}

function usePrometheusWebSocket() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 10;
  const baseDelay = 1000;
  const maxDelay = 30000;

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
      reconnectAttempts.current = 0;
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

    websocket.onclose = (event) => {
      setIsConnected(false);
      setWs(null);

      if (pendingRequests.current.size > 0) {
        pendingRequests.current.forEach((pending) => {
          pending.reject(new Error("WebSocket connection closed"));
        });
        pendingRequests.current.clear();
      }

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
      websocket.close(1000, "Component unmounting");
    };
  }, [connect]);

  const sendPrometheusQuery = useCallback(
    async (queryOrPath: string): Promise<PrometheusQueryResult> => {
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
            fullPath: queryOrPath,
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
  sessionName,
  onClose,
  setPrometheusQueryBtnColor,
  showPrometheusQuery,
}: PrometheusQueryBoxProps) {
  const [queryResults, setQueryResults] = useState<PrometheusQueryResult[]>([]);
  const [alerts, setAlerts] = useState<AlertDetails[]>([]);

  const { sendPrometheusQuery } = usePrometheusWebSocket();

  const hardcodedQuery = useMemo(() => {
    const query = `ALERTS{pod=~"${sessionName}.*", purpose="renku-session"}`;
    return {
      label: "Alerts for this session",
      query,
      path: `http://prometheus-server.monitoring.svc.cluster.local/api/v1/query?query=${encodeURIComponent(
        query
      )}`,
      description: "Alerts for this session",
      icon: "memory",
      unit: "",
    };
  }, [sessionName]);

  const setPrometheusQueryBtnColorRef = useRef(setPrometheusQueryBtnColor);
  const sendPrometheusQueryRef = useRef(sendPrometheusQuery);

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
      path: string;
      description?: string;
      icon?: string;
      unit: string;
    }) => {
      if (!predefinedQuery.path?.trim()) return;

      try {
        const result = await sendPrometheusQueryRef.current(
          predefinedQuery.path
        );
        return result;
      } catch (err) {
        return null;
      }
    },
    []
  );

  const getAllQueryResults = useCallback(async () => {
    const result = await executeQuery(hardcodedQuery);

    if (result?.data?.result?.length && result.data.result.length > 0) {
      const filteredResults = [{ ...result, predefinedQuery: hardcodedQuery }];

      setQueryResults(filteredResults);
    } else {
      setQueryResults([]);
    }
  }, [executeQuery, hardcodedQuery]);

  const getAlertDetails = useCallback(() => {
    if (queryResults.length === 0) return [];
    const result = queryResults[0];
    if (result.data.result.length === 0) return [];

    const alertNames = result.data.result.map(
      (alertResult) => alertResult.metric.name
    );
    return alertNames;
  }, [queryResults]);

  const handleCloseButton = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    getAllQueryResults();

    const interval = setInterval(() => {
      getAllQueryResults();
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [getAllQueryResults]);

  useEffect(() => {
    async function getAllAlertDetails(alertNames: string[]) {
      if (!alertNames || alertNames.length === 0) {
        setAlerts([]);
        setPrometheusQueryBtnColorRef.current("text-dark");
        return;
      }

      const query = "ALERTS";
      const detailsQuery = {
        label: "Alerts for this session",
        query,
        path: `http://prometheus-server.monitoring.svc.cluster.local/api/v1/alerts`,
        description: "Alerts for this session",
        icon: "memory",
        unit: "",
      };

      const result = await executeQuery(detailsQuery);

      if (result?.data?.result?.length && result.data.result.length > 0) {
        const relevantAlerts = result.data.result.filter(
          (alert: any) =>
            alertNames.includes(alert.labels?.name) &&
            alert.labels?.purpose === "renku-session"
        );

        let buttonColor = "text-warning";

        const alertDetails: AlertDetails[] = relevantAlerts.map((alert: any) => {
          let severity = alert.labels.severity || "unknown";
          const value = parseFloat(alert.value) || 0;

          if (alert.labels.criticalAt) {
            if (value >= alert.labels.criticalAt) {
              severity = "critical";
              buttonColor = "text-danger";
            }
          }
          return {
            alertName: alert.labels.alertname,
            severity,
            value,
            description: alert.annotations?.description || "",
            unit: alert.labels.unit ? alert.labels.unit : "",
          };
        });
        setAlerts(alertDetails);
        setPrometheusQueryBtnColorRef.current(buttonColor);
      } else {
        setAlerts([]);
      }
    }

    const alertNames = getAlertDetails();
    getAllAlertDetails(alertNames);
  }, [queryResults, getAlertDetails, executeQuery]);

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

        {alerts.map((alert, idx) => (
          <div key={idx} className="mb-2">
            <div className="fw-normal text-dark medium text-truncate">
              {alert.description || alert.alertName}
            </div>
            <div
              className={cx(
                "medium",
                alert.severity === "warning" ? "text-warning" : "text-danger"
              )}
            >
              {alert.value} {alert.unit}
            </div>
            {idx < alerts.length - 1 && <hr className="my-2" />}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
