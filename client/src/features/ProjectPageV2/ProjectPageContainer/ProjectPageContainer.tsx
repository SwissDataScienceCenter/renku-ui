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

import cx from "classnames";
import { Link, useParams } from "react-router-dom-v5-compat";
import { Col, Row } from "reactstrap";
import { Loader } from "../../../components/Loader";
import { RtkErrorAlert } from "../../../components/errors/RtkErrorAlert";
import { Url } from "../../../utils/helpers/url";
import { useGetProjectsByNamespaceAndSlugQuery } from "../../projectsV2/api/projectV2.api";
import { isErrorResponse } from "../../projectsV2/api/projectV2.enhanced-api";
import { ProjectV2ShowByProjectId } from "../../projectsV2/show/ProjectV2ShowByProjectId";
import ProjectPageContent from "../ProjectPageContent/ProjectPageContent";
import { ProjectPageContentType } from "../ProjectPageContent/projectPageContentType.types";
import ProjectPageHeader from "../ProjectPageHeader/ProjectPageHeader";
import ProjectPageNav from "../ProjectPageNav/ProjectPageNav";

import styles from "./ProjectPageContainer.module.scss";

function ProjectPageContainerInner({
  contentPage,
}: {
  contentPage: ProjectPageContentType;
}) {
  const { namespace, slug } = useParams<{
    id: string | undefined;
    namespace: string | undefined;
    slug: string | undefined;
  }>();
  const { data, isLoading, error } = useGetProjectsByNamespaceAndSlugQuery({
    namespace: namespace ?? "",
    slug: slug ?? "",
  });

  if (isLoading) return <Loader />;
  if (error) {
    if (isErrorResponse(error) && error?.data?.error?.code == 404) {
      return (
        <Row>
          <Col>
            <div>
              Project does not exist, or you are not authorized to access it.{" "}
              <Link to={Url.get(Url.pages.projectV2.list)}>Return to list</Link>
            </div>
          </Col>
        </Row>
      );
    }
    return (
      <Row>
        <Col>
          <p>Could not retrieve project</p>
          <RtkErrorAlert error={error} />
        </Col>
      </Row>
    );
  }
  if (data == null)
    return (
      <Row>
        <Col>
          <div>Could not retrieve project</div>
        </Col>
      </Row>
    );
  return (
    <Row>
      <Col
        sm={12}
        className={cx("py-4", "px-0", "px-lg-2", styles.HeaderContainer)}
      >
        <ProjectPageHeader project={data} />
      </Col>
      <Col sm={12} lg={1} className={cx(styles.NavContainer)}>
        <div className="sticky-top pt-2 pt-md-4">
          <ProjectPageNav
            project={data}
            selectedContent={contentPage}
          ></ProjectPageNav>
        </div>
      </Col>
      <Col sm={12} lg={11}>
        <ProjectPageContent
          project={data}
          selectedContent={contentPage}
        ></ProjectPageContent>
      </Col>
    </Row>
  );
}

export default function ProjectPageContainer({
  contentPage,
}: {
  contentPage?: ProjectPageContentType;
}) {
  const { id: projectId } = useParams<{
    id: string | undefined;
    namespace: string | undefined;
    slug: string | undefined;
  }>();
  if (projectId != null) {
    return <ProjectV2ShowByProjectId />;
  }
  return (
    <ProjectPageContainerInner
      contentPage={contentPage ?? ProjectPageContentType.Overview}
    />
  );
}
