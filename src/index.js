import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import * as Sentry from '@sentry/browser';
// Use our version of bootstrap, not the one in import 'bootstrap/dist/css/bootstrap.css';
import './styles/index.css';
import './index.css';
import App from './App';
// Disable service workers for the moment -- see below where registerServiceWorker is called
// import registerServiceWorker from './utils/ServiceWorker';
import APIClient from './api-client'
import { UserCoordinator } from './user'
import { StateModel, globalSchema } from './model'

const configPromise = fetch('/config.json');

configPromise.then((res) => {
  res.json().then((params) => {
    // create client to be passed to coordinators
    const client = new APIClient(params.GATEWAY_URL);

    // Create the global model containing the formal schema definition and the redux store
    const model = new StateModel(globalSchema);

    // Query user data
    const userCoordinator = new UserCoordinator(client, model.subModel('user'));
    userCoordinator.fetchUser();

    // configure Sentry
    if (params.SENTRY_DNS)
      Sentry.init({ dsn: params.SENTRY_DNS });

    // Map redux data to react - note we are mapping the model, not its whole content (only user)
    // Use model.get("something") and map it wherever needed
    function mapStateToProps(state, ownProps) {
      return { user: state.user, ...ownProps }
    }
    const VisibleApp = connect(mapStateToProps)(App);
    ReactDOM.render(
      <VisibleApp client={client} params={params} store={model.reduxStore} model={model} />,
      document.getElementById('root')
    );
  });
});
