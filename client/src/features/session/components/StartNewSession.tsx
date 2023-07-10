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

import React, { useCallback, useContext, useState } from "react";
import { faUserClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { RootStateOrAny, useSelector } from "react-redux";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import { Button, Col, Form, Modal, Row } from "reactstrap";
import { ACCESS_LEVELS } from "../../../api-client";
import { InfoAlert, WarnAlert } from "../../../components/Alert";
import { ExternalLink } from "../../../components/ExternalLinks";
import { GoBackButton } from "../../../components/buttons/Button";
import { LockStatus, User } from "../../../model/RenkuModels";
import { ProjectMetadata } from "../../../notebooks/components/Session";
import { ForkProject } from "../../../project/new";
import { Docs } from "../../../utils/constants/Docs";
import AppContext from "../../../utils/context/appContext";
import { Url } from "../../../utils/helpers/url";
import AnonymousSessionsDisabledNotice from "./AnonymousSessionsDisabledNotice";
import SessionBranchOption from "./SessionBranchOption";
import SessionCommitOption from "./SessionCommitOption";

export default function StartNewSession() {
  const { params } = useContext(AppContext);
  const anonymousSessionsEnabled = !!(
    params as { ANONYMOUS_SESSIONS?: boolean }
  ).ANONYMOUS_SESSIONS;

  const logged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  if (!logged && !anonymousSessionsEnabled) {
    return (
      <>
        <BackButton />
        <AnonymousSessionsDisabledNotice />
      </>
    );
  }

  return (
    <>
      <BackButton />
      <Row>
        <Col sm={12} md={3} lg={4}>
          <SessionStartSidebar />
        </Col>
        <Col sm={12} md={9} lg={8}>
          <Form className="form-rk-green">
            <SessionSaveWarning />
            <StartNewSessionOptions />
          </Form>
        </Col>
      </Row>
    </>
  );
}

function BackButton() {
  const pathWithNamespace = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.pathWithNamespace
  );
  const projectUrlData = {
    namespace: "",
    path: pathWithNamespace,
  };
  const projectUrl = Url.get(Url.pages.project, projectUrlData);

  const location = useLocation<LocationState | undefined>();
  const { from, filePath } = location.state ?? {};
  const backUrl = from ?? projectUrl;
  const backLabel =
    from && filePath
      ? `Back to ${filePath}`
      : from
      ? "Back to notebook file"
      : `Back to ${pathWithNamespace}`;

  return <GoBackButton label={backLabel} url={backUrl} />;
}

interface LocationState {
  from?: string;
  filePath?: string;
}

function SessionStartSidebar() {
  const pathWithNamespace = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.pathWithNamespace
  );

  return (
    <>
      <h2>Start session</h2>
      <p>
        On the project
        <br />
        <b className="text-break">{pathWithNamespace}</b>
      </p>
      <ProjectSessionLockAlert />

      <div className="d-none d-md-block">
        <p>
          A session gives you an environment with resources for doing work. The
          exact details of the available tools depends on the project.
        </p>

        <p>
          The resource settings have been set to the project defaults, but you
          can alter them if you wish.
        </p>
      </div>
    </>
  );
}

function ProjectSessionLockAlert() {
  const lockStatus = useSelector<RootStateOrAny, LockStatus>(
    (state) => state.stateModel.project.lockStatus
  );

  if (lockStatus == null || !lockStatus.locked) {
    return null;
  }

  return (
    <WarnAlert>
      <FontAwesomeIcon icon={faUserClock} />{" "}
      <i>
        Project is being modified. You can start a session, but to avoid{" "}
        conflicts you should not push any changes.
      </i>
    </WarnAlert>
  );
}

function SessionSaveWarning() {
  const location = useLocation();

  const logged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );
  const { accessLevel, externalUrl } = useSelector<
    RootStateOrAny,
    ProjectMetadata
  >((state) => state.stateModel.project.metadata);

  if (!logged) {
    const loginUrl = Url.get(Url.pages.login.link, {
      pathname: location.pathname,
    });

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
          <Link className={cx("btn ", "btn-primary", "btn-sm")} to={loginUrl}>
            Log in
          </Link>{" "}
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

  const { id, title, visibility } = useSelector<
    RootStateOrAny,
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

function StartNewSessionOptions() {
  return (
    <>
      <SessionBranchOption />
      <SessionCommitOption />
    </>
  );
}
