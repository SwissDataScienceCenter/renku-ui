/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  ProjectNew.present.js
 *  New project presentational components.
 */

import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Form,
  FormText,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

import { Loader } from "../../components/Loader";
import { ErrorAlert, WarnAlert } from "../../components/Alert";
import LoginAlert from "../../components/loginAlert/LoginAlert";
import FormSchema from "../../components/formschema/FormSchema";
import ProgressIndicator, {
  ProgressStyle,
  ProgressType,
} from "../../components/progress/Progress";
import Automated from "./components/Automated";
import Title from "./components/Title";
import Description from "./components/Description";
import Namespaces from "./components/Namespaces";
import ProjectIdentifier from "./components/ProjectIdentifier";
import Visibility from "./components/Visibility";
import TemplateSource from "./components/TemplateSource";
import UserTemplate, { ErrorTemplateFeedback } from "./components/UserTemplate";
import { Template } from "./components/Template";
import TemplateVariables from "./components/TemplateVariables";
import { FormErrors, FormWarnings } from "./components/FormValidations";
import SubmitFormButton from "./components/SubmitFormButton";
import AppContext from "../../utils/context/appContext";
import NewProjectAvatar from "./components/NewProjectAvatar";

import "./Project.style.css";

function ForkProject(props) {
  const {
    error,
    fork,
    forkedTitle,
    forking,
    forkUrl,
    namespaces,
    isFetchingProjects,
    toggleModal,
  } = props;

  const fetching = {
    projects: isFetchingProjects,
    namespaces: namespaces.fetching,
  };

  return (
    <Fragment>
      <ForkProjectHeader forkedTitle={forkedTitle} toggleModal={toggleModal} />
      <ForkProjectBody {...props} fetching={fetching} />
      <ForkProjectFooter
        error={error}
        fetching={fetching}
        fork={fork}
        forking={forking}
        forkUrl={forkUrl}
        toggleModal={toggleModal}
      />
    </Fragment>
  );
}

function ForkProjectHeader(props) {
  const { forkedTitle, toggleModal } = props;
  return (
    <ModalHeader toggle={toggleModal}>
      Fork project <span className="font-italic">{forkedTitle}</span>
    </ModalHeader>
  );
}

function ForkProjectBody(props) {
  const { fetching, forkError, forkVisibilityError, forking } = props;
  if (fetching.namespaces || fetching.projects) {
    const text = fetching.namespaces ? "namespaces" : "existing projects";
    return (
      <ModalBody>
        <p>Checking your {text}...</p>
        <Loader />
      </ModalBody>
    );
  }
  return (
    <ModalBody>
      <ForkProjectContent {...props} />
      <ForkProjectStatus
        forkVisibilityError={forkVisibilityError}
        forkError={forkError}
        forking={forking}
      />
    </ModalBody>
  );
}

function ForkProjectFooter(props) {
  const { error, fetching, fork, forking, forkUrl, toggleModal } = props;

  let forkButton;
  if (forking) {
    forkButton = null;
  } else {
    if (forkUrl) {
      forkButton = (
        <Link className="btn btn-secondary" to={forkUrl}>
          Go to forked project
        </Link>
      );
    } else {
      forkButton = (
        <Button color="secondary" disabled={!!error} onClick={fork}>
          Fork Project
        </Button>
      );
    }
  }

  let closeButton = null;
  if (toggleModal) {
    closeButton = (
      <Button className="btn-outline-rk-green" onClick={toggleModal}>
        {forking ? "Close" : "Cancel"}
      </Button>
    );
  }

  if (fetching.namespaces || fetching.projects) return null;
  return (
    <ModalFooter>
      {closeButton}
      {forkButton}
    </ModalFooter>
  );
}

function ForkProjectStatus(props) {
  if (props.forking) {
    return (
      <ProgressIndicator
        type={ProgressType.Indeterminate}
        style={ProgressStyle.Light}
        title="Forking the project..."
        description="Project is being created."
        currentStatus=""
        feedback="You will be redirected automatically or receive a notification at the end."
      />
    );
  } else if (props.forkError) {
    return (
      <FormText key="help" color="danger">
        {props.forkError}
      </FormText>
    );
  } else if (props.forkVisibilityError) {
    return (
      <p>
        <FontAwesomeIcon icon={faExclamationTriangle} /> The project has been
        forked but an error occurred when setting the visibility
        {props.forkVisibilityError}
      </p>
    );
  }
  return null;
}

