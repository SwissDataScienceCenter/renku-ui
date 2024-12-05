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
import { useCallback, useMemo } from "react";
import { EyeFill, Globe2, Lock, Pencil } from "react-bootstrap-icons";
import { Col, ListGroupItem, Row } from "reactstrap";

import ClampedParagraph from "../../../components/clamped/ClampedParagraph";
import { TimeCaption } from "../../../components/TimeCaption";
import useLocationHash from "../../../utils/customHooks/useLocationHash.hook";
import UserAvatar, { UserAvatarSize } from "../../usersV2/show/UserAvatar";
import type {
  DataConnector,
  DataConnectorToProjectLink,
} from "../api/data-connectors.api";

import DataConnectorView from "./DataConnectorView";

interface DataConnectorBoxListDisplayProps {
  dataConnector: DataConnector;
  dataConnectorLink?: DataConnectorToProjectLink;
  extendedPreview?: boolean;
}
export default function DataConnectorBoxListDisplay({
  dataConnector,
  dataConnectorLink,
  extendedPreview,
}: DataConnectorBoxListDisplayProps) {
  const {
    name,
    description,
    visibility,
    creation_date: creationDate,
    storage,
    namespace,
  } = dataConnector;

  const [hash, setHash] = useLocationHash();
  const dcHash = useMemo(
    () => `data-connector-${dataConnector.id}`,
    [dataConnector.id]
  );
  const showDetails = useMemo(() => hash === dcHash, [dcHash, hash]);
  const toggleDetails = useCallback(() => {
    setHash((prev) => {
      const isOpen = prev === dcHash;
      return isOpen ? "" : dcHash;
    });
  }, [dcHash, setHash]);

  const type = `${storage?.configuration?.type?.toString() ?? ""} ${
    storage?.configuration?.provider?.toString() ?? ""
  }`;
  const readOnly = storage?.readonly ? (
    <div>
      <EyeFill className={cx("bi", "me-1")} />
      Read only
    </div>
  ) : (
    <div>
      <Pencil className={cx("bi", "me-1")} />
      Allow Read-write
    </div>
  );

  return (
    <>
      <ListGroupItem
        action
        className={cx("cursor-pointer", "link-primary", "text-body")}
        onClick={toggleDetails}
      >
        <Row className={cx("align-items-center", "g-2")}>
          <Col className={cx("d-flex", "flex-column", "gap-1")}>
            <span className="fw-bold" data-cy="data-connector-name">
              {name}
            </span>
            <div
              className={cx(
                "d-flex",
                "flex-row",
                "text-truncate",
                "gap-2",
                "align-items-center"
              )}
            >
              <UserAvatar username={namespace} size={UserAvatarSize.small} />
              <p className={cx("mb-0", "text-truncate", "text-muted")}>
                {namespace}
              </p>
            </div>
            {description && <ClampedParagraph>{description}</ClampedParagraph>}
            {extendedPreview && <div className="text-muted">{type}</div>}
            <div
              className={cx(
                "align-items-center",
                "d-flex",
                "flex-wrap",
                "gap-2",
                "justify-content-between"
              )}
            >
              <div
                className={cx(
                  "align-items-center",
                  "d-flex",
                  "flex-wrap",
                  "gap-3",
                  "mt-auto"
                )}
              >
                {visibility.toLowerCase() === "private" ? (
                  <div>
                    <Lock className={cx("bi", "me-1")} />
                    Private
                  </div>
                ) : (
                  <div>
                    <Globe2 className={cx("bi", "me-1")} />
                    Public
                  </div>
                )}
                {extendedPreview && readOnly}
              </div>
              <TimeCaption
                datetime={creationDate}
                prefix="Created"
                enableTooltip
              />
            </div>
          </Col>
        </Row>
      </ListGroupItem>
      <DataConnectorView
        dataConnector={dataConnector}
        dataConnectorLink={dataConnectorLink}
        showView={showDetails}
        toggleView={toggleDetails}
      />
    </>
  );
}
