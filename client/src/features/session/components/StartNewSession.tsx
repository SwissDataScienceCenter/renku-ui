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

import {
  faExclamationTriangle,
  faLink,
  faPlay,
  faUserClock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { Redirect, useLocation } from "react-router";
import { Link } from "react-router-dom";
import { Button, Col, DropdownItem, Form, Modal, Row } from "reactstrap";

import { ACCESS_LEVELS } from "../../../api-client";
import { InfoAlert, RenkuAlert, WarnAlert } from "../../../components/Alert";
import { ExternalLink } from "../../../components/ExternalLinks";
import { Loader } from "../../../components/Loader";
import {
  ButtonWithMenu,
  GoBackButton,
} from "../../../components/buttons/Button";
import ProgressStepsIndicator, {
  ProgressStyle,
  ProgressType,
  StatusStepProgressBar,
} from "../../../components/progress/ProgressSteps";
import { ShareLinkSessionModal } from "../../../components/shareLinkSession/ShareLinkSession";
import { LockStatus, User } from "../../../model/RenkuModels";
import { ProjectMetadata } from "../../../notebooks/components/session.types";
import { ForkProject } from "../../../project/new";
import { Docs } from "../../../utils/constants/Docs";
import AppContext from "../../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../../utils/context/appParams.constants";
import { isFetchBaseQueryError } from "../../../utils/helpers/ApiErrors";
import { Url } from "../../../utils/helpers/url";
import { getProvidedSensitiveFields } from "../../project/utils/projectCloudStorage.utils";
import { useStartSessionMutation } from "../sessions.api";
import startSessionSlice, {
  setError,
  setStarting,
  setSteps,
  useStartSessionSelector,
} from "../startSession.slice";
import {
  startSessionOptionsSlice,
  useStartSessionOptionsSelector,
} from "../startSessionOptionsSlice";
import AnonymousSessionsDisabledNotice from "./AnonymousSessionsDisabledNotice";
import ProjectSessionsList, { useProjectSessions } from "./ProjectSessionsList";
import AutostartSessionOptions from "./options/AutostartSessionOptions";
import SessionBranchOption from "./options/SessionBranchOption";
import SessionCloudStorageOption from "./options/SessionCloudStorageOption";
import SessionCommitOption from "./options/SessionCommitOption";
import SessionDockerImage from "./options/SessionDockerImage";
import SessionEnvironmentVariables from "./options/SessionEnvironmentVariables";
import { StartNotebookServerOptions } from "./options/StartNotebookServerOptions";

export default function StartNewSession() {
  const { params } = useContext(AppContext);
  const anonymousSessionsEnabled =
    params?.ANONYMOUS_SESSIONS ?? DEFAULT_APP_PARAMS.ANONYMOUS_SESSIONS;

  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const autostart = !!searchParams.get("autostart");

  const logged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  const { starting, error } = useStartSessionSelector();

  const dispatch = useDispatch();

  // Reset start session slice when we navigate away
  useEffect(() => {
    return () => {
      dispatch(startSessionSlice.actions.reset());
    };
  }, [dispatch]);

  const [, { reset }] = useStartSessionMutation({
    fixedCacheKey: "start-session",
  });

  // Reinitialize the mutation state when we navigate away
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  if (!logged && !anonymousSessionsEnabled) {
    return (
      <>
        <BackButton />
        <AnonymousSessionsDisabledNotice />
      </>
    );
  }

  if (starting || (autostart && !error)) {
    return (
      <>
        <BackButton />
        <SessionStarting />
        {autostart && !starting && <AutostartSessionOptions />}
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
          <SessionStartError />
          <StartNewSessionContent />
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
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const fromLandingParam = !!searchParams.get("fromLanding");
  const fromLanding = location.state?.fromLanding || fromLandingParam;

  const backUrl = from ? from : fromLanding ? "/" : projectUrl;
  const backLabel =
    from && filePath
      ? `Back to ${filePath}`
      : from
      ? "Back to notebook file"
      : fromLanding
      ? "Back to home"
      : `Back to ${pathWithNamespace}`;
  return <GoBackButton label={backLabel} url={backUrl} />;
}

interface LocationState {
  from?: string;
  filePath?: string;
  fromLanding?: boolean;
}

function SessionStarting() {
  const namespace = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.namespace
  );
  const path = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.path
  );

  const location = useLocation<LocationState | undefined>();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const fromLandingParam = !!searchParams.get("fromLanding");
  const fromLanding = location.state?.fromLanding || fromLandingParam;

  const steps = useStartSessionSelector(({ steps }) => steps);

  const [, { data: session, error }] = useStartSessionMutation({
    fixedCacheKey: "start-session",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      const errorMessage = isFetchBaseQueryError(error)
        ? (error.data as { error?: { message?: string } }).error?.message ??
          JSON.stringify(error.data)
        : `${error}`;
      dispatch(
        setError({
          error: "backend-error",
          errorMessage,
        })
      );
    }
  }, [dispatch, error]);

  if (session != null) {
    return (
      <Redirect
        to={{
          pathname: Url.get(Url.pages.project.session.show, {
            namespace,
            path,
            server: session.name,
          }),
          state: { redirectFromStartServer: true, fromLanding: fromLanding },
        }}
      />
    );
  }

  return (
    <div className={cx("progress-box-small", "progress-box-small--steps")}>
      <ProgressStepsIndicator
        description="Preparing session"
        type={ProgressType.Determinate}
        style={ProgressStyle.Light}
        title="Step 1 of 2: Preparing session"
        status={steps}
      />
    </div>
  );
}

