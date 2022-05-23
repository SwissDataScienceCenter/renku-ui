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
  Alert, Button, Form,
  FormText, ModalBody, ModalFooter, ModalHeader,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

import "./Project.style.css";
import { Url } from "../../utils/helpers/url";
import { Loader } from "../../utils/components/Loader";
import { ErrorAlert, WarnAlert } from "../../utils/components/Alert";
import AppContext from "../../utils/context/appContext";
import FormSchema from "../../utils/components/formschema/FormSchema";
import Automated from "./components/Automated";
import Title from "./components/Title";
import Description from "./components/Description";
import Namespaces from "./components/Namespaces";
import ProjectIdentifier from "./components/ProjectIdentifier";
import Visibility from "./components/Visibility";
import TemplateSource from "./components/TemplateSource";
import UserTemplate, { ErrorTemplateFeedback } from "./components/UserTemplate";
import Template from "./components/Template";
import TemplateVariables from "./components/TemplateVariables";
import { FormErrors, FormWarnings } from "./components/FormValidations";
import SubmitFormButton from "./components/SubmitFormButton";
import ProgressIndicator, { ProgressStyle, ProgressType } from "../../utils/components/progress/Progress";

function ForkProject(props) {
  const { error, fork, forkedTitle, forking, forkUrl, namespaces, projects, toggleModal } = props;

  const fetching = {
    projects: projects.fetching,
    namespaces: namespaces.fetching
  };

  return (
    <Fragment>
      <ForkProjectHeader forkedTitle={forkedTitle} toggleModal={toggleModal} />
      <ForkProjectBody {...props} fetching={fetching} />
      <ForkProjectFooter
        error={error} fetching={fetching} fork={fork} forking={forking} forkUrl={forkUrl} toggleModal={toggleModal}
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
    const text = fetching.namespaces ?
      "namespaces" :
      "existing projects";
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
      <ForkProjectStatus forkVisibilityError={forkVisibilityError} forkError={forkError} forking={forking} />
    </ModalBody>
  );
}

function ForkProjectFooter(props) {
  const { error, fetching, fork, forking, forkUrl, toggleModal } = props;

  let forkButton;
  if (forking) {
    forkButton = null;
  }
  else {
    if (forkUrl)
      forkButton = (<Link className="btn btn-primary" to={forkUrl}>Go to forked project</Link>);
    else
      forkButton = (<Button color="primary" disabled={!!error} onClick={fork}>Fork Project</Button>);
  }

  let closeButton = null;
  if (toggleModal)
    closeButton = <Button outline color="primary" onClick={toggleModal}>{forking ? "Close" : "Cancel"}</Button>;


  if (fetching.namespaces || fetching.projects)
    return null;
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
  }
  else if (props.forkError) {
    return (<FormText key="help" color="danger">{props.forkError}</FormText>);
  }
  else if (props.forkVisibilityError) {
    return (
      <p>
        <FontAwesomeIcon icon={faExclamationTriangle} />
        {" "} The project has been forked but an error occurred when setting the visibility
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
    forkVisibilityError } = props;

  if (forking || forkVisibilityError)
    return null;

  const input = { namespace, title, titlePristine: false, visibility, visibilityPristine: false };
  const meta = {
    validation: { errors: { title: error } },
    namespace: {
      fetching: fetching.namespaces,
      visibilities: visibilities?.visibilities,
      visibility: visibilities?.default
    },
  };

  return (
    <Fragment>
      <Title handlers={handlers} input={input} meta={meta} />
      <Namespaces handlers={handlers} input={input} namespaces={namespaces} user={user} />
      <ProjectIdentifier input={input} isRequired={true} />
      <Visibility handlers={handlers} input={input} meta={meta}/>
    </Fragment>
  );
}

