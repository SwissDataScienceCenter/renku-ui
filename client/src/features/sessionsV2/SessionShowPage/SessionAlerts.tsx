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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useEffect, useRef, useState } from "react";
import {
  ExclamationTriangle,
  ExclamationTriangleFill,
} from "react-bootstrap-icons";
import ReactMarkdown from "react-markdown";
import { Badge, Button, Popover, PopoverBody, PopoverHeader } from "reactstrap";

import { useGetAlertsQuery, type Alert } from "../api/sessionsV2.api";

interface SessionAlertsProps {
  sessionName?: string;
}

const POLL_INTERVAL = 12000;

interface LinkRendererProps {
  href?: string;
  children?: React.ReactNode;
}

function LinkRenderer(props: LinkRendererProps) {
  return (
    <a href={props.href} target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
}

export default function SessionAlerts({ sessionName }: SessionAlertsProps) {
  const { data: alerts } = useGetAlertsQuery(
    sessionName ? { sessionName } : skipToken,
    {
      pollingInterval: POLL_INTERVAL,
      refetchOnMountOrArgChange: true,
    }
  );

  return <Alerts alerts={alerts ?? []} />;
}

interface AlertsProps {
  alerts: Alert[];
}

function Alerts({ alerts }: AlertsProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [prevAlertIds, setPrevAlertIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!alerts || alerts.length === 0) {
      setPrevAlertIds(new Set());
      setIsOpen(false);
      return;
    }

    const currentAlertIds = new Set(alerts.map((alert) => alert.id));

    const hasNewAlerts = alerts.some((alert) => !prevAlertIds.has(alert.id));

    if (hasNewAlerts) {
      setIsOpen(true);
    }

    setPrevAlertIds(currentAlertIds);
  }, [alerts, prevAlertIds]);

  const togglePopover = () => setIsOpen(!isOpen);

  if (!alerts || alerts.length === 0) {
    return (
      <div>
        <Button
          className={cx(
            "bg-transparent",
            "border-0",
            "no-focus",
            "p-0",
            "shadow-none",
            "text-dark"
          )}
          data-cy="session-alerts"
          innerRef={ref}
        >
          <ExclamationTriangle className="bi" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="position-relative">
        <Button
          innerRef={ref}
          onClick={togglePopover}
          className={cx(
            "bg-transparent",
            "border-0",
            "no-focus",
            "p-0",
            "shadow-none",
            "text-danger"
          )}
          data-cy="session-alerts"
        >
          <ExclamationTriangleFill className="bi" />
        </Button>
        {alerts.length > 1 && (
          <Badge
            color="dark"
            pill
            className="position-absolute"
            style={{
              fontSize: "0.65rem",
              top: "-6px",
              right: "-12px",
              minWidth: "20px",
            }}
          >
            {alerts.length}
          </Badge>
        )}
      </div>
      <Popover
        target={ref}
        isOpen={isOpen}
        toggle={togglePopover}
        trigger="legacy"
        placement="auto"
        popperClassName="session-alerts-popover"
      >
        {alerts.map((alert) => (
          <div key={alert.id}>
            <PopoverHeader className="text-bg-danger">
              {alert.title}
            </PopoverHeader>
            <PopoverBody className={cx("text-dark", "bg-danger-subtle")}>
              <ReactMarkdown components={{ a: LinkRenderer }}>
                {alert.message}
              </ReactMarkdown>
            </PopoverBody>
          </div>
        ))}
      </Popover>
    </>
  );
}
