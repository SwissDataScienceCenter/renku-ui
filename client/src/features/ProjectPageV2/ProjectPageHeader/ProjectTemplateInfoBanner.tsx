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
import { Col, Row } from "reactstrap";
import { InfoCircle } from "react-bootstrap-icons";

import SuggestionBanner from "../../../components/SuggestionBanner";

import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import type { Project } from "../../projectsV2/api/projectV2.api";
import { useGetProjectsByProjectIdCopiesQuery } from "../../projectsV2/api/projectV2.api";
import { useGetUserQuery } from "../../usersV2/api/users.api";

import useProjectPermissions from "../utils/useProjectPermissions.hook";

function ProjectTemplateEditorBanner({ project }: { project: Project }) {
  const { data: currentUser } = useGetUserQuery();
  const { data: copies } = useGetProjectsByProjectIdCopiesQuery({
    projectId: project.id,
  });
  if (currentUser == null) return null;
  if (project.template_id === null) return null;
  return (
    <SuggestionBanner className="p-2" icon={<InfoCircle className="bi" />}>
      <Row className="align-items-center">
        <Col>
          This project is a template.
          {copies != null && (
            <span>
              There are{" "}
              <span
                className={cx(
                  "badge",
                  copies.length > 0 ? "text-bg-primary" : "text-bg-secondary"
                )}
              >
                {copies.length}
              </span>{" "}
              copies visible to you.
            </span>
          )}
        </Col>
      </Row>
    </SuggestionBanner>
  );
}

export default function ProjectTemplateInfoBanner({
  project,
}: {
  project: Project;
}) {
  const { data: currentUser } = useGetUserQuery();
  const userPermissions = useProjectPermissions({ projectId: project.id });
  if (currentUser == null) return null;
  if (project.template_id === null) return null;
  return (
    <PermissionsGuard
      disabled={null}
      enabled={<ProjectTemplateEditorBanner project={project} />}
      requestedPermission="write"
      userPermissions={userPermissions}
    />
  );
}
