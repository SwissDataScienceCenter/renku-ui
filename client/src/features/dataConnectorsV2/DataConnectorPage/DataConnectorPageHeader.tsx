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
import {
  Database,
  FilePerson,
  Globe2,
  Lock,
  Pencil,
} from "react-bootstrap-icons";

import EntityBreadcrumb from "~/components/entityBreadcrumb/EntityBreadcrumb";
import EntityIcon from "~/components/entityIcon/EntityIcon";
import EntityPageHeaderKeywords, {
  usePageHeaderKeywords,
} from "~/components/keywords/EntityPageHeaderKeywords";
import { DataConnectorRead } from "~/features/dataConnectorsV2/api/data-connectors.api";
import { hasSensitiveFields } from "~/features/dataConnectorsV2/components/dataConnector.utils";
import DataConnectorPageHeaderMenu from "~/features/dataConnectorsV2/DataConnectorPage/DataConnectorPageHeaderMenu";

import styles from "~/components/Separator.module.scss";

interface DataConnectorPageHeaderProps {
  dataConnector: DataConnectorRead;
}

export default function DataConnectorPageHeader({
  dataConnector,
}: DataConnectorPageHeaderProps) {
  const {
    hasKeywords,
    keywordsInline,
    keywordsSorted,
    measureRef,
    metadataRef,
    rowRef,
  } = usePageHeaderKeywords(dataConnector.keywords);

  const requiresCredentials = hasSensitiveFields(dataConnector.storage);

  return (
    <div
      className={cx(
        "d-flex",
        "flex-column",
        "gap-3",
        "min-w-0",
        "position-relative",
      )}
    >
      <EntityBreadcrumb dataConnector={dataConnector} />
      <header
        className={cx(
          "d-flex",
          "flex-column",
          "flex-md-row",
          "flex-nowrap",
          "gap-3",
        )}
      >
        <EntityIcon type="dataConnector" />
        <div
          className={cx(
            "d-flex",
            "flex-column",
            "flex-grow-1",
            "justify-content-evenly",
            "min-w-0",
          )}
        >
          <div
            className={cx(
              "d-flex",
              "flex-row",
              "justify-content-between",
              "min-w-0",
              "gap-2",
            )}
          >
            <h1
              className={cx("mb-0", "min-w-0", "text-break")}
              data-cy="data-connector-name"
            >
              {dataConnector.name}
            </h1>
            <DataConnectorPageHeaderMenu dataConnector={dataConnector} />
          </div>
          <div
            ref={rowRef}
            data-cy="data-connector-info"
            className={cx(
              "align-items-center",
              "d-flex",
              "flex-md-nowrap",
              "flex-row",
              "flex-wrap",
              "min-w-0",
            )}
          >
            <div
              ref={metadataRef}
              className={cx(
                "align-items-center",
                "col-12",
                "col-md-auto",
                "d-flex",
                "flex-md-nowrap",
                "flex-row",
                "flex-shrink-0",
                "flex-wrap",
                "gap-3",
                "gap-md-0",
                "min-w-0",
                "mt-2",
                "mt-md-0",
                "mw-100",
                styles.dotSeparated,
              )}
            >
              <DataConnectorHeaderInfo dataConnector={dataConnector} />
              <div
                className={cx(
                  "col-12",
                  "col-md-auto",
                  "flex-shrink-1",
                  "small",
                )}
              >
                <FilePerson className={cx("bi", "me-1")} />
                <span className={cx("text-muted", "me-1")}>
                  Required credentials:
                </span>
                <span>{requiresCredentials ? "Yes" : "No"}</span>
              </div>
            </div>
            {keywordsInline && (
              <EntityPageHeaderKeywords
                keywordsSorted={keywordsSorted}
                leadingSeparator
              />
            )}
          </div>
        </div>
      </header>
      {keywordsInline === false && (
        <EntityPageHeaderKeywords keywordsSorted={keywordsSorted} wrapBadges />
      )}
      {hasKeywords && (
        <EntityPageHeaderKeywords
          keywordsSorted={keywordsSorted}
          leadingSeparator
          measureRef={measureRef}
        />
      )}
    </div>
  );
}

interface DataConnectorHeaderInfoProps {
  dataConnector: DataConnectorRead;
}
function DataConnectorHeaderInfo({
  dataConnector,
}: DataConnectorHeaderInfoProps) {
  const provider =
    dataConnector.storage.configuration["provider"]?.toString() ?? "";
  const type = dataConnector.storage.configuration["type"]?.toString() ?? "";
  return (
    <>
      <div
        className={cx(
          "align-items-center",
          "d-flex",
          "flex-row",
          "flex-shrink-1",
          "min-w-0",
          "small",
        )}
      >
        <Database className={cx("bi", "me-1")} />
        {provider} {type}
      </div>
      <div
        className={cx(
          "align-items-center",
          "d-flex",
          "flex-row",
          "flex-shrink-1",
          "min-w-0",
          "small",
        )}
      >
        <Pencil className={cx("bi", "me-1")} />
        {dataConnector.storage.readonly ? "Read-only" : "Read-Write"}
      </div>
      <div
        className={cx(
          "align-items-center",
          "d-flex",
          "flex-row",
          "flex-shrink-1",
          "min-w-0",
          "small",
        )}
      >
        {dataConnector.visibility === "private" ? (
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
    </>
  );
}
