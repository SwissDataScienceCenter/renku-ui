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
import { useCallback, useState } from "react";
import { CodeSquare } from "react-bootstrap-icons";

import { PlusRoundButton } from "../../../../components/buttons/Button.tsx";
import { Project } from "../../../projectsV2/api/projectV2.api";
import { AddCodeRepositoryStep1Modal } from "./AddCodeRepositoryModal.tsx";
import AccessGuard from "../../utils/AccessGuard.tsx";
import useProjectAccess from "../../utils/useProjectAccess.hook";
import { RepositoryItem } from "./CodeRepositoryDisplay.tsx";

export function CodeRepositoriesDisplay({ project }: { project: Project }) {
  const { userRole } = useProjectAccess({ projectId: project.id });
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const totalRepositories = project.repositories?.length || 0;
  return (
    <>
      <div
        className={cx("p-3", "d-flex", "justify-content-between")}
        data-cy="code-repositories-box"
      >
        <div className="fw-bold">
          <CodeSquare size={20} className={cx("me-2")} />
          Code Repositories ({project?.repositories?.length})
        </div>
        <AccessGuard
          disabled={null}
          enabled={
            <PlusRoundButton data-cy="add-repository" handler={toggle} />
          }
          minimumRole="editor"
          role={userRole}
        />
      </div>
      <p className={cx("px-3", totalRepositories > 0 ? "d-none" : "")}>
        Connect code repositories to save and share code.
      </p>
      <div className={cx("p-2", "ps-3", "pb-0")}>
        {project.repositories?.map((repositoryUrl, index) => (
          <RepositoryItem
            key={index}
            project={project}
            url={repositoryUrl}
            showMenu={true}
          />
        ))}
      </div>
      <AddCodeRepositoryStep1Modal
        toggleModal={toggle}
        isOpen={isOpen}
        project={project}
      />
    </>
  );
}
