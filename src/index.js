import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from './utils/EnhancedState';
import 'font-awesome/css/font-awesome.min.css';
// Use our version of bootstrap, not the one in import 'bootstrap/dist/css/bootstrap.css';
import './styles/index.css';
import './index.css';
import App from './App';
import { AppLoggedOut } from './App';
import registerServiceWorker from './utils/ServiceWorker';
import GitlabClient from './gitlab/client'
import Cookies from 'universal-cookie'
import { UserState, reducer} from './app-state';

const cookies = new Cookies();

// We define a parameter object and pass it down via props. This could maybe be stored
// in redux instead. For lazy (mac) developers the right defaults are provided...
const params = {
  BASE_URL: process.env.REACT_APP_RENGA_UI_URL || 'http://localhost:5000',
  GITLAB_URL: process.env.REACT_APP_GITLAB_URL || 'http://docker.for.mac.localhost:5080',
  GITLAB_CLIENT_ID: 'renga-ui',
  KEYCLOAK_URL: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost',
  KEYCLOAK_REALM: 'Renga',
  KEYCLOAK_CLIENT_ID: 'renga-ui'
};

const keycloakDef = {
  realm: params.KEYCLOAK_REALM,
  url: params.KEYCLOAK_URL + '/auth',
  clientId: params.KEYCLOAK_CLIENT_ID
};

// We use a redux store to hold some global application state.
const store = createStore(reducer);

function getKeycloak() {
  if (process.env.REACT_APP_UI_DEV_MODE !== 'true') {

    // We follow the best practice described in
    // http://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter
    // and load keycloak.js from the keycloak server to ensure consistency of the keycloak server with the used js
    // adapter.

    // A json serialized object which can be used to define the keycloak instance can also be downloaded
    // from the keycloak server once the renga ui client has been defined.
    // eslint-disable-next-line
    return Keycloak(keycloakDef);
  } else {
    const npmKeycloak = require('keycloak-js');
    return npmKeycloak(keycloakDef);
  }
}

const keycloak = getKeycloak();

keycloak.init()
  .success((authenticated) => {
    if (authenticated) {

      const client = new GitlabClient(params.GITLAB_URL + '/api/v4/', cookies.get('gitlab_token'), 'bearer');

      // Load the user profile and dispatch the result to the store.
      keycloak.loadUserProfile()
        .success(profile => {store.dispatch(UserState.set(profile))});

      ReactDOM.render(<App client={client} keycloak={keycloak} cookies={cookies} params={params} store={store}/>,
        document.getElementById('root'));
    } else {
      ReactDOM.render(<AppLoggedOut keycloak={keycloak} cookies={cookies} params={params}/>,
        document.getElementById('root'));
    }
    registerServiceWorker();
  }).error(() => {
    alert('failed to initialize Keycloak.');
  });
