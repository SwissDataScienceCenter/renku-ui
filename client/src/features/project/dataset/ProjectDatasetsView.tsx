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

import React, { useEffect } from "react";
import { Link, Route, Switch, useHistory } from "react-router-dom";
import { Alert, Button, Col } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faUserClock } from "@fortawesome/free-solid-svg-icons";

import { ACCESS_LEVELS } from "../../../api-client";
import { GoBackButton } from "../../../components/buttons/Button";
import { CoreErrorAlert } from "../../../components/errors/CoreErrorAlert";
import { ErrorAlert, WarnAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import { DatasetCoordinator } from "../../../dataset/Dataset.state";
import { SpecialPropVal } from "../../../model/Model";
import { Url } from "../../../utils/helpers/url";
import ProjectDatasetListView from "./ProjectDatasetsListView";
import ProjectDatasetShow from "./ProjectDatasetShow";
import ProjectDatasetImport from "./ProjectDatasetImport";
import { ProjectDatasetEdit, ProjectDatasetNew } from "./ProjectDatasetNewEdit";
import { useGetProjectIndexingStatusQuery } from "../projectKgApi";
import { RootStateOrAny, useSelector } from "react-redux";
import { StateModelProject } from "../Project";
import { useCoreSupport } from "../useProjectCoreSupport";

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
        <strong>Knowledge Graph integration not active. </strong>
        This means that some operations on datasets are not possible, we
        recommend activating it.
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
  const projectId = props.metadata?.id;
  const projectIndexingStatus = useGetProjectIndexingStatusQuery(projectId, {
    skip: !projectId,
  });
  const isGraphReady = projectIndexingStatus.data?.activated === true;
  if (coreDatasets == null) return null;
  if (coreDatasets.error != null) return null;
  if (coreDatasets.length === 0) return null;

  return (
    <ProjectDatasetListView
      datasets_kg={props.datasets.datasets_kg}
      datasets={props.datasets.core.datasets}
      datasetsUrl={props.datasetsUrl}
      locked={props.lockStatus?.locked ?? true}
      newDatasetUrl={props.newDatasetUrl}
      accessLevel={props.metadata.accessLevel}
      graphStatus={isGraphReady}
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
          client={props.client}
          fetchDatasets={props.fetchDatasets}
          history={props.history}
          location={props.location}
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
          history={props.history}
          location={props.location}
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
      No datasets found for this project.
      {membership && !locked ? (
        <div>
          <br />
          <FontAwesomeIcon icon={faInfoCircle} /> If you recently activated the
          knowledge graph or added the datasets try refreshing the page. <br />
          <br />
          You can also click on the button to{" "}
          <Link className="btn btn-primary btn-sm" to={newDatasetUrl}>
            Add a Dataset
          </Link>
        </div>
      ) : null}
    </Alert>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectDatasetsView(props: any) {
  const { datasets, fetchDatasets, location } = props;
  const history = useHistory();

  const [datasetCoordinator, setDatasetCoordinator] =
    React.useState<unknown>(null);

  const settingsUrl = Url.get(Url.pages.project.settings, {
    namespace: props.metadata?.namespace,
    path: props.metadata?.path,
  });

  const projectId = props.metadata?.id;
  const projectIndexingStatus = useGetProjectIndexingStatusQuery(projectId, {
    skip: !projectId,
  });
  const kgDown = !projectIndexingStatus.data?.activated;

  const { defaultBranch, externalUrl } = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]
  >((state) => state.stateModel.project.metadata);
  const { coreSupport } = useCoreSupport({
    gitUrl: externalUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const {
    backendAvailable,
    computed: coreSupportComputed,
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
      history.replace({ state: { reload: false } });
    }
  }, [
    backendAvailable,
    coreSupportComputed,
    datasets.core,
    fetchDatasets,
    history,
    location.state,
    versionUrl,
  ]);

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
    if (coreSupport.backendErrorMessage)
      return (
        <ErrorAlert>
          <b>There was an error verifying support for this project.</b>
          <p>{coreSupport.backendErrorMessage}</p>
        </ErrorAlert>
      );
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
    props.location.pathname !== props.newDatasetUrl
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
      <Switch>
        <Route
          path={props.newDatasetUrl}
          render={() => (
            <>
              <Col key="btn" md={12}>
                <GoBackButton
                  data-cy="go-back-dataset"
                  label="Back to list"
                  url={props.datasetsUrl}
                />
              </Col>
              <ProjectAddDataset
                key="projectsAddDataset"
                {...props}
                versionUrl={versionUrl}
              />
            </>
          )}
        />
        <Route
          path={props.editDatasetUrl}
          render={(p) => (
            <>
              <Col key="btn" md={12}>
                <GoBackButton
                  label="Back to dataset"
                  url={`${props.datasetsUrl}/${p.match.params.datasetId}/`}
                />
              </Col>
              <ProjectDatasetEdit
                client={props.client}
                dataset={
                  p.location.state
                    ? (p.location.state as Record<string, string>).dataset
                    : undefined
                }
                datasetId={decodeURIComponent(p.match.params.datasetId ?? "")}
                fetchDatasets={props.fetchDatasets}
                history={props.history}
                location={props.location}
                model={props.model}
                notifications={props.notifications}
                params={props.params}
                versionUrl={versionUrl}
              />
            </>
          )}
        />
        <Route
          path={props.datasetUrl}
          render={(p) => (
            <>
              <Col key="btn" md={12}>
                <GoBackButton
                  key="btn"
                  label={`Back to ${props.metadata.pathWithNamespace}`}
                  url={props.datasetsUrl}
                />
              </Col>
              <ProjectDatasetShow
                key="datasetPreview"
                datasetCoordinator={datasetCoordinator}
                datasetId={decodeURIComponent(p.match.params.datasetId ?? "")}
                graphStatus={projectIndexingStatus.data?.activated ?? false}
                history={props.history}
                location={props.location}
                model={props.model}
                projectInsideKg={projectIndexingStatus.data?.activated ?? false}
              />
            </>
          )}
        />
        <Route
          exact
          path={props.datasetsUrl}
          render={() => <ProjectDatasetsNav {...props} />}
        />
      </Switch>
    </Col>
  );
}

export default ProjectDatasetsView;