function SessionStartError() {
  const { error, errorMessage } = useStartSessionSelector(
    ({ error, errorMessage }) => ({ error, errorMessage })
  );

  if (!error) {
    return null;
  }

  // Do not display a message when the error is "existing-session"
  if (error === "existing-session") {
    return null;
  }

  const color =
    error === "docker-image-building" ||
    error === "session-class" ||
    error === "cloud-storage-credentials"
      ? "warning"
      : "danger";

  const content =
    error === "backend-error" ? (
      <>
        An error occurred when trying to start a new session. Error message:{" "}
        {errorMessage}
      </>
    ) : error === "no-commit" ? (
      <>
        Starting a session is not possible because this project has no commit.
      </>
    ) : error === "docker-image-building" ? (
      <>
        The session could not start because the image is still building. Please
        wait for the build to finish, or start the session with the base image.
      </>
    ) : error === "docker-image-not-available" ? (
      <>
        The session could not start because no image is available. Please select
        a different commit or start the session with the base image.
      </>
    ) : error === "session-class" ? (
      <>
        The session could not start because no suitable session class could be
        automatically selected. Please select a session class to start a
        session.
      </>
    ) : error === "invalid-branch" ? (
      <>
        The session could not start because the branch{" "}
        <code>{errorMessage}</code> does not exist. Please select another branch
        to start a session.
      </>
    ) : error === "invalid-commit" ? (
      <>
        The session could not start because the commit{" "}
        <code>{errorMessage}</code> does not exist. Please select another commit
        to start a session.
      </>
    ) : error === "cloud-storage-credentials" ? (
      <>
        The session could not start because some cloud storage configurations
        require credentials. Please add the requested credentials or deactivate
        the corresponding configurations to start a session.
      </>
    ) : (
      <>The session could not start for an unknown reason.</>
    );

  return (
    <RenkuAlert color={color} timeout={0}>
      <p className="mb-0">{content}</p>
    </RenkuAlert>
  );
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

function StartNewSessionContent() {
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const showCreateLink = !!searchParams.get("showCreateLink");

  const projectPathWithNamespace = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.pathWithNamespace
  );
  const projectSessions = useProjectSessions({ projectPathWithNamespace });
  const validSessions = useMemo(
    () =>
      projectSessions != null
        ? Object.values(projectSessions).filter(
            ({ status }) =>
              status.state !== "failed" && status.state !== "stopping"
          )
        : null,
    [projectSessions]
  );

  if (validSessions == null) {
    return (
      <p>
        <Loader className="me-1" inline size={16} />
        Checking existing sessions
      </p>
    );
  }

  if (validSessions.length > 0) {
    return (
      <>
        {showCreateLink && <SessionCreateLink />}

        <WarnAlert>
          <p>
            {validSessions.length > 1
              ? "Multiple sessions already exist "
              : "A session already exists "}
            for this project. Please delete all existing sessions before
            starting a new one.
          </p>
          <p className={cx("mb-0", "fst-italic")}>
            Remember to save existing work before permanently deleting a
            session.
          </p>
        </WarnAlert>
        <ProjectSessionsList
          projectPathWithNamespace={projectPathWithNamespace}
        />
      </>
    );
  }

  return (
    <Form className="form-rk-green">
      <SessionSaveWarning />
      <StartNewSessionOptions />
      <StartSessionButton />
    </Form>
  );
}

