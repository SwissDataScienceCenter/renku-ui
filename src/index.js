import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import * as Sentry from "@sentry/browser";
// Use our version of bootstrap, not the one in import 'bootstrap/dist/css/bootstrap.css';
import "./styles/index.css";
import "./index.css";
import App from "./App";
import { Maintenance } from "./Maintenance";
// Disable service workers for the moment -- see below where registerServiceWorker is called
// import registerServiceWorker from './utils/ServiceWorker';
import APIClient from "./api-client";
import { UserCoordinator } from "./user";
import { StateModel, globalSchema } from "./model";

const configPromise = fetch("/config.json");

configPromise.then((res) => {
  res.json().then((params) => {
    if (params["MAINTENANCE"]) {
      ReactDOM.render(<Maintenance info={params["MAINTENANCE"]} />, document.getElementById("root"));
      return;
    }

    // create client to be passed to coordinators
    const client = new APIClient(params.GATEWAY_URL);

    // Create the global model containing the formal schema definition and the redux store
    const model = new StateModel(globalSchema);

    // Query user data
    const userCoordinator = new UserCoordinator(client, model.subModel("user"));
    let userPromise = userCoordinator.fetchUser();

    // configure Sentry
    if (params.SENTRY_URL) {
      Sentry.init({ dsn: params.SENTRY_URL });
      Sentry.configureScope(scope => { scope.setTag("environment", params.SENTRY_NAMESPACE); });
      userPromise.then(data => {
        let user = { logged: false, id: 0, username: null };
        if (data && data.id) {
          user.logged = true;
          user.id = data.id;
          user.username = data.username;
        }
        // eslint-disable-next-line
        Sentry.configureScope(scope => { scope.setUser(user); });
      });
    }

    // Map redux data to react - note we are mapping the model, not its whole content (only user)
    // Use model.get("something") and map it wherever needed
    function mapStateToProps(state, ownProps) {
      return { user: state.user, ...ownProps };
    }
    const VisibleApp = connect(mapStateToProps)(App);
    ReactDOM.render(
      <VisibleApp client={client} params={params} store={model.reduxStore} model={model} />,
      document.getElementById("root")
    );
  });
});
