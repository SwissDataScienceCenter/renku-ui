/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { useCallback, useMemo, type ReactNode } from "react";
import { Ban, CalendarX, Check, SkipForward, XLg } from "react-bootstrap-icons";
import { generatePath, Link, useNavigate } from "react-router";
import {
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledAccordion,
} from "reactstrap";

import ScrollableModal from "~/components/modal/ScrollableModal";
import { TimeCaption } from "~/components/TimeCaption";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import type { Project } from "../projectsV2/api/projectV2.api";
import { isDataConnectorExpired } from "./sessionLaunchValidation.utils";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";
import type { SessionStartDataConnectorConfiguration } from "./startSessionOptionsV2.types";

interface VisibleItem {
  id: string;
  label: string;
}

interface SessionExpiredDataConnectorsModalProps {
  dataConnectors: SessionStartDataConnectorConfiguration[];
  embedded?: boolean;
  isOpen: boolean;
  project: Project;
  onCancel?: () => void;
  onSkip?: () => void;
  continueLabel?: string;
  visibleItems?: VisibleItem[];
}
export default function SessionExpiredDataConnectorsModal({
  dataConnectors,
  embedded = false,
  isOpen,
  project,
  onCancel: onCancelProp,
  onSkip: onSkipProp,
  continueLabel = "Launch anyway",
  visibleItems,
}: SessionExpiredDataConnectorsModalProps) {
  const navigate = useNavigate();
  const defaultOnCancel = useCallback(() => {
    const url = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
      namespace: project.namespace,
      slug: project.slug,
    });
    navigate(url);
  }, [navigate, project.namespace, project.slug]);
  const onCancel = onCancelProp ?? defaultOnCancel;

  const expiredDataConnectors = useMemo(
    () => dataConnectors.filter(isDataConnectorExpired),
    [dataConnectors],
  );

  const dispatch = useAppDispatch();
  const defaultOnSkip = useCallback(() => {
    const updatedDataConnectors = dataConnectors.map((config) =>
      isDataConnectorExpired(config)
        ? { ...config, active: false, skip: true }
        : config,
    );
    dispatch(
      startSessionOptionsV2Slice.actions.setDataConnectorsOverrides(
        updatedDataConnectors,
      ),
    );
    dispatch(
      startSessionOptionsV2Slice.actions.setDataConnectorsExpirationReady(true),
    );
  }, [dispatch, dataConnectors]);
  const onSkip = onSkipProp ?? defaultOnSkip;
  const rows = useMemo(
    () =>
      expiredConnectorRows(dataConnectors, visibleItems, expiredDataConnectors),
    [dataConnectors, expiredDataConnectors, visibleItems],
  );
  const pendingCount = rows.filter((row) => row.status == null).length;
  const openIds = rows
    .filter((row) => row.status == null)
    .map((row) => expiredConnectorAccordionId(row.id));
  const list = (
    <>
      {pendingCount > 0 && (
        <p data-cy="session-expired-data-connectors-warning">
          There{" "}
          {pendingCount === 1
            ? "is 1 data connector that has expired"
            : `are ${pendingCount} data connectors that have expired`}{" "}
          and <b>will not be mounted</b> until an owner refreshes it.
        </p>
      )}
      <ExpiredConnectorAccordion key={openIds.join("|")} openIds={openIds}>
        {rows.map((row) => (
          <ExpiredDataConnectorItem
            key={row.id}
            config={row.config}
            id={row.id}
            label={row.label}
            openInNewTab={embedded}
            status={row.status}
          />
        ))}
      </ExpiredConnectorAccordion>
    </>
  );

  if (embedded) {
    return <div data-cy="session-expired-data-connectors-modal">{list}</div>;
  }

  return (
    <ScrollableModal
      centered
      data-cy="session-expired-data-connectors-modal"
      isOpen={isOpen}
      size="lg"
    >
      <ModalHeader tag="h2">
        <CalendarX className={cx("bi", "me-1")} />
        Data connector{expiredDataConnectors.length > 1 && "s"} expired
      </ModalHeader>
      <ModalBody>{list}</ModalBody>
      <ModalFooter>
        <Button
          color="outline-primary"
          data-cy="session-expired-data-connectors-cancel"
          onClick={onCancel}
        >
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="outline-primary"
          data-cy="session-expired-data-connectors-continue"
          onClick={onSkip}
        >
          <SkipForward className={cx("bi", "me-1")} />
          {continueLabel}
        </Button>
      </ModalFooter>
    </ScrollableModal>
  );
}