function SessionCreateLink() {
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const filePath = searchParams.get("filePath") ?? "";

  const namespace = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.namespace
  );
  const project = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.path
  );

  const { branch, commit, environmentVariables } =
    useStartSessionOptionsSelector();

  const [createLinkIsOpen, setCreateLinkIsOpen] = useState(true);
  const toggleCreateLink = useCallback(() => {
    setCreateLinkIsOpen((isOpen) => !isOpen);
  }, []);

  return (
    <Form className={cx("form-rk-green", "mb-5")}>
      <h2>Create session link</h2>

      <SessionBranchOption />
      <SessionCommitOption />
      <SessionEnvironmentVariables />

      <Button color="secondary" onClick={toggleCreateLink}>
        <FontAwesomeIcon className="me-2" icon={faLink} />
        Create Link
      </Button>

      <ShareLinkSessionModal
        environmentVariables={environmentVariables.map(({ name, value }) => ({
          key: name,
          value,
        }))}
        filters={{
          branch: { name: branch },
          commit: { id: commit },
          namespace,
          project,
        }}
        notebookFilePath={filePath}
        showModal={createLinkIsOpen}
        toggleModal={toggleCreateLink}
      />
    </Form>
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
          <Link className={cx("btn", "btn-primary", "btn-sm")} to={loginUrl}>
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
  const dispatch = useDispatch();

  // Reset start session options slice when we navigate away
  useEffect(() => {
    return () => {
      dispatch(startSessionOptionsSlice.actions.reset());
    };
  }, [dispatch]);

  return (
    <>
      <SessionDockerImage />
      <SessionBranchOption />
      <SessionCommitOption />
      <StartNotebookServerOptions />
      <SessionCloudStorageOption />
      <SessionEnvironmentVariables />
    </>
  );
}

