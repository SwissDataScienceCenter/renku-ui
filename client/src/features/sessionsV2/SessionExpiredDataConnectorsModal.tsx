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
import { CalendarX, SkipForward, XLg } from "react-bootstrap-icons";
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
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import type { Project } from "../projectsV2/api/projectV2.api";
import { isDataConnectorExpired } from "./sessionLaunchValidation.utils";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";
import type { SessionStartDataConnectorConfiguration } from "./startSessionOptionsV2.types";

interface SessionExpiredDataConnectorsModalProps {
  dataConnectors: SessionStartDataConnectorConfiguration[];
  embedded?: boolean;
  isOpen: boolean;
  project: Project;
  onCancel?: () => void;
  onSkip?: () => void;
  continueLabel?: string;
}
export default function SessionExpiredDataConnectorsModal({
  dataConnectors,
  embedded = false,
  isOpen,
  project,
  onCancel: onCancelProp,
  onSkip: onSkipProp,
  continueLabel = "Launch anyway",
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
  const openIds = expiredDataConnectors.map((config) =>
    expiredConnectorAccordionId(config.dataConnector.id),
  );
  const list = (
    <>
      <p data-cy="session-expired-data-connectors-warning">
        There{" "}
        {expiredDataConnectors.length === 1
          ? "is 1 data connector that has expired"
          : `are ${expiredDataConnectors.length} data connectors that have expired`}{" "}
        and <b>will not be mounted</b> until an owner refreshes it.
      </p>
      <ExpiredConnectorAccordion openIds={openIds}>
        {expiredDataConnectors.map((config) => (
          <ExpiredDataConnectorItem
            key={config.dataConnector.id}
            config={config}
            openInNewTab={embedded}
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
  openInNewTab,
}: {
  config: SessionStartDataConnectorConfiguration;
  openInNewTab: boolean;
}) {
  const accordionId = expiredConnectorAccordionId(config.dataConnector.id);
  return (
    <AccordionItem>
      <AccordionHeader targetId={accordionId}>
        <span className="fw-bold">{config.dataConnector.name}</span>
      </AccordionHeader>
      <AccordionBody accordionId={accordionId}>
        <ExpiredConnectorLink
          openInNewTab={openInNewTab}
          slug={config.dataConnector.slug}
        />
      </AccordionBody>
    </AccordionItem>
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
