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
import {
  ArrowRight,
  BoxArrowInRight,
  Diagram3Fill,
} from "react-bootstrap-icons";
import { Link, generatePath } from "react-router";
import { Button } from "reactstrap";

import useUserInfo from "~/features/loginHandler/useUserInfo.hook";
import { useLoginUrl } from "../../../authentication/useLoginUrl.hook";
import BootstrapCopyIcon from "../../../components/icons/BootstrapCopyIcon";
import { Loader } from "../../../components/Loader";
import PrimaryAlert from "../../../components/PrimaryAlert";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import type { Project } from "../../projectsV2/api/projectV2.api";
import { useGetProjectsByProjectIdCopiesQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import { useGetUserQuery } from "../../usersV2/api/users.api";
import useProjectPermissions from "../utils/useProjectPermissions.hook";
import ProjectCopyModal from "./ProjectCopyModal";
import { ProjectCopyListModal } from "./ProjectTemplateInfoBanner";

interface ProjectCopyBannerComponentProps {
  currentUser: ReturnType<typeof useGetUserQuery>["data"];
  project: Project;
  toggleModalOpen: () => void;
}

interface ProjectCopyButtonProps
  extends Omit<ProjectCopyBannerComponentProps, "currentUser"> {
  color: string;
}
function ProjectCopyButton({ color, toggleModalOpen }: ProjectCopyButtonProps) {
  const buttonColor = `outline-${color}`;

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <Button
        color={buttonColor}
        data-cy="copy-project-button"
        onClick={toggleModalOpen}
      >
        <BootstrapCopyIcon className={cx("bi")} />
        <span className={cx("ms-2")}>Copy project</span>
      </Button>
    </div>
  );
}

function ProjectViewerMakeCopyBanner({
  project,
  toggleModalOpen,
}: Omit<ProjectCopyBannerComponentProps, "currentUser">) {
  const isUserLoggedIn = useLegacySelector(
    (state) => state.stateModel.user.logged
  );
  const loginUrl = useLoginUrl();
  return (
    <PrimaryAlert icon={<Diagram3Fill className="bi" />}>
      <div
        className={cx(
          "d-flex",
          "align-items-center",
          "justify-content-between",
          "flex-wrap",
          "w-100"
        )}
      >
        <div>
          <div>
            <b>This project is a template</b>
          </div>
          <div>
            To work with this project, first make a copy.
            {!isUserLoggedIn && (
              <span> To make a copy, you must first log in.</span>
            )}
          </div>
        </div>
        <div>
          {isUserLoggedIn ? (
            <ProjectCopyButton
              color="primary"
              project={project}
              toggleModalOpen={toggleModalOpen}
            />
          ) : (
            <div>
              <a className={cx("btn", "btn-primary")} href={loginUrl.href}>
                <BoxArrowInRight className={cx("bi", "me-1")} />
                Log in
              </a>
            </div>
          )}
        </div>
      </div>
    </PrimaryAlert>
  );
}

interface ProjectGoToCopyBannerProps
  extends Omit<
    ProjectCopyBannerComponentProps,
    "currentUser" | "toggleModalOpen"
  > {
  writableCopies: ReturnType<
    typeof useGetProjectsByProjectIdCopiesQuery
  >["data"];
}

function ProjectViewerGoToCopyBanner({
  project,
  writableCopies,
}: ProjectGoToCopyBannerProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const toggleOpen = useCallback(() => {
    setModalOpen((open) => !open);
  }, []);
  const firstCopy: Project = writableCopies[0];
  const firstUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: firstCopy.namespace,
    slug: firstCopy.slug,
  });
  return (
    <>
      <PrimaryAlert icon={<Diagram3Fill className="bi" />}>
        <div
          className={cx(
            "d-flex",
            "align-items-center",
            "justify-content-between",
            "flex-wrap",
            "w-100"
          )}
        >
          <div>
            <div>This project is a template</div>
            <div>
              {writableCopies.length > 1 ? (
                <span>
                  You have{" "}
                  <span className={cx("badge", "text-bg-secondary")}>
                    {writableCopies.length}
                  </span>{" "}
                  copies of this project.
                </span>
              ) : (
                <b>You already have a project created from this template.</b>
              )}
            </div>
          </div>
          <div>
            <div>
              {writableCopies.length > 1 ? (
                <Button
                  color="primary"
                  className={cx("d-flex", "align-items-center")}
                  data-cy="list-copies-button"
                  outline={true}
                  onClick={toggleOpen}
                >
                  <ArrowRight className={cx("bi", "me-1")} />
                  View my copies
                </Button>
              ) : (
                <Link
                  to={firstUrl}
                  className={cx("btn", "btn-outline-primary")}
                >
                  <ArrowRight className={cx("bi", "me-1")} />
                  Go to my copy
                </Link>
              )}
            </div>
          </div>
        </div>
      </PrimaryAlert>
      {isModalOpen && (
        <ProjectCopyListModal
          copies={writableCopies}
          isOpen={isModalOpen}
          project={project}
          title="My copies of project"
          toggle={toggleOpen}
        />
      )}
    </>
  );
}

function ProjectViewerCopyBanner({
  currentUser,
  project,
  toggleModalOpen,
}: ProjectCopyBannerComponentProps) {
  const { data: writableCopies } = useGetProjectsByProjectIdCopiesQuery({
    projectId: project.id,
    writable: true,
  });
  const isUserLoggedIn = useLegacySelector(
    (state) => state.stateModel.user.logged
  );
  if (currentUser == null) return null;
  if (project.template_id === null) return null;
  if (!isUserLoggedIn)
    return (
      <ProjectViewerMakeCopyBanner
        project={project}
        toggleModalOpen={toggleModalOpen}
      />
    );
  if (writableCopies == null)
    return (
      <PrimaryAlert icon={<Diagram3Fill className="bi" />}>
        <div
          className={cx(
            "d-flex",
            "align-items-center",
            "justify-content-between",
            "flex-wrap",
            "w-100"
          )}
        >
          <div>
            <div>
              <b>This project is a template</b>
            </div>
          </div>
          <div>
            <Loader inline size={16} />
          </div>
        </div>
      </PrimaryAlert>
    );

  if (writableCopies.length > 0)
    return (
      <ProjectViewerGoToCopyBanner
        project={project}
        writableCopies={writableCopies}
      />
    );

  return (
    <ProjectViewerMakeCopyBanner
      project={project}
      toggleModalOpen={toggleModalOpen}
    />
  );
}

export default function ProjectCopyBanner({ project }: { project: Project }) {
  const { data: currentUser } = useUserInfo();
  const userPermissions = useProjectPermissions({ projectId: project.id });

  const [isModalOpen, setModalOpen] = useState(false);
  const toggleOpen = useCallback(() => {
    setModalOpen((open) => !open);
  }, []);
  if (currentUser == null) return null;
  if (project.template_id === null) return null;
  return (
    <>
      <PermissionsGuard
        disabled={
          <ProjectViewerCopyBanner
            currentUser={currentUser}
            project={project}
            toggleModalOpen={toggleOpen}
          />
        }
        enabled={null}
        requestedPermission="write"
        userPermissions={userPermissions}
      />
      {isModalOpen && (
        <ProjectCopyModal
          currentUser={currentUser}
          isOpen={isModalOpen}
          project={project}
          toggle={toggleOpen}
        />
      )}
    </>
  );
}
