import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Helmet } from "react-helmet";
import { connect, Provider } from "react-redux";
import { Route, Switch, useHistory } from "react-router-dom";
import { CompatRoute } from "react-router-dom-v5-compat";

import "bootstrap";

// Use our version of bootstrap, not the one in import 'bootstrap/dist/css/bootstrap.css';
import v1Styles from "./styles/index.scss?inline";
import v2Styles from "./styles/renku_bootstrap.scss?inline";

import App from "./App";
// Disable service workers for the moment -- see below where registerServiceWorker is called
// import registerServiceWorker from './utils/ServiceWorker';
import APIClient from "./api-client";
import { LoginHelper } from "./authentication";
import Router from "./components/router/Router";
import { AppErrorBoundary } from "./error-boundary/ErrorBoundary";
import { Maintenance } from "./features/maintenance/Maintenance";
import { globalSchema, StateModel } from "./model";
import { pollStatuspage } from "./statuspage";
import { UserCoordinator } from "./user";
import { validatedAppParams } from "./utils/context/appParams.utils";
import useFeatureFlagSync from "./utils/feature-flags/useFeatureFlagSync.hook";
import { Sentry } from "./utils/helpers/sentry";
import { createCoreApiVersionedUrlConfig, Url } from "./utils/helpers/url";

const configFetch = fetch("/config.json");

configFetch.then((valuesRead) => {
  const configResp = valuesRead;
  const configRead = configResp.json();

  configRead.then((params_) => {
    const container = document.getElementById("root");
    const root = createRoot(container);

    const params = validatedAppParams(params_);

    // configure core api versioned url helper
    const coreApiVersionedUrlConfig = createCoreApiVersionedUrlConfig(
      params.CORE_API_VERSION_CONFIG
    );

    // configure base url
    Url.setBaseUrl(params.BASE_URL);

    // create client to be passed to coordinators
    const client = new APIClient(
      `${params.UISERVER_URL}/api`,
      params.UISERVER_URL,
      coreApiVersionedUrlConfig
    );

    // Create the global model containing the formal schema definition and the redux store
    const model = new StateModel(globalSchema);

    // show maintenance page when necessary
    const maintenance = params.MAINTENANCE;
    if (maintenance) {
      root.render(
        <Provider store={model.reduxStore}>
          <Helmet>
            <style type="text/css">{v1Styles}</style>
          </Helmet>
          <Maintenance info={maintenance} />
        </Provider>
      );
      return;
    }

    // Query user data
    const userCoordinator = new UserCoordinator(client, model.subModel("user"));
    let userPromise = userCoordinator.fetchUser();

    // configure Sentry
    let uiApplication = App;
    if (params.SENTRY_URL) {
      Sentry.init(
        params.SENTRY_URL,
        params.SENTRY_NAMESPACE,
        userPromise,
        params.UI_VERSION,
        params.TELEPRESENCE,
        params.SENTRY_SAMPLE_RATE,
        [params.UISERVER_URL]
      );
      const profiler = !!params.SENTRY_SAMPLE_RATE;
      if (profiler) uiApplication = Sentry.withProfiler(App);
    }

    // Set up polling
    const statuspageId = params.STATUSPAGE_ID;
    pollStatuspage(statuspageId, model);

    // Map redux user data to the initial react application
    function mapStateToProps(state, ownProps) {
      return { user: state.stateModel.user, ...ownProps };
    }

    // Render UI application
    const VisibleApp = connect(mapStateToProps)(uiApplication);
    root.render(
      <Provider store={model.reduxStore}>
        <Router>
          <AppErrorBoundary params={params}>
            <LoginHandler />
            <FeatureFlagHandler />
            <StyleHandler />
            <VisibleApp
              client={client}
              coreApiVersionedUrlConfig={coreApiVersionedUrlConfig}
              params={params}
              model={model}
              statuspageId={statuspageId}
            />
          </AppErrorBoundary>
        </Router>
      </Provider>
    );
  });
});

function LoginHandler() {
  const history = useHistory();

  useEffect(() => {
    LoginHelper.handleLoginParams(history);
  }, [history]);

  return null;
}

function FeatureFlagHandler() {
  useFeatureFlagSync();
  return null;
}

export function StyleHandler() {
  return (
    <Switch>
      <CompatRoute path="/v2">
        <Helmet>
          <style type="text/css">{v2Styles}</style>
        </Helmet>
      </CompatRoute>
      <Route path="*">
        <Helmet>
          <style type="text/css">{v1Styles}</style>
        </Helmet>
      </Route>
    </Switch>
  );
}
