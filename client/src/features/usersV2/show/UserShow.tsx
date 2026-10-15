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

import { Link } from "react-router";
import { Col, Row } from "reactstrap";

import { useNamespaceContext } from "~/features/searchV2/hooks/useNamespaceContext.hook";
import { RELATIVE_ROUTES } from "~/routing/routes.constants";
import DataConnectorsBox from "../../dataConnectorsV2/components/DataConnectorsBox";
import ProjectV2ListDisplay from "../../projectsV2/list/ProjectV2ListDisplay";

export default function UserShow() {
  const ctx = useNamespaceContext();
  if (!ctx || ctx.kind !== "user") return null;
  const { kind, user } = ctx;
  const username = kind === "user" ? user?.username : null;

  if (!username) {
    return null;
  }

  return (
    <Row className="g-4">
      <Col xs={12}>
        <Row className="g-4">
          <Col xs={12} md={6}>
            <ProjectV2ListDisplay
              namespace={username}
              pageParam="projects_page"
              namespaceKind="user"
            >
              <Link
                to={{
                  pathname: RELATIVE_ROUTES.v2.users.show.search,
                  search: new URLSearchParams({ type: "Project" }).toString(),
                }}
              >
                View all user projects
              </Link>
            </ProjectV2ListDisplay>
          </Col>
          <Col className="order-3" xs={12} md={6}>
            <DataConnectorsBox
              namespace={username}
              namespaceKind="user"
              pageParam="data_connectors_page"
            >
              <Link
                to={{
                  pathname: RELATIVE_ROUTES.v2.users.show.search,
                  search: new URLSearchParams({
                    type: "DataConnector",
                  }).toString(),
                }}
              >
                View all user data connectors
              </Link>
            </DataConnectorsBox>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
