import { ReactNode } from "react";
import { Provider } from "react-redux";

import LazyAuthNotifications from "./authentication/LazyAuthNotifications";
import { Loader } from "./components/Loader";
import LazyToastContainer from "./components/toast/LazyToastContainer";
import { AppErrorBoundary } from "./error-boundary/ErrorBoundary";
import Cookie from "./features/cookie/Cookie";
import { Favicon } from "./features/favicon/Favicon";
import RenkuFooterNavBar from "./features/landing/components/NavBar/RenkuFooterNavBar";
import LoggedOutPrompt from "./features/loginHandler/LoggedOutPrompt";
import LoginHandler from "./features/loginHandler/LoginHandler";
import { Maintenance, Unavailable } from "./features/maintenance/Maintenance";
import NavbarV2 from "./features/rootV2/NavbarV2";
import { useGetUserQueryState } from "./features/usersV2/api/users.api";
import { store, type StoreType } from "./store/store";
import AppContext from "./utils/context/appContext";
import type { AppParams } from "./utils/context/appParams.types";
import useFeatureFlagSync from "./utils/feature-flags/useFeatureFlagSync.hook";
import SentryUserHandler from "./utils/helpers/sentry/SentryUserHandler";
import useWebSocket from "./websocket/useWebSocket";

import "./AppRoot.css";

interface AppRootProps {
  params: AppParams;
  children?: ReactNode;
}

/**
 * Application root component
 *
 * Sets up the infrastructure for the Renku UI.
 *
 * Details:
 * - Set up the AppContext (React context)
 * - Set up the Redux store
 * - Set up the client-side error boundary
 * - Set up the favicon component
 * - Set up the login state handler
 * - Set up toasts
 * - Set up the logged out prompt
 * - Set up the header and footer navigation bars
 * - Set up the cookie banner
 *
 * @param {AppParams} [props.params] Application parameters
 * @param {ReactNode} [props.children] Page to render
 */
// TODO: consider if we should consolidate the error boundaries
export default function AppRoot({ params, children }: AppRootProps) {
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
    <AppContext.Provider value={{ params }}>
      <Provider store={store}>
        <AppErrorBoundary>
          <WithStore params={params}>
            <div className="d-flex flex-grow-1">{children}</div>
          </WithStore>
        </AppErrorBoundary>
      </Provider>
    </AppContext.Provider>
  );
}

function WithStore({
  params,
  children,
}: {
  params: AppParams;
  children?: ReactNode;
}) {
  return (
    <>
      <Favicon />
      <LoginHandler />
      <SentryUserHandler />
      <FeatureFlagHandler />
      <InnerApp params={params} store={store}>
        {children}
      </InnerApp>
      <LazyToastContainer />
      <LazyAuthNotifications />
    </>
  );
}

function InnerApp({
  params,
  store,
  children,
}: {
  params: AppParams;
  store: StoreType;
  children?: ReactNode;
}) {
  // Setup the web socket
  useWebSocket({ params, store });

  // Avoid rendering the application while authenticating the user
  const { error, isLoading } = useGetUserQueryState();
  if (isLoading) {
    return (
      <section className="py-5">
        <h3 className="text-center">Checking user data</h3>
        <Loader />
      </section>
    );
  } else if (error) {
    return <Unavailable params={params} />;
  }

  return (
    <>
      <LoggedOutPrompt />
      <NavbarV2 />
      {children}
      <RenkuFooterNavBar />
      <Cookie />
    </>
  );
}

function FeatureFlagHandler() {
  useFeatureFlagSync();
  return null;
}
