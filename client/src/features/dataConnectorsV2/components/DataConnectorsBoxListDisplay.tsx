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
 * limitations under the License
 */

import cx from "classnames";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  EyeFill,
  Folder,
  Globe2,
  Journals,
  Lock,
  Pencil,
} from "react-bootstrap-icons";
import { Link, To, useLocation } from "react-router";
import {
  Badge,
  Col,
  ListGroupItem,
  Row,
  UncontrolledTooltip,
} from "reactstrap";

import useLocationHash from "../../../utils/customHooks/useLocationHash.hook";
import UserAvatar from "../../usersV2/show/UserAvatar";
import type {
  DataConnector,
  DataConnectorToProjectLink,
} from "../api/data-connectors.api";
import { DATA_CONNECTORS_VISIBILITY_WARNING } from "./dataConnector.constants";
import {
  getDataConnectorScope,
  useGetDataConnectorSource,
} from "./dataConnector.utils";
import DataConnectorActions from "./DataConnectorActions";
import DataConnectorModal from "./DataConnectorModal";
import DataConnectorView from "./DataConnectorView";

interface DataConnectorBoxListDisplayProps {
  dataConnector: DataConnector;
  dataConnectorLink?: DataConnectorToProjectLink;
  extendedPreview?: boolean;
  dataConnectorPotentiallyInaccessible?: boolean;
}
export default function DataConnectorBoxListDisplay({
  dataConnector,
  dataConnectorLink,
  extendedPreview,
  dataConnectorPotentiallyInaccessible = false,
}: DataConnectorBoxListDisplayProps) {
  const { name, visibility, storage, namespace } = dataConnector;

  // Handle hash
  const [hash, setHash] = useLocationHash();
  const dcHash = useMemo(
    () => `data-connector-${dataConnector.id}`,
    [dataConnector.id]
  );
  const showOffCanvas = useMemo(() => hash === dcHash, [dcHash, hash]);
  const toggleOffCanvas = useCallback(() => {
    setHash((prev) => {
      const isOpen = prev === dcHash;
      return isOpen ? "" : dcHash;
    });
  }, [dcHash, setHash]);

  // Handle url with Hash
  const location = useLocation();
  const targetOffcanvasLocation: To = {
    pathname: location.pathname,
    search: location.search,
    hash: `#${dcHash}`,
  };

  // Handle modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [initialStep, setInitialStep] = useState(2);
  const toggleEdit = useCallback((initialStep?: number) => {
    if (initialStep) setInitialStep(initialStep);
    setIsEditOpen((open) => !open);
  }, []);

  // Data
  const dataConnectorSource = useGetDataConnectorSource(dataConnector);
  const type = `${storage?.configuration?.type?.toString() ?? ""} ${
    storage?.configuration?.provider?.toString() ?? ""
  }`;

  // Components
  const readOnly =
    extendedPreview &&
    (storage?.readonly ? (
      <div>
        <EyeFill className={cx("bi", "me-1")} />
        Read only
      </div>
    ) : (
      <div>
        <Pencil className={cx("bi", "me-1")} />
        Allow Read-write
      </div>
    ));

  const scopeIcon = useMemo(() => {
    const scope = getDataConnectorScope(namespace);
    if (scope === "project") {
      return <Folder className="bi" />;
    }
    if (scope === "namespace") {
      return <UserAvatar namespace={namespace as string} size="sm" />;
    }
    return <Journals className="bi" />;
  }, [namespace]);

  return (
    <>
      <ListGroupItem
        action
        className={cx("position-relative", "p-0")}
        data-cy="data-connector-item"
      >
        <Link
          className={cx(
            "d-block",
            "text-body",
            "text-decoration-none",
            "link-primary",
            "py-3"
          )}
          to={targetOffcanvasLocation}
        >
          <Row className={cx("align-items-center", "g-3", "mx-0")}>
            <Col className={cx("d-flex", "flex-column", "min-w-0", "px-0")}>
              <span className="fw-bold" data-cy="data-connector-name">
                {name}
              </span>
              <div
                className={cx(
                  "align-items-center",
                  "d-flex",
                  "flex-row",
                  "gap-1",
                  "text-truncate"
                )}
              >
                {scopeIcon}
                <p className={cx("mb-0", "text-truncate", "text-wrap")}>
                  {dataConnectorSource}
                </p>
              </div>
              {extendedPreview && <div>{type}</div>}
              <div
                className={cx(
                  "align-items-center",
                  "d-flex",
                  "flex-wrap",
                  "gap-1",
                  "justify-content-between"
                )}
              >
                <div
                  className={cx(
                    "align-items-center",
                    "d-flex",
                    "flex-wrap",
                    "gap-2",
                    "mt-auto"
                  )}
                >
                  <div>
                    {visibility.toLowerCase() === "private" ? (
                      <>
                        <Lock className={cx("bi", "me-1")} />
                        Private
                      </>
                    ) : (
                      <>
                        <Globe2 className={cx("bi", "me-1")} />
                        Public
                      </>
                    )}
                  </div>
                  {extendedPreview && readOnly}
                  {dataConnectorPotentiallyInaccessible && (
                    <DataConnectorNotVisibleToAllUsersBadge />
                  )}
                </div>
              </div>
            </Col>
            {/* This column is a placeholder to reserve the space for the action button */}
            <Col xs="auto" className="flex-shrink-0">
              <div
                aria-hidden="true"
                className={cx(
                  "btn",
                  "btn-sm",
                  "opacity-0",
                  "pe-none",
                  "text-nowrap"
                )}
              >
                FakeButton123
              </div>
            </Col>
          </Row>
        </Link>
        {/* The action button is visually positioned over the previous placeholder column */}
        <div
          className={cx("end-0", "mt-3", "position-absolute", "top-0", "z-5")}
        >
          <DataConnectorActions
            dataConnector={dataConnector}
            dataConnectorLink={dataConnectorLink}
            toggleEdit={toggleEdit}
          />
        </div>
      </ListGroupItem>
      <DataConnectorView
        dataConnector={dataConnector}
        dataConnectorLink={dataConnectorLink}
        showView={showOffCanvas}
        toggleView={toggleOffCanvas}
        dataConnectorPotentiallyInaccessible={
          dataConnectorPotentiallyInaccessible
        }
      />
      <DataConnectorModal
        dataConnector={dataConnector}
        isOpen={isEditOpen}
        namespace={dataConnector.namespace}
        toggle={toggleEdit}
        initialStep={initialStep}
      />
    </>
  );
}