function ExpiredConnectorAccordion({
  children,
  openIds,
}: {
  children: ReactNode;
  openIds: string[];
}) {
  const toggle = useCallback(() => {}, []);
  return (
    <UncontrolledAccordion
      defaultOpen={openIds}
      stayOpen={true}
      toggle={toggle}
    >
      {children}
    </UncontrolledAccordion>
  );
}

function ExpiredDataConnectorItem({
  config,
  id,
  label,
  openInNewTab,
  status,
}: {
  config: SessionStartDataConnectorConfiguration | undefined;
  id: string;
  label: string;
  openInNewTab: boolean;
  status: "active" | "skipped" | undefined;
}) {
  const accordionId = expiredConnectorAccordionId(id);
  return (
    <AccordionItem
      data-cy={
        status === "skipped"
          ? "session-wizard-skipped-item"
          : status === "active"
            ? "session-wizard-resolved-item"
            : undefined
      }
    >
      <AccordionHeader targetId={accordionId}>
        <span className="fw-bold">{label}</span>
        {status != null && <ExpiredConnectorBadge status={status} />}
      </AccordionHeader>
      <AccordionBody accordionId={accordionId}>
        {config != null ? (
          <ExpiredConnectorDetails
            config={config}
            openInNewTab={openInNewTab}
          />
        ) : (
          <p className="mb-0">Unavailable</p>
        )}
      </AccordionBody>
    </AccordionItem>
  );
}

function ExpiredConnectorBadge({ status }: { status: "active" | "skipped" }) {
  const active = status === "active";
  const colorClass = active
    ? "border-success bg-success-subtle text-success-emphasis"
    : "border-secondary bg-secondary-subtle text-secondary-emphasis";
  return (
    <span className={cx("ms-2", "border", "badge", "fw-normal", colorClass)}>
      {active ? <Check className="me-1" /> : <Ban className="me-1" />}
      {active ? "Active" : "Skipped"}
    </span>
  );
}

function expiredConnectorStatus(
  pending: boolean,
  config: SessionStartDataConnectorConfiguration | undefined,
): "active" | "skipped" | undefined {
  if (pending || config == null) {
    return undefined;
  }
  if (config.skip) {
    return "skipped";
  }
  return "active";
}

function expiredConnectorRows(
  dataConnectors: SessionStartDataConnectorConfiguration[],
  visibleItems: VisibleItem[] | undefined,
  expiredDataConnectors: SessionStartDataConnectorConfiguration[],
) {
  if (visibleItems == null) {
    return expiredDataConnectors.map((config) => ({
      config,
      id: config.dataConnector.id,
      label: config.dataConnector.name,
      status: undefined,
    }));
  }
  const byId = new Map(
    dataConnectors.map((config) => [config.dataConnector.id, config]),
  );
  return visibleItems.map((item) => {
    const config = byId.get(item.id);
    const pending = config != null && isDataConnectorExpired(config);
    const status = expiredConnectorStatus(pending, config);
    return {
      config,
      id: item.id,
      label: config?.dataConnector.name ?? item.label,
      status,
    } as const;
  });
}

function ExpiredConnectorDetails({
  config,
  openInNewTab,
}: {
  config: SessionStartDataConnectorConfiguration;
  openInNewTab: boolean;
}) {
  const { expires_at: expiresAt, slug, storage } = config.dataConnector;
  return (
    <>
      {expiresAt != null && (
        <p className="mb-1">
          Expired: <TimeCaption datetime={expiresAt} enableTooltip noCaption />
        </p>
      )}
      <p className="mb-1">Source path: {storage.source_path}</p>
      <p className="mb-1">Mount point: {storage.target_path}</p>
      <ExpiredConnectorLink openInNewTab={openInNewTab} slug={slug} />
    </>
  );
}

function ExpiredConnectorLink({
  openInNewTab,
  slug,
}: {
  openInNewTab: boolean;
  slug: string;
}) {
  const url = generatePath(ABSOLUTE_ROUTES.v2.dataConnectors.show.root, {
    slug,
  });
  const newTabProps = openInNewTab
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
  return (
    <p className="mb-0">
      <Link {...newTabProps} to={url}>
        View data connector
      </Link>
    </p>
  );
}

function expiredConnectorAccordionId(id: string) {
  return `expired-connector-${encodeURIComponent(id)}`;
}
