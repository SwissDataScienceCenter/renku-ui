import { createRoot } from "react-dom/client";
import { connect, Provider } from "react-redux";
import { BrowserRouter as Router, Route } from "react-router-dom";

import "bootstrap";
import "jquery";

// Use our version of bootstrap, not the one in import 'bootstrap/dist/css/bootstrap.css';
import "./styles/index.scss";

import App from "./App";
// Disable service workers for the moment -- see below where registerServiceWorker is called
// import registerServiceWorker from './utils/ServiceWorker';
import APIClient from "./api-client";
import { LoginHelper } from "./authentication";
import { Maintenance } from "./features/maintenance/Maintenance";
import { StateModel, globalSchema } from "./model";
import { pollStatuspage } from "./statuspage";
import { UserCoordinator } from "./user";
import { Sentry } from "./utils/helpers/sentry";
import { Url, createCoreApiVersionedUrlConfig } from "./utils/helpers/url";
import { AppErrorBoundary } from "./error-boundary/ErrorBoundary";
import { validatedAppParams } from "./utils/context/appParams.utils";

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
          <AppErrorBoundary>
            <Route
              render={(props) => {
                LoginHelper.handleLoginParams(props.history);
                return (
                  <VisibleApp
                    client={client}
                    coreApiVersionedUrlConfig={coreApiVersionedUrlConfig}
                    params={params}
                    model={model}
                    location={props.location}
                    statuspageId={statuspageId}
                  />
                );
              }}
            />
          </AppErrorBoundary>
        </Router>
      </Provider>
    );
  });
});
