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

import { faInfoCircle, faUserClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { skipToken } from "@reduxjs/toolkit/query";
import React, { useEffect } from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom-v5-compat";
import { Alert, Button, Col } from "reactstrap";

import { ACCESS_LEVELS } from "../../../api-client";
import { ErrorAlert, WarnAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import { GoBackButton } from "../../../components/buttons/Button";
import { CoreErrorAlert } from "../../../components/errors/CoreErrorAlert";
import { DatasetCoordinator } from "../../../dataset/Dataset.state";
import { SpecialPropVal } from "../../../model/Model";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { Url } from "../../../utils/helpers/url";
import { StateModelProject } from "../project.types";
import { useGetProjectIndexingStatusQuery } from "../projectKg.api";
import { useCoreSupport } from "../useProjectCoreSupport";
import ProjectDatasetImport from "./ProjectDatasetImport";
import { ProjectDatasetEdit, ProjectDatasetNew } from "./ProjectDatasetNewEdit";
import ProjectDatasetShow from "./ProjectDatasetShow";
import ProjectDatasetListView from "./ProjectDatasetsListView";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectDatasetLockAlert({ lockStatus }: any) {
  if (lockStatus == null) return null;
  const isLocked = lockStatus.locked;
  if (!isLocked) return null;

  return (
    <WarnAlert>
      <FontAwesomeIcon icon={faUserClock} />{" "}
      <i>
        Project is being modified. Datasets cannot be created or edited until
        the action completes.
      </i>
    </WarnAlert>
  );
}

/**
 * Shows a warning Alert when Renku version is outdated or Knowledge Graph integration is not active.
 *
 * @param {Object} kgDown - boolean
 * @param {string} targetUrl - target url
 */
interface ProjectStatusAlertProps {
  kgDown: boolean;
  targetUrl: string;
}
function ProjectStatusAlert(props: ProjectStatusAlertProps) {
  const { kgDown, targetUrl } = props;
  if (!kgDown) return null;

  return (
    <WarnAlert>
      <p>
        <strong>Project is not indexed.</strong> This means that some operations
        on datasets are not possible, we recommend activating indexing.
      </p>
      <Link className="btn btn-warning" to={targetUrl}>
        See details
      </Link>
    </WarnAlert>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectDatasetsNav(props: any) {
  const coreDatasets = props.datasets.core.datasets;
  if (coreDatasets == null) return null;
  if (coreDatasets.error != null) return null;
  if (coreDatasets.length === 0) return null;

  return (
    <ProjectDatasetListView
      datasets={props.datasets.core.datasets}
      datasetsUrl={props.datasetsUrl}
      locked={props.lockStatus?.locked ?? true}
      newDatasetUrl={props.newDatasetUrl}
      accessLevel={props.metadata.accessLevel}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectAddDataset(props: any) {
  const [newDataset, setNewDataset] = React.useState(true);
  function toggleNewDataset() {
    setNewDataset(!newDataset);
  }

  return (
    <Col>
      {newDataset ? (
        <ProjectDatasetNew
          apiVersion={props.apiVersion}
          client={props.client}
          fetchDatasets={props.fetchDatasets}
          metadataVersion={props.metadataVersion}
          model={props.model}
          notifications={props.notifications}
          params={props.params}
          toggleNewDataset={toggleNewDataset}
          versionUrl={props.versionUrl}
        />
      ) : (
        <ProjectDatasetImport
          client={props.client}
          fetchDatasets={props.fetchDatasets}
          model={props.model}
          notifications={props.notifications}
          params={props.params}
          toggleNewDataset={toggleNewDataset}
        />
      )}
    </Col>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EmptyDatasets({ locked, membership, newDatasetUrl }: any) {
  return (
    <Alert timeout={0} color="primary">
      <p>No datasets found for this project.</p>
      {membership && !locked ? (
        <div>
          <p>
            <FontAwesomeIcon icon={faInfoCircle} /> If you recently activated
            the indexing or added datasets try refreshing the page.{" "}
          </p>
          <p>
            You can also click on the button to{" "}
            <Link className="btn btn-primary btn-sm" to={newDatasetUrl}>
              Add a Dataset
            </Link>
          </p>
        </div>
      ) : null}
    </Alert>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectDatasetsView(props: any) {
  const { datasets, fetchDatasets } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const [datasetCoordinator, setDatasetCoordinator] =
    React.useState<unknown>(null);

  const settingsUrl = Url.get(Url.pages.project.settings, {
    namespace: props.metadata?.namespace,
    path: props.metadata?.path,
  });

  const projectId = props.metadata?.id;
  const projectIndexingStatus = useGetProjectIndexingStatusQuery(
    projectId ? projectId : skipToken
  );
  const kgDown = !projectIndexingStatus.data?.activated;

  const { defaultBranch, externalUrl } = useLegacySelector<
    StateModelProject["metadata"]
  >((state) => state.stateModel.project.metadata);
  const { coreSupport } = useCoreSupport({
    gitUrl: externalUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const {
    apiVersion,
    backendAvailable,
    computed: coreSupportComputed,
    backendErrorMessage,
    metadataVersion,
    versionUrl,
  } = coreSupport;

  const coreSupportMessage = (
    <ProjectStatusAlert targetUrl={settingsUrl} kgDown={kgDown} />
  );

  useEffect(() => {
    setDatasetCoordinator(
      new DatasetCoordinator(props.client, props.model.subModel("dataset"))
    );
  }, [props.client, props.model]);

  useEffect(() => {
    const datasetsLoading = datasets.core === SpecialPropVal.UPDATING;
    if (datasetsLoading || !coreSupportComputed) return;
    if (!backendAvailable) return;

    if (
      datasets.core.datasets === null ||
      (location.state && location.state.reload)
    ) {
      fetchDatasets(location.state && location.state.reload, versionUrl);
      navigate(location, { replace: true, state: { reload: false } });
    }
  }, [
    backendAvailable,
    coreSupportComputed,
    datasets.core,
    fetchDatasets,
    location,
    navigate,
    versionUrl,
  ]);

  if (coreSupportComputed && backendErrorMessage)
    return (
      <ErrorAlert>
        <p>
          <b>There was an error verifying support for this project.</b>
        </p>

        <p>
          <code>{backendErrorMessage}</code>
        </p>

        <p className="mb-0">
          You can try to{" "}
          <a
            className="btn btn-danger"
            href={window.location.href}
            onClick={() => window.location.reload()}
          >
            reload the page
          </a>
        </p>
      </ErrorAlert>
    );

  if (coreSupportComputed && !backendAvailable) {
    const settingsUrl = Url.get(Url.pages.project.settings, {
      namespace: props.metadata.namespace,
      path: props.metadata.path,
    });
    const updateInfo =
      props.metadata.accessLevel >= ACCESS_LEVELS.DEVELOPER
        ? "Updating this project"
        : "Asking a project maintainer to update this project (or forking and updating it)";
    return (
      <div>
        <WarnAlert dismissible={false}>
          <p>
            <b>Datasets have limited functionality</b> because the project is
            not compatible with this RenkuLab instance.
          </p>
          <p>
            You can search for datasets, but you cannot interact with them from
            the project page.
          </p>
          <p>
            {updateInfo} should resolve the problem.
            <br />
            The <Link to={settingsUrl}>Project settings</Link> page provides
            further information.
          </p>
        </WarnAlert>
      </div>
    );
  }

  if (!coreSupportComputed) {
    return (
      <div>
        <p>Checking project version and RenkuLab compatibility...</p>
        <Loader />
      </div>
    );
  }

  const loadingDatasets =
    props.datasets.core === SpecialPropVal.UPDATING ||
    props.datasets.core === undefined;
  if (loadingDatasets) {
    return (
      <div>
        <p>Loading datasets...</p>
        <Loader />
      </div>
    );
  }

  if (props.datasets.core.error || props.datasets.core.datasets?.error) {
    const error = props.datasets.core.error
      ? props.datasets.core.error
      : props.datasets.core.datasets?.error;
    let errorObject;
    if (error.code) {
      errorObject = <CoreErrorAlert error={error} />;
    } else {
      errorObject = (
        <ErrorAlert>
          There was an error fetching the datasets, please try{" "}
          <Button
            color="danger"
            size="sm"
            onClick={() => window.location.reload()}
          >
            {" "}
            reloading{" "}
          </Button>{" "}
          the page.
        </ErrorAlert>
      );
    }
    return (
      <Col sm={12} data-cy="error-datasets-modal">
        {errorObject}
      </Col>
    );
  }

  if (
    props.datasets.core.datasets != null &&
    props.datasets.core.datasets.length === 0 &&
    location.pathname !== props.newDatasetUrl
  ) {
    return (
      <Col sm={12}>
        {coreSupportMessage}
        <ProjectDatasetLockAlert lockStatus={props.lockStatus} />
        <EmptyDatasets
          locked={props.lockStatus?.locked ?? true}
          membership={props.metadata.accessLevel > ACCESS_LEVELS.DEVELOPER}
          newDatasetUrl={props.newDatasetUrl}
        />
      </Col>
    );
  }

  return (
    <Col sm={12}>
      {coreSupportMessage}
      <ProjectDatasetLockAlert lockStatus={props.lockStatus} />
      <Routes>
        <Route
          path="new"
          element={
            <>
              <Col key="btn" md={12}>
                <GoBackButton
                  data-cy="go-back-dataset"
                  label="Back to list"
                  url={props.datasetsUrl}
                />
              </Col>
              <ProjectAddDataset
                {...props}
                apiVersion={apiVersion}
                metadataVersion={metadataVersion}
                versionUrl={versionUrl}
              />
            </>
          }
        />
        <Route
          path=":datasetId/modify"
          element={
            <EditDatasetRoute
              apiVersion={apiVersion}
              client={props.client}
              datasetsUrl={props.datasetsUrl}
              fetchDatasets={props.fetchDatasets}
              metadataVersion={metadataVersion}
              model={props.model}
              notifications={props.notifications}
              params={props.params}
              versionUrl={versionUrl}
            />
          }
        />
        <Route
          path=":datasetId"
          element={
            <ShowDatasetRoute
              datasetCoordinator={datasetCoordinator}
              datasetsUrl={props.datasetsUrl}
              model={props.model}
              pathWithNamespace={props.metadata.pathWithNamespace}
              projectIndexingStatus={projectIndexingStatus}
            />
          }
        />
        <Route path="/" element={<ProjectDatasetsNav {...props} />} />
      </Routes>
    </Col>
  );
}

interface EditDatasetRouteProps {
  apiVersion: string | undefined;
  client: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  datasetsUrl: string;
  fetchDatasets: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  metadataVersion: number;
  model: unknown;
  notifications: unknown;
  params: unknown;
  versionUrl: string;
}

function EditDatasetRoute({
  apiVersion,
  client,
  datasetsUrl,
  fetchDatasets,
  metadataVersion,
  model,
  notifications,
  params,
  versionUrl,
}: EditDatasetRouteProps) {
  const location = useLocation();

  const { datasetId } = useParams<{ datasetId: string }>();

  return (
    <>
      <Col key="btn" md={12}>
        <GoBackButton
          label="Back to dataset"
          url={`${datasetsUrl}/${datasetId}/`}
        />
      </Col>
      <ProjectDatasetEdit
        apiVersion={apiVersion}
        client={client}
        dataset={location.state.dataset}
        datasetId={decodeURIComponent(datasetId ?? "")}
        fetchDatasets={fetchDatasets}
        files={location.state.files ?? { hasPart: [] }}
        filesFetchError={location.state.filesFetchError}
        isFilesFetching={location.state.isFilesFetching ?? false}
        metadataVersion={metadataVersion}
        model={model}
        notifications={notifications}
        params={params}
        versionUrl={versionUrl}
      />
    </>
  );
}

interface ShowDatasetRouteProps {
  datasetCoordinator: unknown;
  datasetsUrl: string;
  model: unknown;
  pathWithNamespace: string;
  projectIndexingStatus: ReturnType<typeof useGetProjectIndexingStatusQuery>;
}

function ShowDatasetRoute({
  datasetCoordinator,
  datasetsUrl,
  model,
  pathWithNamespace,
  projectIndexingStatus,
}: ShowDatasetRouteProps) {
  const { datasetId } = useParams<{ datasetId: string }>();

  return (
    <>
      <Col key="btn" md={12}>
        <GoBackButton
          key="btn"
          label={`Back to ${pathWithNamespace}`}
          url={datasetsUrl}
        />
      </Col>
      <ProjectDatasetShow
        datasetCoordinator={datasetCoordinator}
        datasetId={decodeURIComponent(datasetId ?? "")}
        graphStatus={projectIndexingStatus.data?.activated ?? false}
        model={model}
        projectInsideKg={projectIndexingStatus.data?.activated ?? false}
      />
    </>
  );
}

export default ProjectDatasetsView;