function ForkProjectContent(props) {
  const {
    fetching,
    error,
    forking,
    handlers,
    namespace,
    namespaces,
    title,
    user,
    visibility,
    visibilities,
    forkVisibilityError,
  } = props;

  if (forking || forkVisibilityError) return null;

  const input = {
    namespace,
    title,
    titlePristine: false,
    visibility,
    visibilityPristine: false,
  };
  const meta = {
    validation: { errors: { title: error } },
    namespace: {
      fetching: fetching.namespaces,
      visibilities: visibilities?.visibilities,
      visibility: visibilities?.default,
    },
  };

  return (
    <div className="form-rk-green">
      <Title handlers={handlers} input={input} meta={meta} />
      <Namespaces
        handlers={handlers}
        input={input}
        namespaces={namespaces}
        user={user}
      />
      <ProjectIdentifier input={input} isRequired={true} />
      <Visibility handlers={handlers} input={input} meta={meta} />
    </div>
  );
}

const isFormProcessingOrFinished = (meta) => {
  // posting
  if (
    meta.creation.creating ||
    meta.creation.projectUpdating ||
    meta.creation.kgUpdating
  )
    return true;
  // posted successfully with visibility or KG warning
  if (meta.creation.created) return true;
  return meta.creation.projectError || meta.creation.kgError;
};

const NewProjectForm = ({
  automated,
  config,
  handlers,
  input,
  isFetchingProjects,
  meta,
  namespaces,
  namespace,
  user,
  importingDataset,
  userRepo,
  templates,
}) => {
  const errorTemplateAlert = (
    <ErrorTemplateFeedback templates={templates} meta={meta} input={input} />
  );
  // We should incorporate templates in deciding this, but the content of templates
  // seems to be unreliable, so skip it for the moment
  // const createDataAvailable = !isFetchingProjects && namespaces.fetched &&
  //     (templates.fetched || (templates.errors && templates.errors.length > 0 && !templates.fetching));
  const createDataAvailable = !isFetchingProjects && namespaces.fetched;
  return (
    <Form data-cy="create-project-form" className="form-rk-green mb-4">
      <Automated
        automated={automated}
        removeAutomated={handlers.removeAutomated}
      />
      <Title handlers={handlers} meta={meta} input={input} />
      <Namespaces
        namespaces={namespaces}
        handlers={handlers}
        automated={automated}
        input={input}
        namespace={namespace}
        user={user}
      />
      <ProjectIdentifier input={input} isRequired={true} />
      <Description handlers={handlers} meta={meta} input={input} />
      <Visibility handlers={handlers} meta={meta} input={input} />
      <NewProjectAvatar onAvatarChange={handlers.onAvatarChange} />
      {config.custom ? (
        <TemplateSource handlers={handlers} input={input} isRequired={true} />
      ) : null}
      {userRepo ? (
        <UserTemplate
          meta={meta}
          handlers={handlers}
          config={config}
          templates={templates}
          input={input}
        />
      ) : null}
      <Template
        config={config}
        handlers={handlers}
        input={input}
        templates={templates}
        meta={meta}
      />
      <TemplateVariables
        handlers={handlers}
        input={input}
        templates={templates}
        meta={meta}
      />
      {errorTemplateAlert}
      <SubmitFormButton
        createDataAvailable={createDataAvailable}
        handlers={handlers}
        input={input}
        importingDataset={importingDataset}
        meta={meta}
        namespaces={namespaces}
        templates={templates}
      />
      <FormWarnings meta={meta} />
      <FormErrors meta={meta} input={input} />
    </Form>
  );
};

class NewProject extends Component {
  static contextType = AppContext;

