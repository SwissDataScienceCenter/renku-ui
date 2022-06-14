import React from "react";
import ReactDOM from "react-dom";
import { connect, Provider } from "react-redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "bootstrap";
import "jquery";

// Use our version of bootstrap, not the one in import 'bootstrap/dist/css/bootstrap.css';
import "./styles/index.scss";
import "./index.css";

import App from "./App";
// Disable service workers for the moment -- see below where registerServiceWorker is called
// import registerServiceWorker from './utils/ServiceWorker';
import APIClient from "./api-client";
import { LoginHelper } from "./authentication";
import { EnvironmentCoordinator } from "./environment";
import { pollComponentsVersion } from "./landing";
import { Maintenance } from "./Maintenance";
import { StateModel, globalSchema } from "./model";
import { pollStatuspage } from "./statuspage";
import { UserCoordinator } from "./user";
import { Sentry } from "./utils/helpers/sentry";
import { Url } from "./utils/helpers/url";

const configFetch = fetch("/config.json");
const privacyFetch = fetch("/privacy-statement.md");

Promise.all([configFetch, privacyFetch]).then(valuesRead => {
  const [configResp, privacyResp] = valuesRead;
  const configRead = configResp.json();
  const privacyRead = privacyResp.text();

  Promise.all([configRead, privacyRead]).then(values => {
    const [params, privacy] = values;

    // adjust boolean param values
    for (const val of Object.keys(params)) {
      if (params[val] === "false")
        params[val] = false;
      else if (params[val] === "true")
        params[val] = true;
    }

    // map privacy statement to parameters
    // ? checking DOCTYPE prevents setting content from bad answers on valid 2xx responses
    if (!privacy || !privacy.length || privacy.startsWith("<!DOCTYPE html>"))
      params["PRIVACY_STATEMENT"] = null;
    else
      params["PRIVACY_STATEMENT"] = privacy;

    // show maintenance page when necessary
    const maintenance = params["MAINTENANCE"];
    if (maintenance) {
      ReactDOM.render(<Maintenance info={maintenance} />, document.getElementById("root"));
      return;
    }

    // configure base url
    Url.setBaseUrl(params["BASE_URL"]);

    // create client to be passed to coordinators
    const client = new APIClient(params.UISERVER_URL + "/api", params.UISERVER_URL);

    // Create the global model containing the formal schema definition and the redux store
    const model = new StateModel(globalSchema);

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
        [ params.UISERVER_URL ]
      );
      const profiler = !!params.SENTRY_SAMPLE_RATE;
      if (profiler)
        uiApplication = Sentry.withProfiler(App);
    }

    // Set up polling
    const statuspageId = params["STATUSPAGE_ID"];
    pollStatuspage(statuspageId, model);
    pollComponentsVersion(model.subModel("environment"), client);

    // Retrieve service environment information
    new EnvironmentCoordinator(client, model.subModel("environment")).fetchCoreServiceVersions();

    // Map redux user data to the initial react application
    function mapStateToProps(state, ownProps) {
      return { user: state.user, ...ownProps };
    }


    class WsMessage {
      // timestamp = new Date();
      // type;
      // scope;
      // data;

      constructor(data, scope, type = "user") {
        this.timestamp = new Date();
        if (typeof data === "string")
          this.data = { message: data };
        else
          this.data = data;
        this.scope = scope;
        this.type = type;
      }

      toString() {
        return JSON.stringify({
          timestamp: this.timestamp,
          type: this.type,
          scope: this.scope,
          data: this.data
        });
      }
    }

    // Setup WebSocket channel
    userPromise.then(resp => {
      const webSocketModel = model.subModel("websocket");
      webSocketModel.setObject({
        open: null, messages: [], last: null, error: null
      });
      const uiServerWs = params["UISERVER_URL"].replace("https://", "wss://");
      const ws = new WebSocket(`${uiServerWs}/ws`); // TODO: need to add as variable in the values
      ws.onerror = (error) => {
        webSocketModel.setObject({ open: false, error: { ...error }, last: new Date() });
      };
      ws.onopen = (status) => {
        const open = status?.target?.readyState ?
          true :
          false;
        webSocketModel.setObject({ open, last: new Date() });

        // send setup data
        const mex = new WsMessage({ version: params.UI_SHORT_SHA }, "init");
        ws.send(mex.toString());
      };
      ws.onmessage = (message) => {
        if (message.type === "message" && message.data) {
          const messages = webSocketModel.get("messages");
          webSocketModel.setObject({ messages: [...messages, message.data], last: new Date() });
          console.log(message.data);
        }
        else {
          console.log("unexpected mex: ", message)
        }
      };
      // TODO:
      // - modify the first message so that it sends the require information from the backend
      // // ws.addEventListener
    });

    // Render UI application
    const VisibleApp = connect(mapStateToProps)(uiApplication);
    ReactDOM.render(
      <Provider store={model.reduxStore}>
        <Router>
          <Route render={props => {
            LoginHelper.handleLoginParams(props.history);
            return (
              <VisibleApp client={client} params={params} model={model}
                location={props.location} statuspageId={statuspageId}
              />
            );
          }} />
        </Router>
      </Provider>,
      document.getElementById("root")
    );
  });
});