const NewProjectForm = (
  { automated, config, handlers, input, meta, namespaces, namespace,
    user, importingDataset, userRepo, templates } ) => {

  const isFormProcessingOrFinished = (meta) => {
    // posting
    if (meta.creation.creating || meta.creation.projectUpdating || meta.creation.kgUpdating)
      return true;
    // posted successfully with visibility or KG warning
    if (meta.creation.created) return true;
    return (meta.creation.projectError || meta.creation.kgError);
  };

  const onProgress = isFormProcessingOrFinished(meta);
  const creation = <Creation handlers={handlers} meta={meta} importingDataset={importingDataset} />;
  if (onProgress)
    return creation;

  const errorTemplateAlert = <ErrorTemplateFeedback templates={templates} meta={meta} input={input}/>;
  return (
    <Form data-cy="create-project-form" className="mb-4">
      {creation}
      <Automated automated={automated} removeAutomated={handlers.removeAutomated} />
      <Title handlers={handlers} meta={meta} input={input} />
      <Namespaces
        namespaces={namespaces}
        handlers={handlers}
        automated={automated}
        input={input}
        namespace={namespace}
        user={user} />
      <ProjectIdentifier input={input} isRequired={true} />
      <Description handlers={handlers} meta={meta} input={input} />
      <Visibility handlers={handlers} meta={meta} input={input} />
      {config.custom ? <TemplateSource handlers={handlers} input={input} isRequired={true} /> : null}
      {userRepo ?
        <UserTemplate meta={meta} handlers={handlers} config={config} templates={templates} input={input} /> : null}
      <Template config={config} handlers={handlers} input={input} templates={templates} meta={meta} />
      <TemplateVariables handlers={handlers} input={input} templates={templates} meta={meta} />
      {errorTemplateAlert}
      <SubmitFormButton input={input} meta={meta} importingDataset={importingDataset} handlers={handlers} />
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
      templates
    } = this.props;
    const { location } = this.context;
    if (!user.logged) {
      const to = Url.get(Url.pages.login.link, { pathname: location.pathname });
      return (
        <>
          <p>Only authenticated users can create new projects.</p>
          <Alert color="primary">
            <p className="mb-0">
              <Link className="btn btn-primary btn-sm" to={to}>Log in</Link> to
              create a new project.
            </p>
          </Alert>
        </>
      );
    }

    const title = "New Project";
    const desc = "Create a project to house your files, include datasets," +
      "plan your work, and collaborate on code, among other things.";
    const userRepo = config.custom && input.userRepo;
    const formOnProcess = meta.creation.creating || meta.creation.projectUpdating || meta.creation.kgUpdating;
    const form = <NewProjectForm
      automated={automated}
      config={config}
      handlers={handlers}
      input={input}
      importingDataset={importingDataset}
      meta={meta}
      namespaces={namespaces}
      namespace={namespace}
      user={user}
      userRepo={userRepo}
      templates={templates}
    />;
    return !this.props.importingDataset ? (
      <FormSchema showHeader={!formOnProcess} title={title} description={desc}>
        {form}
      </FormSchema>
    ) : form ;
  }
}

class Creation extends Component {
  render() {
    const { handlers, importingDataset } = this.props;
    const { creation } = this.props.meta;
    if (!creation.creating && !creation.createError && !creation.projectUpdating &&
      !creation.projectError && !creation.kgUpdating && !creation.kgError && !creation.newName)
      return null;

    let color = "primary";
    let message = "";
    if (creation.creating) {
      message = "Initializing project...";
    }
    else if (creation.createError) {
      color = "danger";
      let error;
      if (typeof creation.createError === "string")
        error = creation.createError;
      else if (creation.createError?.code)
        error = creation.createError.userMessage ? creation.createError.userMessage : creation.createError.reason;
      else
        error = creation.createError.toString();
      message = (
        <div>
          <p>An error occurred while creating the project.</p>
          <p>{error}</p>
        </div>
      );
    }
    else if (creation.projectUpdating) {
      message = "Updating project metadata...";
    }
    else if (creation.projectError) {
      color = "warning";
      message = (<div>
        <p>
          An error occurred while updating project metadata (name or visibility). Please, adjust it on GitLab if needed.
        </p>
        <p>Error details: {creation.projectError}</p>
        <Button color="primary" onClick={(e) => { handlers.goToProject(); }}>Go to the project</Button>
      </div>);
    }
    else if (creation.kgUpdating) {
      message = "Activating the knowledge graph...";
    }
    else if (creation.kgError) {
      color = "warning";
      message = (<div>
        <p>
          An error occurred while activating the knowledge graph. You can activate it later to get the lineage.
        </p>
        <p>Error details: {creation.kgError}</p>
        <Button color="primary" onClick={(e) => { handlers.goToProject(); }}>Go to the project</Button>
      </div>);
    }
    else {
      return null;
    }

    if (color === "warning") {
      return (
        <WarnAlert>{message}</WarnAlert>
      );
    }

    if (color === "danger") {
      return (
        <ErrorAlert>{message}</ErrorAlert>
      );
    }

    // customize the progress indicator when importing a dataset
    const title = importingDataset ? "Creating a project to import the dataset..." :
      "Creating Project...";
    const feedback = importingDataset ?
      "Once the process is completed, you will be redirected to the page " +
      "of the imported dataset in the created project."
      : "You'll be redirected to the new project page when the creation is completed.";

    return (
      <ProgressIndicator
        type={ProgressType.Indeterminate}
        style={ProgressStyle.Dark}
        title={title}
        description="We've received your project information. This may take a while."
        currentStatus={message}
        feedback={feedback}
      />
    );
  }
}

export { NewProject, ForkProject };