  render() {
    const {
      automated,
      config,
      handlers,
      input,
      user,
      importingDataset,
      meta,
      namespace,
      namespaces,
      templates,
    } = this.props;
    const { isFetchingProjects } = this.props;

    if (!user.logged) {
      const textIntro = "Only authenticated users can create new projects.";
      const textPost = "to create a new project.";
      return (
        <LoginAlert
          logged={user.logged}
          textIntro={textIntro}
          textPost={textPost}
        />
      );
    }

    const title = "New Project";
    const desc =
      "Create a project to house your files, include datasets," +
      "plan your work, and collaborate on code, among other things.";
    const userRepo = config.custom && input.userRepo;
    const formOnProcess =
      meta.creation.creating ||
      meta.creation.projectUpdating ||
      meta.creation.kgUpdating;
    const form = (
      <NewProjectForm
        automated={automated}
        config={config}
        handlers={handlers}
        input={input}
        importingDataset={importingDataset}
        isFetchingProjects={isFetchingProjects}
        meta={meta}
        namespaces={namespaces}
        namespace={namespace}
        user={user}
        userRepo={userRepo}
        templates={templates}
      />
    );

    const onProgress = isFormProcessingOrFinished(meta);
    const creation = (
      <Creation
        handlers={handlers}
        meta={meta}
        importingDataset={importingDataset}
      />
    );
    if (onProgress) return creation;

    return !importingDataset ? (
      <FormSchema showHeader={!formOnProcess} title={title} description={desc}>
        {creation}
        {form}
      </FormSchema>
    ) : (
      form
    );
  }
}

class Creation extends Component {
  render() {
    const { handlers, importingDataset } = this.props;
    const { creation } = this.props.meta;
    if (
      !creation.creating &&
      !creation.createError &&
      !creation.projectUpdating &&
      !creation.projectError &&
      !creation.kgUpdating &&
      !creation.kgError &&
      !creation.newName
    )
      return null;

    let color = "primary";
    let message = "";
    if (creation.creating) {
      message = "Initializing project...";
    } else if (creation.createError) {
      color = "danger";
      let error;
      if (typeof creation.createError === "string")
        error = creation.createError;
      else if (creation.createError?.code)
        error = creation.createError.userMessage
          ? creation.createError.userMessage
          : creation.createError.reason;
      else error = creation.createError.toString();
      message = (
        <div>
          <p>An error occurred while creating the project.</p>
          <p>{error}</p>
        </div>
      );
    } else if (creation.projectUpdating) {
      message = "Updating project metadata...";
    } else if (creation.projectError) {
      color = "warning";
      message = (
        <div>
          <p>
            An error occurred while updating project metadata (name or
            visibility). Please, adjust it on GitLab if needed.
          </p>
          <p>Error details: {creation.projectError}</p>
          <Button color="primary" onClick={() => handlers.goToProject()}>
            Go to the project
          </Button>
        </div>
      );
    } else if (creation.kgUpdating) {
      message = "Activating project indexing...";
    } else if (creation.kgError) {
      color = "warning";
      message = (
        <div>
          <p>
            An error occurred while activating the project indexing. You can
            activate it later to get the lineage.
          </p>
          <p>Error details: {creation.kgError}</p>
          <Button color="primary" onClick={() => handlers.goToProject()}>
            Go to the project
          </Button>
        </div>
      );
    } else {
      return null;
    }

    if (color === "warning") return <WarnAlert>{message}</WarnAlert>;

    if (color === "danger") return <ErrorAlert>{message}</ErrorAlert>;

    // customize the progress indicator when importing a dataset
    const title = importingDataset
      ? "Creating a project to import the dataset..."
      : "Creating Project...";
    const feedback = importingDataset
      ? "Once the process is completed, you will be redirected to the page " +
        "of the imported dataset in the created project."
      : "You'll be redirected to the new project page when the creation is completed.";

    return (
      <div>
        <ProgressIndicator
          type={ProgressType.Indeterminate}
          style={ProgressStyle.Dark}
          title={title}
          description="We've received your project information. This may take a while."
          currentStatus={message}
          feedback={feedback}
        />
      </div>
    );
  }
}

export { NewProject, ForkProject };
