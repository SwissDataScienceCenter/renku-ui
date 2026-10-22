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
import { useMemo } from "react";
import { Folder, Journals } from "react-bootstrap-icons";

import UserAvatar from "../../usersV2/show/UserAvatar";
import type {
  DataConnector,
  DataConnectorRead,
} from "../api/data-connectors.api";
import {
  getDataConnectorScope,
  useGetDataConnectorSource,
} from "./dataConnector.utils";

interface DataConnectorScopeSourceProps {
  dataConnector: DataConnector | DataConnectorRead;
  textClassName?: string;
}

export default function DataConnectorScopeSource({
  dataConnector,
  textClassName = "text-break",
}: DataConnectorScopeSourceProps) {
  const dataConnectorSource = useGetDataConnectorSource(dataConnector);
  const { namespace } = dataConnector;
  const scopeIcon = useMemo(() => {
    const scope = getDataConnectorScope(namespace);
    if (scope === "project") {
      return <Folder className={cx("bi", "flex-shrink-0")} />;
    }
    if (scope === "namespace" && namespace) {
      return <UserAvatar namespace={namespace} size="sm" />;
    }
    return <Journals className={cx("bi", "flex-shrink-0")} />;
  }, [namespace]);

  return (
    <div
      className={cx(
        "align-items-center",
        "d-flex",
        "flex-row",
        "gap-1",
        "min-w-0",
      )}
    >
      {scopeIcon}
      <span className={cx("d-block", "min-w-0", textClassName)}>
        {dataConnectorSource}
      </span>
    </div>
  );
}
