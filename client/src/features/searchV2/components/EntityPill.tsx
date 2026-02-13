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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useMemo, useRef } from "react";
import {
  Database,
  Folder2Open,
  Icon,
  People,
  Person,
  Question,
} from "react-bootstrap-icons";
import { Badge, UncontrolledTooltip } from "reactstrap";

import useLocationHash from "../../../utils/customHooks/useLocationHash.hook";
import { useGetDataConnectorsByDataConnectorIdQuery } from "../../dataConnectorsV2/api/data-connectors.api";
import DataConnectorView from "../../dataConnectorsV2/components/DataConnectorView";
import { type SearchEntity } from "../api/searchV2Api.api";
import { toDisplayName } from "../searchV2.utils";

interface EntityPillProps {
  entityType: SearchEntity["type"];
  size?: "sm" | "md" | "lg" | "xl" | "auto";
  tooltip?: boolean;
  tooltipPlacement?: "top" | "bottom" | "left" | "right";
}
export function EntityPill({
  entityType,
  size = "auto",
  tooltip = true,
  tooltipPlacement = "top",
}: EntityPillProps) {
  const ref = useRef<HTMLDivElement>(null);
  const IconComponent: Icon =
    entityType === "Project"
      ? Folder2Open
      : entityType === "Group"
      ? People
      : entityType === "User"
      ? Person
      : entityType === "DataConnector"
      ? Database
      : Question;
  const sizeClass =
    size == "sm"
      ? "fs-6"
      : size === "md"
      ? "fs-5"
      : size === "lg"
      ? "fs-4"
      : size === "xl"
      ? "fs-2"
      : null;

  return (
    <>
      <div ref={ref}>
        <Badge
          className={cx(
            "bg-light",
            "border-dark-subtle",
            "border",
            "d-flex",
            "p-2",
            "text-dark-emphasis",
            sizeClass
          )}
          pill
        >
          <IconComponent />
        </Badge>
      </div>
      {tooltip && (
        <UncontrolledTooltip placement={tooltipPlacement} target={ref}>
          {toDisplayName(entityType)}
        </UncontrolledTooltip>
      )}
    </>
  );
}

export function ShowGlobalDataConnector() {
  const [hash, setHash] = useLocationHash();

  const dataConnectorId = useMemo(
    () =>
      hash.startsWith("data-connector-")
        ? hash.slice("data-connector-".length)
        : undefined,
    [hash]
  );

  const { currentData: dataConnector } =
    useGetDataConnectorsByDataConnectorIdQuery(
      dataConnectorId != null ? { dataConnectorId } : skipToken
    );

  const toggleView = useCallback(() => {
    setHash((prev) => {
      const isOpen = !!prev;
      return isOpen ? "" : `data-connector-${dataConnectorId}`;
    });
  }, [dataConnectorId, setHash]);

  if (dataConnector == null) {
    return null;
  }

  return (
    <DataConnectorView
      dataConnector={dataConnector}
      showView
      toggleView={toggleView}
    />
  );
}
