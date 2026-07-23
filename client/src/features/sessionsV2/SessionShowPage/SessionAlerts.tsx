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
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Bell, BoxArrowUpRight, XLg } from "react-bootstrap-icons";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router";
import {
  Badge,
  Button,
  Popover,
  PopoverBody,
  PopoverHeader,
  UncontrolledTooltip,
} from "reactstrap";

import { ErrorAlert } from "~/components/Alert";
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
    <Link to={props.href} target="_blank" rel="noreferrer noopener">
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
    },
  );

  return <Alerts alerts={alerts ?? []} />;
}

interface AlertsProps {
  alerts: Alert[];
}

function Alerts({ alerts }: AlertsProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const prevAlertIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!alerts || alerts.length === 0) {
      prevAlertIdsRef.current = new Set();
      // TODO: fix react-hooks/set-state-in-effect
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(false);
      return;
    }

    const currentAlertIds = new Set(alerts.map((alert) => alert.id));

    const hasNewAlerts = alerts.some(
      (alert) => !prevAlertIdsRef.current.has(alert.id),
    );

    if (hasNewAlerts) {
      // TODO: fix react-hooks/set-state-in-effect
      setIsOpen(true);
    }

    prevAlertIdsRef.current = currentAlertIds;
  }, [alerts]);

  const togglePopover = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);
  const closePopover = useCallback(() => {
    setIsOpen(false);
  }, []);

  if (!alerts || alerts.length === 0) {
    return (
      <>
        <span ref={ref} tabIndex={0} data-cy="session-alerts">
          <Button
            className={cx(
              "bg-transparent",
              "border-0",
              "no-focus",
              "p-0",
              "shadow-none",
              "text-dark",
            )}
            disabled
            aria-label="Session alerts"
          >
            <Bell className="bi" />
            <span className="visually-hidden">Session alerts</span>
          </Button>
        </span>
        <UncontrolledTooltip placement="bottom" target={ref}>
          Session alerts — no alerts
        </UncontrolledTooltip>
      </>
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
            "text-danger",
          )}
          data-cy="session-alerts"
          aria-label="Session alerts"
          aria-expanded={isOpen}
          aria-haspopup={"dialog"}
        >
          <Bell className="bi" />
        </Button>
        <AlertsBadge count={alerts.length} />
        {!isOpen && (
          <UncontrolledTooltip placement="bottom" target={ref}>
            Session alerts - {alerts.length} alerts
          </UncontrolledTooltip>
        )}
      </div>
      <Popover
        target={ref}
        isOpen={isOpen}
        toggle={togglePopover}
        trigger="click"
        placement="auto"
        popperClassName="session-alerts-popover"
      >
        <PopoverHeader>
          <div
            className={cx(
              "d-flex",
              "justify-content-between",
              "align-items-center",
              "gap-2",
            )}
          >
            <span>Session alerts</span>
            <button
              type="button"
              className={cx(
                "align-items-center",
                "btn",
                "btn-sm",
                "border-0",
                "d-flex",
                "p-0",
                "shadow-none",
              )}
              data-cy="session-alerts-close"
              aria-label="Close alerts popover"
              onClick={closePopover}
            >
              <XLg className="bi" />
            </button>
          </div>
        </PopoverHeader>
        {alerts.map((alert) => (
          <Fragment key={alert.id}>
            <PopoverBody className="p-0">
              <ErrorAlert timeout={0} dismissible={false} className="m-2">
                <span className="fw-bold">{alert.title}</span>
                <ReactMarkdown components={{ a: LinkRenderer }}>
                  {alert.message}
                </ReactMarkdown>
              </ErrorAlert>
            </PopoverBody>
          </Fragment>
        ))}
      </Popover>
    </>
  );
}

function AlertsBadge({ count }: { count: number }) {
  return (
    <Badge
      color="danger"
      pill
      className="position-absolute"
      style={{
        fontSize: "0.65rem",
        top: "-6px",
        right: "-12px",
        minWidth: "20px",
      }}
    >
      {count}
    </Badge>
  );
}
