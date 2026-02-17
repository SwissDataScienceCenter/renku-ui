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

  // Render UI application
  root.render(
    <Provider store={store}>
      <BrowserRouter>
        <AppErrorBoundary>
          <LoginHandler />
          <SentryUserHandler />
          <FeatureFlagHandler />
          <App params={params} store={store} />
        </AppErrorBoundary>
      </BrowserRouter>
    </Provider>
  );
}

function FeatureFlagHandler() {
  useFeatureFlagSync();
  return null;
}
