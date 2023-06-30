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

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

import React from "react";
import { RootStateOrAny, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Alert, Button, Col } from "reactstrap";

import { ACCESS_LEVELS } from "../../../api-client";
import AddDatasetButtons from "../../../components/addDatasetButtons/AddDatasetButtons";
import FormSchema from "../../../components/formschema/FormSchema";
import ProgressIndicator, {
  ProgressStyle,
  ProgressType,
} from "../../../components/progress/Progress";
import ChangeDataset from "../../../project/datasets/change";
import { Url } from "../../../utils/helpers/url";

import type { StateModelProject } from "../Project";

import type { DatasetPostClient } from "./datasetCore.api";

import DatasetModify from "./DatasetModify";
import type {
  DatasetModifyDisplayProps,
  PostSubmitProps,
} from "./DatasetModify";

type ChangeDatasetProps = {
  client: DatasetPostClient;
  edit: boolean;
  fetchDatasets: PostSubmitProps["fetchDatasets"];
  history: ReturnType<typeof useHistory>;
  location: { pathname: string };
  model: unknown;
  notifications: unknown;
  params: unknown;
  submitting: boolean;
  setSubmitting: (submitting: boolean) => void;
  versionUrl: string;
};

type ProjectDatasetNewOnlyProps = {
  toggleNewDataset?: React.MouseEventHandler<HTMLButtonElement>;
};

type ProjectDatasetEditOnlyProps = {
  dataset?: string;
  datasetId: string;
};

function DatasetCreateHelp(props: ProjectDatasetNewOnlyProps) {
  return (
    <span>
      Create a new dataset by providing metadata and content. Use&nbsp;
      <Button
        className="p-0"
        style={{ verticalAlign: "baseline" }}
        color="link"
        onClick={props.toggleNewDataset}
      >
        <small>Import Dataset</small>
      </Button>
      &nbsp;to reuse an existing dataset.
    </span>
  );
}

type ProjectDatasetNewEditProps = ChangeDatasetProps &
  DatasetModifyDisplayProps &
  Partial<ProjectDatasetNewOnlyProps> &
  Partial<ProjectDatasetEditOnlyProps>;
function ProjectDatasetNewEdit(props: ProjectDatasetNewEditProps) {
  const project = useSelector(
    (state: RootStateOrAny) => state.stateModel.project as StateModelProject
  );
  const user = useSelector((state: RootStateOrAny) => state.stateModel.user);
  const projectMetadata = project.metadata;
  const accessLevel = projectMetadata.accessLevel;
  const httpProjectUrl = projectMetadata.httpUrl;
  const projectPathWithNamespace = projectMetadata.pathWithNamespace;

  const projectPath = projectMetadata.path;
  const projectNamespace = projectMetadata.namespace;
  const projectUrlProps = {
    namespace: projectNamespace,
    path: projectPath,
    target: "",
  };
  // Remove the trailing slash, since that is how downstream components expect it.
  const overviewCommitsUrl = Url.get(
    Url.pages.project.overview.commits,
    projectUrlProps
  );

  const { history, submitting, setSubmitting } = props;

  const onCancel = React.useCallback(() => {
    history.push({
      pathname: `/projects/${projectPathWithNamespace}/datasets`,
    });
  }, [history, projectPathWithNamespace]);

  if (accessLevel < ACCESS_LEVELS.MAINTAINER) {
    return (
      <Col sm={12} md={10} lg={8}>
        <Alert timeout={0} color="primary">
          Your access level does not allow you to create or modify datasets in
          this project.
          <br />
          <br />
          <FontAwesomeIcon icon={faInfoCircle} />
          &nbsp; If you were recently given access to this project, you might
          need to{" "}
          <Button
            size="sm"
            color="primary"
            onClick={() => window.location.reload()}
          >
            refresh the page
          </Button>{" "}
          first.
        </Alert>
      </Col>
    );
  }

  if (submitting) {
    const titleProgress = `${props.submitLoaderText}...`;
    const feedbackProgress =
      "Once the process is completed, you will be redirected to the page of the dataset.";
    return (
      <Col>
        <ProgressIndicator
          type={ProgressType.Indeterminate}
          style={ProgressStyle.Dark}
          title={titleProgress}
          description="We've received your dataset information. This may take a while."
          currentStatus=""
          feedback={feedbackProgress}
        />
      </Col>
    );
  }

  return (
    <DatasetModify
      client={props.client}
      dataset={props.dataset}
      defaultBranch={projectMetadata.defaultBranch}
      edit={props.edit}
      externalUrl={projectMetadata.externalUrl}
      fetchDatasets={props.fetchDatasets}
      initialized={true}
      history={props.history}
      httpProjectUrl={httpProjectUrl}
      location={props.location}
      notifications={props.notifications}
      onCancel={onCancel}
      overviewCommitsUrl={overviewCommitsUrl}
      projectPathWithNamespace={projectPathWithNamespace}
      setSubmitting={setSubmitting}
      submitButtonText={props.submitButtonText}
      submitLoaderText={props.submitLoaderText}
      user={user}
      versionUrl={props.versionUrl}
    />
  );
}