function StartSessionButton() {
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const showCreateLink = !!searchParams.get("showCreateLink");
  const filePath = searchParams.get("filePath") ?? "";

  const namespace = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.namespace
  );
  const project = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.path
  );

  const {
    branch,
    cloudStorage,
    commit,
    defaultUrl,
    dockerImageStatus,
    environmentVariables,
    lfsAutoFetch,
    pinnedDockerImage,
    sessionClass,
    storage,
  } = useStartSessionOptionsSelector();

  const missingCredentialsStorage = useMemo(
    () =>
      cloudStorage
        .filter(({ active }) => active)
        .filter(({ configuration, sensitive_fields }) => {
          const providedSensitiveFields =
            getProvidedSensitiveFields(configuration);
          const requiredSensitiveFields = sensitive_fields?.filter(({ name }) =>
            providedSensitiveFields.includes(name)
          );
          return requiredSensitiveFields?.find(({ value }) => !value);
        }),
    [cloudStorage]
  );

  const enabled =
    dockerImageStatus === "available" && missingCredentialsStorage.length == 0;

  const dispatch = useDispatch();

  const [startSession] = useStartSessionMutation({
    fixedCacheKey: "start-session",
  });

  const onStart = useCallback(() => {
    const cloudStorageValidated = cloudStorage.filter(({ active }) => active);

    const environmentVariablesRecord = environmentVariables
      .filter(({ name, value }) => name && value)
      .reduce(
        (obj, { name, value }) => ({ ...obj, [name]: value }),
        {} as Record<string, string>
      );

    const imageValidated =
      dockerImageStatus === "not-available" ? undefined : pinnedDockerImage;

    dispatch(setStarting(true));
    dispatch(
      setSteps([
        {
          id: 0,
          status: StatusStepProgressBar.EXECUTING,
          step: "Requesting session",
        },
      ])
    );
    startSession({
      branch,
      cloudStorage: cloudStorageValidated,
      commit,
      defaultUrl,
      environmentVariables: environmentVariablesRecord,
      image: imageValidated,
      lfsAutoFetch,
      namespace,
      project,
      sessionClass,
      storage,
    });
  }, [
    branch,
    cloudStorage,
    commit,
    defaultUrl,
    dispatch,
    dockerImageStatus,
    environmentVariables,
    lfsAutoFetch,
    namespace,
    pinnedDockerImage,
    project,
    sessionClass,
    startSession,
    storage,
  ]);

  const [createLinkIsOpen, setCreateLinkIsOpen] = useState(showCreateLink);
  const toggleCreateLink = useCallback(() => {
    setCreateLinkIsOpen((isOpen) => !isOpen);
  }, []);

  const startSessionButton = (
    <Button disabled={!enabled} onClick={onStart} type="button">
      <FontAwesomeIcon className="me-2" icon={faPlay} />
      Start Session
    </Button>
  );

  return (
    <div className="field-group">
      {dockerImageStatus === "not-available" && (
        <div className="pb-2">
          <FontAwesomeIcon
            className={cx("text-warning", "me-1")}
            icon={faExclamationTriangle}
          />
          The image for this commit is not available. See the{" "}
          <strong>Docker Image</strong> section for details.
        </div>
      )}

      {missingCredentialsStorage.length > 0 && (
        <div className={cx("text-danger", "pb-2")}>
          <FontAwesomeIcon className="me-1" icon={faExclamationTriangle} />
          Please provide credentials for the following cloud storage
          {missingCredentialsStorage.length > 1 && "s"}:{" "}
          <strong>
            {missingCredentialsStorage.map(({ name }) => name).join(", ")}
          </strong>
        </div>
      )}

      <div className={cx("d-flex", "flex-row-reverse", "gap-2")}>
        <ButtonWithMenu
          color="rk-green"
          default={startSessionButton}
          direction="up"
          isPrincipal
        >
          <DropdownItem onClick={toggleCreateLink}>
            <FontAwesomeIcon
              className={cx("text-rk-green", "me-2")}
              icon={faLink}
            />
            Create Link
          </DropdownItem>
        </ButtonWithMenu>

        {(dockerImageStatus === "not-available" ||
          dockerImageStatus === "building") && (
          <Button
            color="primary"
            disabled={missingCredentialsStorage.length > 0}
            onClick={onStart}
          >
            <FontAwesomeIcon className="me-2" icon={faPlay} />
            Start with base image
          </Button>
        )}

        <ShareLinkSessionModal
          environmentVariables={environmentVariables.map(({ name, value }) => ({
            key: name,
            value,
          }))}
          filters={{
            branch: { name: branch },
            commit: { id: commit },
            namespace,
            project,
          }}
          notebookFilePath={filePath}
          showModal={createLinkIsOpen}
          toggleModal={toggleCreateLink}
        />
      </div>
    </div>
  );
}
