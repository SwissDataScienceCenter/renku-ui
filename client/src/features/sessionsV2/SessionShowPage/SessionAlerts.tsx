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
import { Fragment, useEffect, useRef, useState } from "react";
import {
  BoxArrowUpRight,
  ExclamationTriangle,
  ExclamationTriangleFill,
} from "react-bootstrap-icons";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router";
import { Badge, Button, Popover, PopoverBody, PopoverHeader } from "reactstrap";

import {
  useGetAlertsQuery,
  type Alert,
} from "~/features/notifications/api/notifications.api";

interface SessionAlertsProps {
  sessionName?: string;
}

const ONE_SECOND = 1_000; // milliseconds

interface LinkRendererProps {
  href?: string;
  children?: React.ReactNode;
}

function LinkRenderer(props: LinkRendererProps) {
  if (!props.href) {
    return <span>{props.children}</span>;
  }

  return (
    <Link to={props.href} target="_blank" rel="noreferrer">
      {props.children}
      <BoxArrowUpRight className={cx("bi", "ms-1")} />
    </Link>
  );
}


export default function SessionAlerts({ sessionName }: SessionAlertsProps) {
  const { data: alerts } = useGetAlertsQuery(
    sessionName ? { params: { session_name: sessionName } } : skipToken,
    {
      pollingInterval: ONE_SECOND,
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
      </div>
      <Popover
        target={ref}
        isOpen={isOpen}
        toggle={togglePopover}
        trigger="legacy"
        placement="auto"
        popperClassName="session-alerts-popover"
      >
        {alerts.map((alert, idx) => (
          <Fragment key={alert.id}>
            <PopoverHeader
              className={cx("text-bg-danger", idx > 0 && "rounded-0")}
            >
              {alert.title}
            </PopoverHeader>
            <PopoverBody className={cx("text-dark", "bg-danger-subtle")}>
              <ReactMarkdown components={{ a: LinkRenderer }}>
                {alert.message}
              </ReactMarkdown>
            </PopoverBody>
          </Fragment>
        ))}
      </Popover>
    </>
  );
}
