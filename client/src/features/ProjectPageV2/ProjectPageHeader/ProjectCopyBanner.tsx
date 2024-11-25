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
import { BoxArrowInRight, Diagram3Fill } from "react-bootstrap-icons";

import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { useLoginUrl } from "../../../authentication/useLoginUrl.hook";
import SuggestionBanner from "../../../components/SuggestionBanner";
import type { Project } from "../../projectsV2/api/projectV2.api";
import { useGetUserQuery } from "../../usersV2/api/users.api";

import ProjectCopyButton from "./ProjectCopyButton";

export default function ProjectCopyBanner({ project }: { project: Project }) {
  const { data: currentUser } = useGetUserQuery();
  const isUserLoggedIn = useLegacySelector(
    (state) => state.stateModel.user.logged
  );
  const loginUrl = useLoginUrl();
  if (currentUser == null) return null;
  if (project.template_id === null) return null;
  return (
    <SuggestionBanner icon={<Diagram3Fill className="bi" />}>
      <Row className="align-items-center">
        <Col xs={10}>
          <div>
            <b>This project is a template</b>
          </div>
          <div>
            To work with this template, first make a copy.
            {!isUserLoggedIn && (
              <span> To make a copy, you must first log in.</span>
            )}
          </div>
        </Col>
        <Col xs={2}>
          {isUserLoggedIn ? (
            <ProjectCopyButton color="primary" project={project} />
          ) : (
            <div>
              <a className={cx("btn", "btn-primary")} href={loginUrl.href}>
                <BoxArrowInRight className={cx("bi", "me-1")} />
                Log in
              </a>
            </div>
          )}
        </Col>
      </Row>
    </SuggestionBanner>
  );
}
