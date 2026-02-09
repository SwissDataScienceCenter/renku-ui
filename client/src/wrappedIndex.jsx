import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";

// Disable service workers for the moment -- see below where registerServiceWorker is called
// import registerServiceWorker from './utils/ServiceWorker';

import App from "./App";
import { AppErrorBoundary } from "./error-boundary/ErrorBoundary";
import LoginHandler from "./features/loginHandler/LoginHandler";
import { Maintenance } from "./features/maintenance/Maintenance";
import { store } from "./store/store";
import useFeatureFlagSync from "./utils/feature-flags/useFeatureFlagSync.hook";
import SentryUserHandler from "./utils/helpers/sentry/SentryUserHandler";
import { Url } from "./utils/helpers/url";

// import ApiClientV2Compat from "./features/api-client-v2-compat/ApiClientV2Compat";
// import { UserCoordinator } from "./user";

// TODO: move "bootstrap" handling to root.tsx
import "bootstrap";
import "~/styles/renku_bootstrap.scss";

let hasRendered = false;

export default function appIndex(config) {
  if (!hasRendered) {
    appIndexInner(config);
  }
  hasRendered = true;
}

function appIndexInner(params) {
  // NOTE: This creates a React app inside a React app
  // TODO: Remove legacy side effects and render a single app
  const container = document.getElementById("root");
  const root = createRoot(container);

  // // configure core api versioned url helper (only used if legacy support is enabled)
  // const coreApiVersionedUrlConfig = null;

  // configure base url
  Url.setBaseUrl(params.BASE_URL);

  // // Create the global model containing the formal schema definition and the redux store
  // const model = new StateModel(globalSchema);

  // // create client to be passed to coordinators (only if legacy support is enabled)
  // const client = new ApiClientV2Compat(
  //   `${params.BASE_URL}/api`,
  //   params.UISERVER_URL
  // );
  // const userCoordinator = new UserCoordinator(client, model.subModel("user"));
  // userCoordinator.fetchUser();

  // show maintenance page when necessary
  const maintenance = params.MAINTENANCE;
  if (maintenance) {
    root.render(
      <Provider store={store}>
        <Maintenance info={maintenance} />
      </Provider>
    );
    return;
  }

  // // Map redux user data to the initial react application
  // function mapStateToProps(state, ownProps) {
  //   return { user: state.stateModel.user, ...ownProps };
  // }

  // // Render UI application
  // const VisibleApp = connect(mapStateToProps)(App);
  root.render(
    // <Provider store={model.reduxStore}>
    <Provider store={store}>
      <BrowserRouter>
        <AppErrorBoundary>
          <LoginHandler />
          <SentryUserHandler />
          <FeatureFlagHandler />
          <App
            // client={client}
            // coreApiVersionedUrlConfig={coreApiVersionedUrlConfig}
            params={params}
            // model={model}
          />
        </AppErrorBoundary>
      </BrowserRouter>
    </Provider>
  );
}

function FeatureFlagHandler() {
  useFeatureFlagSync();
  return null;
}
