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

import { Link } from "react-router";
import { Col, Row } from "reactstrap";

import { useNamespaceContext } from "~/features/searchV2/hooks/useNamespaceContext.hook";
import { RELATIVE_ROUTES } from "~/routing/routes.constants";
import DataConnectorsBox from "../../dataConnectorsV2/components/DataConnectorsBox";
import ProjectV2ListDisplay from "../../projectsV2/list/ProjectV2ListDisplay";
import GroupInformation from "./GroupV2Information";

export default function GroupV2Show() {
  const { namespace } = useNamespaceContext();

  if (!namespace) return null;

  return (
    <Row className="g-4">
      <Col xs={12} md={8} xl={9}>
        <Row className="g-4">
          <Col xs={12}>
            <ProjectV2ListDisplay
              limit={2}
              namespace={namespace}
              pageParam="projects_page"
              namespaceKind="group"
            >
              <Link
                to={{
                  pathname: RELATIVE_ROUTES.v2.groups.show.search,
                  search: new URLSearchParams({ type: "Project" }).toString(),
                }}
              >
                View all group projects
              </Link>
            </ProjectV2ListDisplay>
          </Col>
          <Col className="order-3" xs={12}>
            <DataConnectorsBox
              limit={2}
              namespace={namespace}
              namespaceKind="group"
              pageParam="data_connectors_page"
            >
              <Link
                to={{
                  pathname: RELATIVE_ROUTES.v2.groups.show.search,
                  search: new URLSearchParams({
                    type: "DataConnector",
                  }).toString(),
                }}
              >
                View all group data connectors
              </Link>
            </DataConnectorsBox>
          </Col>
        </Row>
      </Col>
      <Col xs={12} md={4} xl={3}>
        <GroupInformation output="card" />
      </Col>
    </Row>
  );
}
