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
import { Link, Navigate, useParams } from "react-router-dom-v5-compat";

import { Loader } from "../../../components/Loader";
import { Url } from "../../../utils/helpers/url";

import { useGetProjectsByProjectIdQuery } from "../api/projectV2.enhanced-api";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { Col, Row } from "reactstrap";

export function ProjectV2ShowByProjectId() {
  const { id: projectId } = useParams<{
    id: string | undefined;
    namespace: string | undefined;
    slug: string | undefined;
  }>();
  const { data, isLoading, error } = useGetProjectsByProjectIdQuery({
    projectId: projectId ?? "",
  });
  if (isLoading) return <Loader />;
  if (error) {
    return (
      <Row className="mt-3">
        <Col>
          <RtkOrNotebooksError error={error} />
          <p>
            Project does not exist, or you are not authorized to access it.{" "}
          </p>
          <p>
            Click here to{" "}
            <Link to={Url.get(Url.pages.projectV2.list)}>
              return to projects list
            </Link>
            .
          </p>
        </Col>
      </Row>
    );
  }
  return (
    <Navigate
      to={Url.get(Url.pages.projectV2.show, {
        namespace: data?.namespace ?? "",
        slug: data?.slug ?? "",
      })}
      replace
    />
  );
}