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
import projectPreviewImg from "../../../../styles/assets/projectImagePreview.svg";
import { Url } from "../../../../utils/helpers/url";
import { Project } from "../../../projectsV2/api/projectV2.api.ts";
import styles from "./ProjectInformation.module.scss";

export function ProjectImageView() {
  return (
    <div className={cx(styles.projectPageImgPlaceholder)}>
      <img
        src={projectPreviewImg}
        className="rounded-2"
        alt="Project image preview"
      />
    </div>
  );
}

export default function ProjectInformation({ project }: { project: Project }) {
  const totalMembers = 0; //TODO get member list
  const settingsUrl = Url.get(Url.pages.projectV2.settings, {
    namespace: project.namespace,
    slug: project.slug,
  });

  return (
    <aside className={cx("px-3", "pb-5", "pb-lg-2")}>
      <div
        className={cx(
          "my-4",
          "d-block",
          "d-lg-none",
          "d-sm-block",
          "text-center"
        )}
      >
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
        <div className={cx("flex-grow-1", "border-bottom")}></div>
        <EditButtonLink to={settingsUrl} tooltip="Modify project information" />
      </div>
      <div className={cx("border-bottom", "py-3", "text-start", "text-lg-end")}>
        <div>Namespace</div>
        <div className="fw-bold">{project.namespace}</div>
      </div>
      <div className={cx("border-bottom", "py-3", "text-start", "text-lg-end")}>
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
      <div className={cx("border-bottom", "py-3", "text-start", "text-lg-end")}>
        <div>
          Created{" "}
          <TimeCaption
            datetime={project.creation_date}
            className={cx("fw-bold", "fs-6")}
          />
        </div>
      </div>
      <div className={cx("border-bottom", "py-3", "text-start", "text-lg-end")}>
        <div>Members ({totalMembers})</div>
        {totalMembers === 0 && (
          <UnderlineArrowLink
            tooltip="Add project members"
            text="Add members"
            to={settingsUrl}
          />
        )}
      </div>
    </aside>
  );
}
