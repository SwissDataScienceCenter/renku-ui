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
import { TimeCaption } from "../../../../components/TimeCaption.tsx";
import {
  EditButtonLink,
  UnderlineArrowLink,
} from "../../../../components/buttons/Button.tsx";
import VisibilityIcon from "../../../../components/entities/VisibilityIcon.tsx";
import { Url } from "../../../../utils/helpers/url";
import { Project } from "../../../projectsV2/api/projectV2.api.ts";
import styles from "./ProjectInformation.module.scss";

export function ProjectImageView() {
  return <div className={styles.projectPageImgPlaceholder}></div>;
}

export default function ProjectInformation({ project }: { project: Project }) {
  const totalMembers = 0; //TODO get member list
  const totalKeywords = 0; //TODO get keyword list
  const settingsUrl = Url.get(Url.pages.v2Projects.settings, {
    id: project.id,
  });

  return (
    <aside className={styles.ProjectInfoContainer}>
      <div className={cx("my-4", "d-block", "d-lg-none", "d-sm-block")}>
        <ProjectImageView />
      </div>
      <div
        className={cx(
          "d-flex",
          "align-items-center",
          "justify-content-between",
          "gap-2"
        )}
      >
        <div className={styles.divider}></div>
        <EditButtonLink to={settingsUrl} title="Modify project information" />
      </div>
      <div className={styles.ProjectInformationItem}>
        <div>Namespace</div>
        <div className="fw-bold">{project.namespace}</div>
      </div>
      <div className={styles.ProjectInformationItem}>
        <div>Visibility</div>
        <VisibilityIcon
          className={cx(
            "fw-bold",
            "justify-content-start",
            "justify-content-lg-end"
          )}
          visibility={project.visibility}
        />
      </div>
      <div className={styles.ProjectInformationItem}>
        <div>
          <TimeCaption
            datetime={project.creation_date}
            prefix="Created"
            className={styles.ProjectTimeLabel}
          />
        </div>
      </div>
      <div className={styles.ProjectInformationItem}>
        <div>Members ({totalMembers})</div>
        {totalMembers === 0 && (
          <UnderlineArrowLink
            title="Add project members"
            text="Add members"
            to={settingsUrl}
          />
        )}
      </div>
      <div className={styles.ProjectInformationItem}>
        <div>Keywords ({totalKeywords})</div>
        {totalKeywords === 0 && (
          <UnderlineArrowLink
            title="Add project keywords"
            text="Add keywords"
            to={settingsUrl}
          />
        )}
      </div>
    </aside>
  );
}