export function DataConnectorBoxListDisplayPlaceholder() {
  return (
    <ListGroupItem data-cy="data-connector-box-placeholder">
      <Row>
        <Col className={cx("d-flex", "flex-column")}>
          <h3 className="mb-0">
            <span className={cx("bg-secondary", "col-8", "placeholder")}></span>
          </h3>
          <p className="mb-0">
            <span className={cx("bg-secondary", "col-5", "placeholder")}></span>
          </p>
          <p className="mb-0">
            <span className={cx("bg-secondary", "col-4", "placeholder")}></span>
            <span className={cx("bg-white", "col-5", "placeholder")}></span>
            <span className={cx("bg-secondary", "col-3", "placeholder")}></span>
          </p>
        </Col>
      </Row>
    </ListGroupItem>
  );
}

interface DataConnectorNotVisibleToAllUsersBadgeProps {
  className?: string;
  warning?: string;
}

export function DataConnectorNotVisibleToAllUsersBadge({
  className,
}: DataConnectorNotVisibleToAllUsersBadgeProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <>
      <Badge
        className={cx(
          "rounded-pill",
          "border",
          "bg-warning-subtle",
          "border-warning",
          "text-warning-emphasis",
          className
        )}
        color="primary"
        innerRef={ref}
      >
        Visibility warning
      </Badge>
      <UncontrolledTooltip target={ref} placement="bottom">
        {DATA_CONNECTORS_VISIBILITY_WARNING}
      </UncontrolledTooltip>
    </>
  );
}
