import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Helmet } from "react-helmet";
import { connect, Provider } from "react-redux";
import { BrowserRouter, useLocation, useNavigate } from "react-router";
import "bootstrap";
import StyleHandler from "~/features/rootV2/StyleHandler";
// Disable service workers for the moment -- see below where registerServiceWorker is called
// import registerServiceWorker from './utils/ServiceWorker';
import APIClient from "./api-client";
import App from "./App";
import { LoginHelper } from "./authentication";
import { AppErrorBoundary } from "./error-boundary/ErrorBoundary";
import ApiClientV2Compat from "./features/api-client-v2-compat/ApiClientV2Compat";
import { Maintenance } from "./features/maintenance/Maintenance";
import { globalSchema, StateModel } from "./model";
import { pollStatuspage } from "./statuspage";
// Use our version of bootstrap, not the one in import 'bootstrap/dist/css/bootstrap.css';
import v1Styles from "./styles/index.scss?inline";
import { UserCoordinator } from "./user";
import { validatedAppParams } from "./utils/context/appParams.utils";
import useFeatureFlagSync from "./utils/feature-flags/useFeatureFlagSync.hook";
import { Sentry } from "./utils/helpers/sentry";
import { createCoreApiVersionedUrlConfig, Url } from "./utils/helpers/url";

let hasRendered = false;

export default function appIndex() {
  if (!hasRendered) {
    appIndexInner();
  }
  hasRendered = true;
}

function appIndexInner() {
  const configFetch = fetch("/config.json");

  configFetch.then((valuesRead) => {
    const configResp = valuesRead;
    const configRead = configResp.json();

    configRead.then((params_) => {
      const container = document.getElementById("root");
      const root = createRoot(container);

      const params = validatedAppParams(params_);

      // configure core api versioned url helper (only used if legacy support is enabled)
      const coreApiVersionedUrlConfig = params.LEGACY_SUPPORT.enabled
        ? createCoreApiVersionedUrlConfig(params.CORE_API_VERSION_CONFIG)
        : null;

      // configure base url
      Url.setBaseUrl(params.BASE_URL);

      // create client to be passed to coordinators (only if legacy support is enabled)
      const client = params.LEGACY_SUPPORT.enabled
        ? new APIClient(
            `${params.UISERVER_URL}/api`,
            params.UISERVER_URL,
            coreApiVersionedUrlConfig
          )
        : new ApiClientV2Compat(`${params.BASE_URL}/api`, params.UISERVER_URL);

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
      const userCoordinator = client
        ? new UserCoordinator(client, model.subModel("user"))
        : null;
      const userPromise = userCoordinator?.fetchUser();

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

      const forceV2Style = params && !params.LEGACY_SUPPORT.enabled;

      // Render UI application
      const VisibleApp = connect(mapStateToProps)(uiApplication);
      root.render(
        <Provider store={model.reduxStore}>
          <BrowserRouter>
            <AppErrorBoundary>
              <LoginHandler />
              <FeatureFlagHandler />
              <StyleHandler forceV2Style={forceV2Style} />
              <VisibleApp
                client={client}
                coreApiVersionedUrlConfig={coreApiVersionedUrlConfig}
                params={params}
                model={model}
                statuspageId={statuspageId}
              />
            </AppErrorBoundary>
          </BrowserRouter>
        </Provider>
      );
    });
  });
}

function LoginHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    LoginHelper.handleLoginParams(location, navigate);
  }, [location, navigate]);

  return null;
}

function FeatureFlagHandler() {
  useFeatureFlagSync();
  return null;
}
