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
import { useCallback, useState } from "react";
import { Button } from "reactstrap";

import BootstrapCopyIcon from "../../../components/icons/BootstrapCopyIcon";

import { type Project } from "../../projectsV2/api/projectV2.api";
import { useGetUserQuery } from "../../usersV2/api/users.api";
import ProjectCopyModal from "./ProjectCopyModal";

export default function ProjectCopyButton({
  color,
  project,
}: {
  color: string;
  project: Project;
}) {
  const { data: currentUser } = useGetUserQuery();
  const buttonColor = `outline-${color}`;

  const [isModalOpen, setModalOpen] = useState(false);
  const toggleOpen = useCallback(() => {
    setModalOpen((open) => !open);
  }, []);
  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <Button
        color={buttonColor}
        data-cy="copy-project-button"
        onClick={toggleOpen}
      >
        <BootstrapCopyIcon className={cx("bi")} />
        <span className={cx("ms-2")}>Copy project</span>
      </Button>
      {isModalOpen && (
        <ProjectCopyModal
          currentUser={currentUser}
          isOpen={isModalOpen}
          project={project}
          toggle={toggleOpen}
        />
      )}
    </div>
  );
}
