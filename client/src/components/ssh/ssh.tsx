/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { DropdownItem, Modal, ModalBody, ModalHeader } from "reactstrap";

import { Loader } from "../Loader";
import { useGetNotebooksVersionsQuery } from "../../features/versions/versionsApi";
import {
  hideSshModal,
  showSshModal,
  toggleSshModal,
  useDisplaySelector,
} from "../../features/display";
import { Url } from "../../utils/helpers/url";
import { InfoAlert } from "../Alert";
import { ExternalDocsLink } from "../ExternalLinks";
import { Docs } from "../../utils/constants/Docs";
import rkIconSsh from "../../styles/icons/ssh.svg";
import rkIconSshTicked from "../../styles/icons/ssh-ticked.svg";
import rkIconSshCross from "../../styles/icons/ssh-cross.svg";
import { CommandCopy } from "../commandCopy/CommandCopy";
import { projectCoreApi } from "../../features/project/projectCoreApi";
import { cleanGitUrl } from "../../utils/helpers/ProjectFunctions";

const docsIconStyle = {
  showLinkIcon: true,
  iconAfter: true,
  iconSup: true,
};

interface SshDropdownProps {
  fullPath: string;
  gitUrl: string;
}

function SshDropdown({ fullPath, gitUrl }: SshDropdownProps) {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useGetNotebooksVersionsQuery();
  if (error || isLoading || !data?.sshEnabled) return null;

  const handleClick = () => {
    dispatch(showSshModal({ projectPath: fullPath, gitUrl }));
  };

  return (
    <DropdownItem onClick={() => handleClick()}>
      <img
        src={rkIconSsh}
        className="rk-icon rk-icon-md btn-with-menu-margin filter-green"
      />
      Connect with SSH
    </DropdownItem>
  );
}

function SshModal() {
  const displayModal = useDisplaySelector((state) => state.modals.ssh);
  const dispatch = useDispatch();
  const gitUrl = cleanGitUrl(displayModal.gitUrl);

  const notebooksSupport = useGetNotebooksVersionsQuery();
  const coreSupport = projectCoreApi.useGetMigrationStatusQuery(
    {
      gitUrl,
    },
    { skip: !gitUrl }
  );

  // return early if we don't need to display the modal
  if (!displayModal.show) return null;

  // fetch migration data when necessary (i.e. outside the project context, when not already fetched)
  const loading = notebooksSupport.isLoading || coreSupport.isFetching;
  const errorCore = coreSupport.isError;
  const sshCoreSupport =
    coreSupport.data?.details?.template_status?.type === "detail" &&
    coreSupport.data.details.template_status.ssh_supported;
  const sshNotebooksSupport = notebooksSupport.data?.sshEnabled ?? false;

  const toggleModal = () => dispatch(toggleSshModal());
  const closeModal = () => dispatch(hideSshModal());

  let modalBody: React.ReactNode;
  // ? mind that this first case should not happen since modal shouldn't even open for dpeloyment without SSH support.
  if (!sshNotebooksSupport) {
    modalBody = (
      <>
        <p>This RenkuLab deployment doesn{"'"}t support SSH.</p>
        <p>Please contact your local administrator for further details.</p>
      </>
    );
  } else if (errorCore) {
    modalBody = (
      <>
        <p>
          An error occurred while verifying SSH support on your project. Please
          check the following message for further details.
        </p>
        <p>
          Please refer to{" "}
          <ExternalDocsLink
            {...docsIconStyle}
            url={Docs.rtdHowToGuide("renkulab/ssh-into-sessions.html")}
            title="our documentation"
          />{" "}
          to get further information.
        </p>
      </>
    );
  } else if (loading) {
    modalBody = (
      <>
        <p>Checking project status...</p>
        <Loader />
      </>
    );
  } else if (!sshCoreSupport) {
    const updateUrl = Url.get(Url.pages.project.settings, {
      namespace: "",
      path: displayModal.projectPath,
    });
    modalBody = (
      <>
        <p>
          <img
            src={rkIconSshCross}
            className="rk-icon rk-icon-md filter-dark me-2"
          />
          <b>Your project needs to be updated to support SSH.</b>
        </p>
        <p>
          To update your project, go to{" "}
          <Link to={updateUrl} onClick={() => closeModal()}>
            Project settings
          </Link>{" "}
          and update the Template Version. Then, click again on the{" "}
          <i>Connect with SSH</i> button to view the commands to connect
          remotely via SSH.
        </p>
        <InfoAlert dismissible={false} timeout={0}>
          Still not working? This might be because your project has a custom
          template. See{" "}
          <ExternalDocsLink
            {...docsIconStyle}
            url={Docs.rtdHowToGuide("renkulab/ssh-into-sessions.html")}
            title="our documentation"
          />{" "}
          for more information.
        </InfoAlert>
      </>
    );
  } else {
    const command = {
      login: `renku login ${window.location.origin}`,
      clone: `renku clone ${gitUrl}.git`,
      start: "renku session start -p renkulab --ssh",
      open: "renku session open --ssh <session-id>",
    };
    modalBody = (
      <>
        <div>
          <p>
            <img
              src={rkIconSshTicked}
              className="rk-icon rk-icon-md filter-green me-2"
            />
            <b>Your project supports SSH.</b>
          </p>
          <p>
            You can start and connect to RenkuLab sessions from any machine
            using the{" "}
            <ExternalDocsLink
              {...docsIconStyle}
              url={Docs.rtdHowToGuide(
                "renkulab/ssh-into-sessions.html#set-up-your-local-system-for-ssh-access"
              )}
              title="Renku CLI"
            />
            . Here is how:
          </p>
        </div>

        <div>
          <p className="mb-1">1. Log in to RenkuLab:</p>
          <CommandCopy command={command.login} />
        </div>
        <div>
          <p className="mb-1">2. Clone the repository on your machine:</p>
          <CommandCopy command={command.clone} />
        </div>
        <div>
          <p className="mb-1">
            3. Run the following command within that repository:
          </p>
          <CommandCopy command={command.start} />
        </div>
        <div>
          <p className="mb-1">4. Open the session:</p>
          <CommandCopy command={command.open} />
        </div>

        <p>
          If you need help, you can read here{" "}
          <ExternalDocsLink
            {...docsIconStyle}
            url={Docs.rtdHowToGuide("renkulab/ssh-into-sessions.html")}
            title="our documentation on SSH"
          />
          .
        </p>
        <InfoAlert dismissible={false} timeout={0}>
          If this is your first time using SSH with sessions, any currently
          running sessions will not be SSH-compatible. You need to start a new
          session, as shown in the steps above.
        </InfoAlert>
      </>
    );
  }

  const title = sshNotebooksSupport ? (
    <span>Connect to session with SSH</span>
  ) : (
    <span>
      <img
        src={rkIconSshCross}
        className="rk-icon rk-icon-lg filter-danger me-2"
      />
      SSH not supported
    </span>
  );

  return (
    <Modal isOpen={displayModal.show} toggle={toggleModal} size="lg">
      <ModalHeader toggle={toggleModal}>{title}</ModalHeader>
      <ModalBody>{modalBody}</ModalBody>
    </Modal>
  );
}

export { SshDropdown, SshModal };
