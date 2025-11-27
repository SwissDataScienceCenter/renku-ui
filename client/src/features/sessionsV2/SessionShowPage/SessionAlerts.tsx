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

import cx from "classnames";
import { useRef } from "react";
import { ExclamationTriangleFill } from "react-bootstrap-icons";
import ReactMarkdown from "react-markdown";
import {
  Badge,
  Button,
  PopoverBody,
  PopoverHeader,
  UncontrolledPopover,
} from "reactstrap";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetAlertsQuery, type Alert } from "../api/sessionsV2.api";

interface SessionAlertsProps {
  sessionName?: string;
  inline?: boolean;
}

const POLL_INTERVAL = 12000;

export default function SessionAlerts({
  sessionName,
  inline = false,
}: SessionAlertsProps) {
  const { data: alerts } = useGetAlertsQuery(
    sessionName ? { sessionName } : skipToken,
    {
      pollingInterval: POLL_INTERVAL,
      refetchOnMountOrArgChange: true,
    }
  );

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return <Alerts alerts={alerts} />;
}

interface AlertsProps {
  alerts: Alert[];
}

function Alerts({ alerts }: AlertsProps) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <>
      <div className="position-relative">
        <Button
          innerRef={ref}
          className={cx(
            "bg-danger",
            "border-0",
            "no-focus",
            "rounded",
            "shadow-none",
            "text-white"
          )}
          style={{ padding: "0.25rem 0.5rem" }}
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
              right: "-8px",
              minWidth: "20px",
            }}
          >
            {alerts.length}
          </Badge>
        )}
      </div>
      <UncontrolledPopover
        target={ref}
        trigger="click"
        placement="auto"
        popperClassName="session-alerts-popover"
      >
        {alerts.map((alert, index) => (
          <div key={alert.id}>
            <PopoverHeader className="text-bg-danger">
              {alert.title}
            </PopoverHeader>
            <PopoverBody className={cx("text-dark", "bg-danger-subtle")}>
              <ReactMarkdown>{alert.message}</ReactMarkdown>
            </PopoverBody>
          </div>
        ))}
      </UncontrolledPopover>
    </>
  );
}

