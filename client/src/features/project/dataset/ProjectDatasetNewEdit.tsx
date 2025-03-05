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

import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom-v5-compat";
import { Alert, Button, Col } from "reactstrap";

import { ACCESS_LEVELS } from "../../../api-client";
import { Loader } from "../../../components/Loader";
import AddDatasetButtons from "../../../components/addDatasetButtons/AddDatasetButtons";
import FormSchema from "../../../components/formschema/FormSchema";
import ProgressIndicator, {
  ProgressStyle,
  ProgressType,
} from "../../../components/progress/Progress";
import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { Url } from "../../../utils/helpers/url";
import type { IDatasetFiles, StateModelProject } from "../project.types";
import type {
  DatasetModifyDisplayProps,
  DatasetModifyProps,
  PostSubmitProps,
} from "./DatasetModify";
import DatasetModify from "./DatasetModify";
import type { DatasetPostClient } from "./datasetCore.api";
import { initializeForDataset, initializeForUser } from "./datasetForm.slice";

type ChangeDatasetProps = {
  apiVersion: string | undefined;
  client: DatasetPostClient;
  fetchDatasets: PostSubmitProps["fetchDatasets"];
  model: unknown;
  notifications: unknown;
  metadataVersion: number | undefined;
  params: unknown;
  submitting: boolean;
  setSubmitting: (submitting: boolean) => void;
  versionUrl: string;
};

type ProjectDatasetNewOnlyProps = {
  toggleNewDataset?: React.MouseEventHandler<HTMLButtonElement>;
};

type ProjectDatasetEditOnlyProps = {
  dataset: NonNullable<DatasetModifyProps["dataset"]>;
  files: IDatasetFiles;
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
  const project = useLegacySelector<StateModelProject>(
    (state) => state.stateModel.project
  );
  const user = useLegacySelector((state) => state.stateModel.user);
  const projectMetadata = project.metadata;
  const accessLevel = projectMetadata.accessLevel;
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

  const { dataset, submitting, setSubmitting } = props;

  const navigate = useNavigate();

  const onCancel = React.useCallback(() => {
    const targetPath = { path: projectPathWithNamespace };
    const pathname = dataset
      ? Url.get(Url.pages.project.datasets.dataset, {
          ...targetPath,
          dataset: dataset.slug,
        })
      : Url.get(Url.pages.project.datasets.base, { ...targetPath });
    navigate(pathname);
  }, [dataset, navigate, projectPathWithNamespace]);

  if (accessLevel < ACCESS_LEVELS.MAINTAINER) {
    return (
      <Col>
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
      apiVersion={props.apiVersion}
      client={props.client}
      dataset={props.dataset}
      defaultBranch={projectMetadata.defaultBranch}
      existingFiles={props.files ?? { hasPart: [] }}
      externalUrl={projectMetadata.externalUrl}
      fetchDatasets={props.fetchDatasets}
      initialized={true}
      metadataVersion={props.metadataVersion}
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
  props: Omit<ChangeDatasetProps, "submitting" | "setSubmitting"> &
    ProjectDatasetNewOnlyProps
) {
  const location = useLocation();

  const project = useLegacySelector<StateModelProject>(
    (state) => state.stateModel.project
  );
  const projectPathWithNamespace = project.metadata.pathWithNamespace;
  const user = useLegacySelector((state) => state.stateModel.user);
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    dispatch(initializeForUser({ location, projectPathWithNamespace, user }));
  }, [dispatch, location, projectPathWithNamespace, user]);

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
        <div className="form-rk-pink d-flex flex-column">
          <AddDatasetButtons
            optionSelected="addDataset"
            toggleNewDataset={props.toggleNewDataset}
          />
        </div>
        <ProjectDatasetNewEdit
          key="datasetCreate"
          apiVersion={props.apiVersion}
          client={props.client}
          fetchDatasets={props.fetchDatasets}
          metadataVersion={props.metadataVersion}
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

function ProjectDatasetEditForm(
  props: ChangeDatasetProps &
    DatasetModifyDisplayProps &
    ProjectDatasetEditOnlyProps
) {
  const location = useLocation();
  const project = useLegacySelector<StateModelProject>(
    (state) => state.stateModel.project
  );
  const projectPathWithNamespace = project.metadata.pathWithNamespace;
  const dispatch = useAppDispatch();
  const { dataset, files } = props;
  React.useEffect(() => {
    dispatch(
      initializeForDataset({
        dataset: dataset,
        location,
        projectPathWithNamespace,
      })
    );
  }, [dataset, dispatch, files, location, projectPathWithNamespace]);
  const [submitting, setSubmitting] = React.useState(false);
  return (
    <ProjectDatasetNewEdit
      key="datasetModify"
      apiVersion={props.apiVersion}
      client={props.client}
      dataset={props.dataset}
      datasetId={props.datasetId}
      fetchDatasets={props.fetchDatasets}
      files={files}
      metadataVersion={props.metadataVersion}
      model={props.model}
      notifications={props.notifications}
      setSubmitting={setSubmitting}
      submitting={submitting}
      submitButtonText="Modify Dataset"
      submitLoaderText="Modifying dataset"
      params={props.params}
      versionUrl={props.versionUrl}
    />
  );
}

export type ProjectDatasetEditProps = Omit<
  ChangeDatasetProps,
  "submitting" | "setSubmitting"
> &
  Partial<ProjectDatasetEditOnlyProps> & {
    files: IDatasetFiles;
    isFilesFetching: boolean;
    filesFetchError: FetchBaseQueryError | SerializedError | undefined;
  };

function ProjectDatasetEdit(props: ProjectDatasetEditProps) {
  const { dataset, datasetId } = props;
  const [submitting, setSubmitting] = React.useState(false);

  if (dataset == null || datasetId == null || datasetId.length === 0) {
    // This should never happen, but just in case
    return (
      <div className="d-flex flex-column">
        Trying to modify a non-existent dataset.
      </div>
    );
  }
  if (props.isFilesFetching) {
    return <Loader />;
  }
  if (props.filesFetchError) {
    // This should never happen because it should caught before allowing the user to edit a dataset, but just in case
    return (
      <div className="d-flex flex-column">
        Could not retrieve dataset files.
      </div>
    );
  }
  return (
    <FormSchema
      showHeader={!submitting}
      title="Modify Dataset"
      description="Update dataset metadata or upload dataset files"
    >
      <ProjectDatasetEditForm
        key="datasetModify"
        apiVersion={props.apiVersion}
        client={props.client}
        dataset={dataset}
        datasetId={datasetId}
        fetchDatasets={props.fetchDatasets}
        files={props.files}
        metadataVersion={props.metadataVersion}
        model={props.model}
        notifications={props.notifications}
        setSubmitting={setSubmitting}
        submitting={submitting}
        submitButtonText="Modify Dataset"
        submitLoaderText="Modifying dataset"
        params={props.params}
        versionUrl={props.versionUrl}
      />
    </FormSchema>
  );
}

export { ProjectDatasetEdit, ProjectDatasetNew };
