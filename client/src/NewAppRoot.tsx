import { Provider } from "react-redux";
import { useOutletContext } from "react-router";

import { AppErrorBoundary } from "./error-boundary/ErrorBoundary";
import LoginHandler from "./features/loginHandler/LoginHandler";
import { Maintenance } from "./features/maintenance/Maintenance";
import LazyApp from "./LazyApp";
import { RootOutletContext } from "./root";
import { store } from "./store/store";
import useFeatureFlagSync from "./utils/feature-flags/useFeatureFlagSync.hook";
import SentryUserHandler from "./utils/helpers/sentry/SentryUserHandler";

export default function NewAppRoot() {
  const { params } = useOutletContext<RootOutletContext>();

  // show maintenance page when necessary
  const maintenance = params.MAINTENANCE;
  if (maintenance) {
    return (
      <Provider store={store}>
        <Maintenance info={maintenance} />
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <AppErrorBoundary>
        <LoginHandler />
        <SentryUserHandler />
        <FeatureFlagHandler />
        <LazyApp params={params} store={store} />
      </AppErrorBoundary>
    </Provider>
  );
}

function FeatureFlagHandler() {
  useFeatureFlagSync();
  return null;
}
