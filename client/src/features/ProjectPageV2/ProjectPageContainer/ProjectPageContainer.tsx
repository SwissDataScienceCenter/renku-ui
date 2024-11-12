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

import {
  Outlet,
  useOutletContext,
  useParams,
} from "react-router-dom-v5-compat";
import { Col, Row } from "reactstrap";

import { Loader } from "../../../components/Loader";
import ContainerWrap from "../../../components/container/ContainerWrap";
import type { Project } from "../../projectsV2/api/projectV2.api";
import { useGetProjectsByNamespaceAndSlugQuery } from "../../projectsV2/api/projectV2.api";
import ProjectNotFound from "../../projectsV2/notFound/ProjectNotFound";
import ProjectPageHeader from "../ProjectPageHeader/ProjectPageHeader";
import ProjectPageNav from "../ProjectPageNav/ProjectPageNav";

export default function ProjectPageContainer() {
  const { namespace, slug } = useParams<{
    id: string | undefined;
    namespace: string | undefined;
    slug: string | undefined;
  }>();
  const { data, isLoading, error } = useGetProjectsByNamespaceAndSlugQuery({
    namespace: namespace ?? "",
    slug: slug ?? "",
    with_documentation: true,
  });

  if (isLoading) return <Loader className="align-self-center" />;

  if (error || data == null) {
    return <ProjectNotFound error={error} />;
  }

  return (
    <ContainerWrap>
      <Row>
        <Col xs={12}>
          <ProjectPageHeader project={data} />
        </Col>
        <Col xs={12} className="mb-2">
          <div className="mb-3">
            <ProjectPageNav project={data} />
          </div>
        </Col>
        <Col xs={12}>
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
