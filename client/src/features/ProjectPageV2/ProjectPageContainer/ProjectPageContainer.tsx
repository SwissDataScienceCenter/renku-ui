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
import {
  Outlet,
  useMatch,
  useOutlet,
  useOutletContext,
  useParams,
} from "react-router-dom-v5-compat";
import { Col, Row } from "reactstrap";

import { Loader } from "../../../components/Loader";
import ContainerWrap from "../../../components/container/ContainerWrap";
import LazyNotFound from "../../../not-found/LazyNotFound";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import type { Project } from "../../projectsV2/api/projectV2.api";
import { useGetProjectsByNamespaceAndSlugQuery } from "../../projectsV2/api/projectV2.api";
import ProjectNotFound from "../../projectsV2/notFound/ProjectNotFound";
import ProjectPageHeader from "../ProjectPageHeader/ProjectPageHeader";
import ProjectPageNav from "../ProjectPageNav/ProjectPageNav";

import styles from "./ProjectPageContainer.module.scss";

export default function ProjectPageContainer() {
  const { namespace, slug } = useParams<{
    id: string | undefined;
    namespace: string | undefined;
    slug: string | undefined;
  }>();
  const { data, isLoading, error } = useGetProjectsByNamespaceAndSlugQuery({
    namespace: namespace ?? "",
    slug: slug ?? "",
  });

  const outlet = useOutlet();

  const isSessions = useMatch(
    `${ABSOLUTE_ROUTES.v2.projects.show.sessions.root}/*`
  );

  if (isLoading) return <Loader className="align-self-center" />;

  if (error || data == null) {
    return <ProjectNotFound error={error} />;
  }

  if (outlet == null) {
    return <LazyNotFound />;
  }

  if (isSessions) {
    return <Outlet />;
  }

  return (
    <ContainerWrap fullSize className="container-lg">
      <Row>
        <Col
          sm={12}
          className={cx("py-4", "px-0", "px-lg-2", styles.HeaderContainer)}
        >
          <ProjectPageHeader project={data} />
        </Col>
        <Col sm={12} lg={1} className={cx(styles.NavContainer)}>
          <div className="sticky-top pt-2 pt-md-4">
            <ProjectPageNav project={data} />
          </div>
        </Col>
        <Col sm={12} lg={11}>
          <main>
            <Outlet context={{ project: data } satisfies ContextType} />
          </main>
        </Col>
      </Row>
    </ContainerWrap>
  );
}

type ContextType = { project: Project };

export function useProject() {
  return useOutletContext<ContextType>();
}
