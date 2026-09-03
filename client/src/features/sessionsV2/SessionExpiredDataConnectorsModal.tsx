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
import { useCallback, useMemo } from "react";
import { CalendarX, SkipForward, XLg } from "react-bootstrap-icons";
import { generatePath, Link, useNavigate } from "react-router";
import {
  Button,
  ListGroup,
  ListGroupItem,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import ScrollableModal from "~/components/modal/ScrollableModal";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import type { Project } from "../projectsV2/api/projectV2.api";
import { isDataConnectorExpired } from "./sessionLaunchValidation.utils";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";
import type { SessionStartDataConnectorConfiguration } from "./startSessionOptionsV2.types";

interface SessionExpiredDataConnectorsModalProps {
  isOpen: boolean;
  project: Project;
  dataConnectors: SessionStartDataConnectorConfiguration[];
}
export default function SessionExpiredDataConnectorsModal({
  isOpen,
  project,
  dataConnectors,
}: SessionExpiredDataConnectorsModalProps) {
  const navigate = useNavigate();
  const onCancel = useCallback(() => {
    const url = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
      namespace: project.namespace,
      slug: project.slug,
    });
    navigate(url);
  }, [navigate, project.namespace, project.slug]);

  const expiredDataConnectors = useMemo(
    () => dataConnectors.filter(isDataConnectorExpired),
    [dataConnectors],
  );

  const dispatch = useAppDispatch();
  const onSkip = useCallback(() => {
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
      <ModalBody>
        <p data-cy="session-expired-data-connectors-warning">
          There{" "}
          {expiredDataConnectors.length === 1
            ? "is 1 data connector that has expired"
            : `are ${expiredDataConnectors.length} data connectors that have expired`}{" "}
          and <b>will not be mounted</b> until an owner refreshes it.
        </p>
        <ListGroup>
          {expiredDataConnectors.map((config) => (
            <ExpiredDataConnectorWarning
              key={config.dataConnector.id}
              config={config}
            />
          ))}
        </ListGroup>
      </ModalBody>
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
          Launch anyway
        </Button>
      </ModalFooter>
    </ScrollableModal>
  );
}

interface ExpiredDataConnectorWarningProps {
  config: SessionStartDataConnectorConfiguration;
}
function ExpiredDataConnectorWarning({
  config,
}: ExpiredDataConnectorWarningProps) {
  const { dataConnector } = config;
  const url = generatePath(ABSOLUTE_ROUTES.v2.dataConnectors.show.root, {
    slug: dataConnector.slug,
  });

  return (
    <ListGroupItem>
      <h3>{dataConnector.name}</h3>
      <p className="mb-0">
        <Link to={url}>View data connector</Link>
      </p>
    </ListGroupItem>
  );
}
