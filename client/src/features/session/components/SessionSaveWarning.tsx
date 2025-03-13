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

import cx from "classnames";
import { useCallback, useContext, useState } from "react";
import { Button, Modal } from "reactstrap";

import { ACCESS_LEVELS } from "../../../api-client";
import { useLoginUrl } from "../../../authentication/useLoginUrl.hook";
import { InfoAlert } from "../../../components/Alert";
import { ExternalLink } from "../../../components/ExternalLinks";
import { User } from "../../../model/renkuModels.types";
import { ProjectMetadata } from "../../../notebooks/components/session.types";
import { ForkProject } from "../../../project/new";
import { Docs } from "../../../utils/constants/Docs";
import AppContext from "../../../utils/context/appContext";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";

export default function SessionSaveWarning() {
  const logged = useLegacySelector<User["logged"]>(
    (state) => state.stateModel.user.logged
  );
  const { accessLevel, externalUrl } = useLegacySelector<ProjectMetadata>(
    (state) => state.stateModel.project.metadata
  );

  const loginUrl = useLoginUrl();

  if (!logged) {
    return (
      <InfoAlert timeout={0}>
        <p>
          As an anonymous user, you can start{" "}
          <ExternalLink
            role="text"
            title="Sessions"
            url={Docs.rtdHowToGuide(
              "renkulab/session-stopping-and-saving.html"
            )}
          />
          , but you cannot save your work.
        </p>
        <p className="mb-0">
          <a
            className={cx("btn ", "btn-primary", "btn-sm")}
            href={loginUrl.href}
          >
            Log in
          </a>{" "}
          for full access.
        </p>
      </InfoAlert>
    );
  }

  if (accessLevel < ACCESS_LEVELS.DEVELOPER) {
    return (
      <InfoAlert timeout={0}>
        <p>
          You have limited permissions for this project. You can launch a
          session, but you will not be able to save any changes. If you want to
          save your work, consider one of the following:
        </p>
        <ul className="mb-0">
          <li>
            <ForkProjectModal /> and start a session from your fork.
          </li>
          <li className="pt-1">
            <ExternalLink
              size="sm"
              title="Contact a maintainer"
              url={`${externalUrl}/-/project_members`}
            />{" "}
            and ask them to{" "}
            <ExternalLink
              role="text"
              title="grant you the necessary permissions"
              url={Docs.rtdHowToGuide("renkulab/collaboration.html")}
            />
            .
          </li>
        </ul>
      </InfoAlert>
    );
  }

  return null;
}

function ForkProjectModal() {
  const { client, model } = useContext(AppContext);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleIsOpen = useCallback(() => setIsOpen((isOpen) => !isOpen), []);

  const { id, title, visibility } = useLegacySelector<
    ProjectMetadata & { id?: number }
  >((state) => state.stateModel.project.metadata);

  return (
    <>
      <Button
        color="primary"
        id="fork-project"
        onClick={toggleIsOpen}
        size="sm"
      >
        Fork the project
      </Button>
      <Modal isOpen={isOpen} toggle={toggleIsOpen}>
        <ForkProject
          client={client}
          forkedId={id ?? 0}
          forkedTitle={title ?? ""}
          model={model}
          projectVisibility={visibility}
          toggleModal={toggleIsOpen}
        />
      </Modal>
    </>
  );
}
