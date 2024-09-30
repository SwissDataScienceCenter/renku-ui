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
import { useCallback, useState } from "react";
import { Globe2, Lock } from "react-bootstrap-icons";
import { Col, ListGroupItem, Row } from "reactstrap";

import ClampedParagraph from "../../../components/clamped/ClampedParagraph";
import { TimeCaption } from "../../../components/TimeCaption";
import type {
  DataConnector,
  DataConnectorToProjectLink,
} from "../api/data-connectors.api";

import DataConnectorView from "./DataConnectorView";

interface DataConnectorBoxListDisplayProps {
  dataConnector: DataConnector;
  dataConnectorLink?: DataConnectorToProjectLink;
}
export default function DataConnectorBoxListDisplay({
  dataConnector,
  dataConnectorLink,
}: DataConnectorBoxListDisplayProps) {
  const {
    name,
    description,
    visibility,
    creation_date: creationDate,
  } = dataConnector;

  const [showDetails, setShowDetails] = useState(false);
  const toggleDetails = useCallback(() => {
    setShowDetails((open) => !open);
  }, []);

  return (
    <>
      <ListGroupItem
        action
        className={cx("cursor-pointer", "link-primary", "text-body")}
        onClick={toggleDetails}
      >
        <Row className={cx("align-items-center", "g-2")}>
          <Col>
            <span className="fw-bold" data-cy="data-connector-name">
              {name}
            </span>
            {description && <ClampedParagraph>{description}</ClampedParagraph>}
            <div
              className={cx(
                "align-items-center",
                "d-flex",
                "flex-wrap",
                "gap-2",
                "justify-content-between",
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
