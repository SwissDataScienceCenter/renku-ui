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
import { useMemo, useRef } from "react";
import { PlayFill, SlashCircle } from "react-bootstrap-icons";
import { Link, generatePath } from "react-router-dom-v5-compat";
import { Button, UncontrolledTooltip } from "reactstrap";

import { Loader } from "../../components/Loader";
import { projectV2Api } from "../projectsV2/api/projectV2.enhanced-api";

interface StartSessionButtonAlt1Props {
  projectId: string;
  launcherId: string;
}

export default function StartSessionButtonAlt1({
  projectId,
  launcherId,
}: StartSessionButtonAlt1Props) {
  const { data: project, isLoading } =
    projectV2Api.endpoints.getProjectsByProjectId.useQueryState({
      projectId: projectId ?? "",
    });

  const supportsSessions = useMemo(
    () => (project ? project.repositories?.length == 0 : false),
    [project]
  );

  const ref = useRef<HTMLSpanElement>(null);

  const startUrl = generatePath(
    "/v2/projects/:projectId/sessions/:launcherId/startAlt1",
    {
      projectId,
      launcherId,
    }
  );

  if (isLoading) {
    return (
      <Button type="button" disabled>
        <Loader className="me-1" inline size={16} />
        Loading...
      </Button>
    );
  }

  if (!supportsSessions) {
    return (
      <>
        <span className="d-inline-block" tabIndex={0} ref={ref}>
          <Button type="button" disabled>
            <SlashCircle className={cx("bi", "me-1")} />
            Start
          </Button>
        </span>
        <UncontrolledTooltip target={ref}>
          This project does not support starting sessions.
        </UncontrolledTooltip>
      </>
    );
  }

  return (
    <Link className={cx("btn", "btn-sm", "btn-rk-green")} to={startUrl}>
      <PlayFill className={cx("bi", "me-1")} />
      Start
    </Link>
  );
}
