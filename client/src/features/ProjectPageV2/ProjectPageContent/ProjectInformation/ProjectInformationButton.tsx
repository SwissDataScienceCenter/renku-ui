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

import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import cx from "classnames";
import { useCallback, useState } from "react";
import { DropdownItem } from "reactstrap";
import { SingleButtonWithMenu } from "../../../../components/buttons/Button";
import BootstrapCopyIcon from "../../../../components/icons/BootstrapCopyIcon";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import type { Project } from "../../../projectsV2/api/projectV2.api";
import ProjectCopyModal from "../../ProjectPageHeader/ProjectCopyModal";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";

export default function ProjectInformationButton({
  project,
}: {
  userPermissions: ReturnType<typeof useProjectPermissions>;
  project: Project;
}) {
  const { data: currentUser } = useGetUserQueryState();
  const [isCopyModalOpen, setCopyModalOpen] = useState(false);
  const toggleCopyModal = useCallback(() => {
    setCopyModalOpen((open) => !open);
  }, []);
  const userLogged = useLegacySelector<boolean>(
    (state) => state.stateModel.user.logged
  );
  if (!userLogged) return null;
  return (
    <>
      <SingleButtonWithMenu color="outline-primary" size="sm">
        <DropdownItem
          data-cy="project-copy-menu-item"
          onClick={toggleCopyModal}
        >
          <BootstrapCopyIcon className={cx("bi")} />
          <span className={cx("ms-2")}>Copy project</span>
        </DropdownItem>
      </SingleButtonWithMenu>
      {
        <ProjectCopyModal
          currentUser={currentUser}
          isOpen={isCopyModalOpen}
          project={project}
          toggle={toggleCopyModal}
        />
      }
    </>
  );
}