function ProjectDatasetNew(
  props: Omit<ChangeDatasetProps, "edit" | "submitting" | "setSubmitting"> &
    ProjectDatasetNewOnlyProps
) {
  const [submitting, setSubmitting] = React.useState(false);
  return (
    <FormSchema
      showHeader={!submitting}
      title="Add Dataset"
      description={
        <DatasetCreateHelp toggleNewDataset={props.toggleNewDataset} />
      }
    >
      <div className="d-flex flex-column">
        <AddDatasetButtons
          optionSelected="addDataset"
          toggleNewDataset={props.toggleNewDataset}
        />
        <ProjectDatasetNewEdit
          key="datasetCreate"
          client={props.client}
          edit={false}
          fetchDatasets={props.fetchDatasets}
          history={props.history}
          location={props.location}
          model={props.model}
          notifications={props.notifications}
          params={props.params}
          setSubmitting={setSubmitting}
          submitting={submitting}
          submitButtonText="Create Dataset"
          submitLoaderText="Creating dataset"
          toggleNewDataset={props.toggleNewDataset}
          versionUrl={props.versionUrl}
        />
      </div>
    </FormSchema>
  );
}

function ProjectDatasetEdit(
  props: Omit<ChangeDatasetProps, "edit" | "submitting" | "setSubmitting"> &
    ProjectDatasetEditOnlyProps
) {
  const project = useSelector(
    (state: RootStateOrAny) => state.stateModel.project as StateModelProject
  );
  const user = useSelector((state: RootStateOrAny) => state.stateModel.user);
  const projectMetadata = project.metadata;
  const accessLevel = projectMetadata.accessLevel;
  const datasets = project.datasets.core.datasets;
  const httpProjectUrl = projectMetadata.httpUrl;
  const maintainer = accessLevel >= ACCESS_LEVELS.MAINTAINER;
  const projectPath = projectMetadata.path;
  const projectNamespace = projectMetadata.namespace;
  const projectUrlProps = {
    namespace: projectNamespace,
    path: projectPath,
    target: "",
  };
  const fileContentUrl = Url.get(Url.pages.project.file, projectUrlProps);
  const lineageUrl = Url.get(Url.pages.project.lineage, projectUrlProps);
  // Remove the trailing slash, since that is how downstream components expect it.
  const lineagesUrl = lineageUrl.substring(0, lineageUrl.length - 1);
  const projectPathWithNamespace = projectMetadata.pathWithNamespace;
  const projectId = projectMetadata.id;

  const forkedData = project.forkedFromProject;
  const forked =
    forkedData != null && Object.keys(forkedData).length > 0 ? true : false;
  const overviewCommitsUrl = Url.get(
    Url.pages.project.overview.commits,
    projectUrlProps
  );
  const projectsUrl = Url.get(Url.pages.projects);
  return (
    <ChangeDataset
      accessLevel={accessLevel}
      client={props.client}
      dataset={props.dataset}
      datasetId={props.datasetId}
      datasets={datasets}
      defaultBranch={projectMetadata.defaultBranch}
      edit={true}
      fetchDatasets={props.fetchDatasets}
      fileContentUrl={fileContentUrl}
      forked={forked}
      history={props.history}
      httpProjectUrl={httpProjectUrl}
      insideProject={true}
      lineagesUrl={lineagesUrl}
      location={props.location}
      maintainer={maintainer}
      model={props.model}
      notifications={props.notifications}
      ovewrviewCommitsUrl={overviewCommitsUrl}
      params={{ UPLOAD_THRESHOLD: { soft: 104857600 } }}
      projectId={projectId}
      projectPathWithNamespace={projectPathWithNamespace}
      projectsUrl={projectsUrl}
      user={user}
    />
  );
  // const [submitting, setSubmitting] = React.useState(false);
  // return (
  //   <FormSchema
  //     showHeader={!submitting}
  //     title="Modify Dataset"
  //     description="Update dataset metadata or upload dataset files"
  //   >
  //     <ProjectDatasetNewEdit
  //       key="datasetModify"
  //       client={props.client}
  //       dataset={props.dataset}
  //       datasetId={props.datasetId}
  //       edit={true}
  //       fetchDatasets={props.fetchDatasets}
  //       history={props.history}
  //       location={props.location}
  //       model={props.model}
  //       notifications={props.notifications}
  //       setSubmitting={setSubmitting}
  //       submitting={submitting}
  //       submitButtonText="Modify Dataset"
  //       submitLoaderText="Modifying dataset"
  //       params={props.params}
  //       versionUrl={props.versionUrl}
  //     />
  //   </FormSchema>
  // );
}

export { ProjectDatasetEdit, ProjectDatasetNew };
