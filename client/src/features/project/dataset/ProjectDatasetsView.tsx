import React, { useEffect } from "react";
import { Link, Route, Switch } from "react-router-dom";
import {
  Alert, Button, Col
} from "reactstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle, faUserClock
} from "@fortawesome/free-solid-svg-icons";

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

type IWebhook = {
  status: string | boolean | null;
  created: boolean;
  possible: boolean;
  stop: unknown;
  progress: unknown;
}

function webhookError(props: string | boolean | null) {
  if (props == null || props === SpecialPropVal.UPDATING || props === true || props === false)
    return false;

  return true;
}

function isKgDown(thing: IWebhook | boolean) {
  if (thing === false) return true;
  const webhook = thing as IWebhook;
  return (webhook.status === false && webhook.created !== true) ||
      webhookError(webhook.status);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectDatasetLockAlert({ lockStatus }: any) {
  if (lockStatus == null) return null;
  const isLocked = lockStatus.locked;
  if (!isLocked) return null;

  return <WarnAlert>
    <FontAwesomeIcon icon={faUserClock} />{" "}
    <i>Project is being modified. Datasets cannot be created or edited{" "}
        until the action completes.</i>
  </WarnAlert>;
}

/**
 * Shows a warning Alert when Renku version is outdated or Knowledge Graph integration is not active.
 *
 * @param {Object} webhook - project.webhook store object
 * @param {Object} history - react history object
 * @param {string} overviewStatusUrl - overview status url
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectStatusAlert(props: any) {
  const { webhook, overviewStatusUrl, history } = props;
  const kgDown = isKgDown(webhook);

  if (!kgDown)
    return null;

  const kgInfo = kgDown ?
    <span>
      <strong>Knowledge Graph integration not active. </strong>
        This means that some operations on datasets are not possible, we recommend activating it.
    </span> :
    null;

  return (
    <WarnAlert>
      {kgInfo}
      <br />
      <br />
      <Button color="warning" onClick={() => history.push(overviewStatusUrl)}>
          See details
      </Button>
    </WarnAlert>
  );
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectDatasetsNav(props: any) {
  const coreDatasets = props.datasets.core.datasets;
  if (coreDatasets == null) return null;
  if (coreDatasets.error != null) return null;
  if (coreDatasets.length === 0) return null;

  return <ProjectDatasetListView
    datasets_kg={props.datasets.datasets_kg}
    datasets={props.datasets.core.datasets}
    datasetsUrl={props.datasetsUrl}
    locked={props.lockStatus?.locked ?? true}
    newDatasetUrl={props.newDatasetUrl}
    accessLevel={props.metadata.accessLevel}
    graphStatus={props.isGraphReady}
  />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectAddDataset(props: any) {

  const [newDataset, setNewDataset] = React.useState(true);
  function toggleNewDataset() {
    setNewDataset(!newDataset);
  }

  return <Col>
    { newDataset ?
      <ProjectDatasetNew
        client={props.client}
        fetchDatasets={props.fetchDatasets}
        history={props.history}
        location={props.location}
        model={props.model}
        notifications={props.notifications}
        params={props.params}
        toggleNewDataset={toggleNewDataset} /> :
      <ProjectDatasetImport
        client={props.client}
        fetchDatasets={props.fetchDatasets}
        history={props.history}
        location={props.location}
        model={props.model}
        notifications={props.notifications}
        params={props.params}
        toggleNewDataset={toggleNewDataset} />
    }
  </Col>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EmptyDatasets({ locked, membership, newDatasetUrl }: any) {
  return <Alert timeout={0} color="primary">
      No datasets found for this project.
    { membership && !locked ?
      <div>
        <br />
        <FontAwesomeIcon icon={faInfoCircle} />  If you recently activated the knowledge graph or
          added the datasets try refreshing the page. <br /><br />
          You can also click on the button to{" "}
        <Link className="btn btn-primary btn-sm" to={newDatasetUrl}>
            Add a Dataset
        </Link>
      </div>
      : null
    }
  </Alert>;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectDatasetsView(props: any) {
  const [datasetCoordinator, setDatasetCoordinator] = React.useState<unknown>(null);

  const kgDown = isKgDown(props.webhook);

  const migrationMessage = <ProjectStatusAlert
    history={props.history}
    overviewStatusUrl={props.overviewStatusUrl}
    webhook={props.webhook}
  />;

  useEffect(() => {
    props.fetchGraphStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setDatasetCoordinator(new DatasetCoordinator(props.client, props.model.subModel("dataset")));
  }, [props.client, props.model]);

  useEffect(() => {
    const datasetsLoading = props.datasets.core === SpecialPropVal.UPDATING;
    if (datasetsLoading || !props.migration.core.fetched || props.migration.core.fetching)
      return;

    if (props.datasets.core.datasets === null)
      props.fetchDatasets(props.location.state && props.location.state.reload);
  }, [props.migration.core.fetched, props.datasets.core]); // eslint-disable-line react-hooks/exhaustive-deps

  if (props.migration.core.fetched && !props.migration.core.backendAvailable) {
    const overviewStatusUrl = Url.get(Url.pages.project.overview.status, {
      namespace: props.metadata.namespace,
      path: props.metadata.path,
    });
    const updateInfo = props.metadata.accessLevel >= ACCESS_LEVELS.DEVELOPER ?
      "Updating this project" :
      "Asking a project maintainer to update this project (or forking and updating it)";
    return (
      <div>
        <WarnAlert dismissible={false}>
          <p>
            <b>Datasets have limited functionality</b> because the project is not compatible with
              this RenkuLab instance.
          </p>
          <p>You can search for datasets, but you cannot interact with them from the project page.</p>
          <p>
            {updateInfo} should resolve the problem.
            <br />The <Link to={overviewStatusUrl}>Project status</Link> page provides further information.
          </p>
        </WarnAlert>
      </div>
    );
  }

  const checkingBackend = props.migration.core.fetching || !props.migration.core.fetched;
  if (checkingBackend) {
    return (
      <div>
        <p>Checking project version and RenkuLab compatibility...</p>
        <Loader />
      </div>
    );
  }

  const loadingDatasets = props.datasets.core === SpecialPropVal.UPDATING || props.datasets.core === undefined;
  if (loadingDatasets) {
    return (
      <div>
        <p>Loading datasets...</p>
        <Loader />
      </div>
    );
  }

  if (props.datasets.core.error || props.datasets.core.datasets?.error) {
    const error = props.datasets.core.error ?
      props.datasets.core.error :
      props.datasets.core.datasets?.error;
    let errorObject;
    if (error.code) {
      errorObject = (<CoreErrorAlert error={error}/>);
    }
    else {
      errorObject = (
        <ErrorAlert>
            There was an error fetching the datasets, please try{" "}
          <Button color="danger" size="sm" onClick={() => window.location.reload()}> reloading </Button>
          {" "}the page.
        </ErrorAlert>
      );
    }
    return (<Col sm={12} data-cy="error-datasets-modal">{errorObject}</Col>);
  }

  if (props.datasets.core.datasets != null && props.datasets.core.datasets.length === 0
      && props.location.pathname !== props.newDatasetUrl) {
    return <Col sm={12}>
      {migrationMessage}
      <ProjectDatasetLockAlert lockStatus={props.lockStatus} />
      <EmptyDatasets
        locked={props.lockStatus?.locked ?? true}
        membership={props.metadata.accessLevel > ACCESS_LEVELS.DEVELOPER}
        newDatasetUrl={props.newDatasetUrl}
      />
    </Col>;
  }

  return <Col sm={12}>
    {migrationMessage}
    <ProjectDatasetLockAlert lockStatus={props.lockStatus} />
    <Switch>
      <Route path={props.newDatasetUrl}
        render={() =>
          <>
            <Col key="btn" md={12}>
              <GoBackButton data-cy="go-back-dataset" label="Back to list" url={props.datasetsUrl}/>
            </Col>,
            <ProjectAddDataset key="projectsAddDataset" {...props} />
          </>}/>
      <Route path={props.editDatasetUrl}
        render={p => <>
          <Col key="btn" md={12}>
            <GoBackButton label="Back to dataset" url={`${props.datasetsUrl}/${p.match.params.datasetId}/`}/>
          </Col>
          <ProjectDatasetEdit
            client={props.client}
            dataset={p.location.state ? (p.location.state as Record<string, string>).dataset : undefined}
            datasetId={decodeURIComponent(p.match.params.datasetId ?? "")}
            fetchDatasets={props.fetchDatasets}
            history={props.history}
            location={props.location}
            model={props.model}
            notifications={props.notifications}
            params={props.params} />
        </>
        }/>
      <Route path={props.datasetUrl} render={p => <>
        <Col key="btn" md={12}>
          <GoBackButton key="btn" label={`Back to ${props.metadata.pathWithNamespace}`} url={props.datasetsUrl}/>
        </Col>
        <ProjectDatasetShow
          key="datasetPreview"
          datasetCoordinator={datasetCoordinator}
          datasetId={decodeURIComponent(p.match.params.datasetId ?? "")}
          graphStatus={props.isGraphReady}
          history={props.history}
          location={props.location}
          model={props.model}
          projectInsideKg={!kgDown}
        />
      </>} />
      <Route exact path={props.datasetsUrl} render={() =>
        <ProjectDatasetsNav {...props} />
      }/>
    </Switch>
  </Col>;
}

export default ProjectDatasetsView;
