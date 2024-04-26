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
import { Loader } from "../../../components/Loader.tsx";
import { RtkErrorAlert } from "../../../components/errors/RtkErrorAlert.tsx";
import { Url } from "../../../utils/helpers/url";
import { useGetProjectsByNamespaceAndSlugQuery } from "../../projectsV2/api/projectV2.api.ts";
import { isErrorResponse } from "../../projectsV2/api/projectV2.enhanced-api.ts";
import ProjectInformation from "../ProjectPageContent/ProjectInformation/ProjectInformation.tsx";
import ProjectPageContent from "../ProjectPageContent/ProjectPageContent.tsx";
import ProjectPageHeader from "../ProjectPageHeader/ProjectPageHeader.tsx";
import ProjectPageNav from "../ProjectPageNav/ProjectPageNav.tsx";
import styles from "./ProjectPageContainer.module.scss";

export enum ProjectPageContentType {
  Overview = "Overview",
  Settings = "Settings",
  ProjectInfo = "ProjectInfo",
}
export default function ProjectPageContainer({
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
    if (isErrorResponse(error)) {
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
      <Col sm={12} className={styles.HeaderContainer}>
        <ProjectPageHeader project={data}></ProjectPageHeader>
      </Col>
      <Col sm={12} lg={1} className={styles.NavContainer}>
        <ProjectPageNav
          selectedContent={contentPage}
          namespace={namespace}
          slug={slug}
        ></ProjectPageNav>
      </Col>
      <Col sm={12} lg={9}>
        <ProjectPageContent
          selectedContent={contentPage}
          project={data}
        ></ProjectPageContent>
      </Col>
      <Col sm={12} lg={2} className={cx("d-none", "d-lg-block", " d-sm-none")}>
        <ProjectInformation project={data}></ProjectInformation>
      </Col>
    </Row>
  );
}
