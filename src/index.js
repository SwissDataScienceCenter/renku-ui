import React from 'react';
import ReactDOM from 'react-dom';
import 'font-awesome/css/font-awesome.min.css';
// Use our version of bootstrap, not the one in import 'bootstrap/dist/css/bootstrap.css';
import './styles/index.css';
import './index.css';
import App from './App';
import { AppLoggedOut } from './App';
import registerServiceWorker from './registerServiceWorker';
import GitlabClient from './gitlab/client'
import Cookies from 'universal-cookie'


const cookies = new Cookies();

// We define a parameter object and pass it down via props. This could maybe be stored
// in redux instead. For lazy (mac) developers the right defaults are provided...
const params = {
  BASE_URL: process.env.REACT_APP_RENGA_UI_URL || 'http://localhost:5000',
  GITLAB_URL: process.env.REACT_APP_GITLAB_URL || 'http://docker.for.mac.localhost:5080',
  GITLAB_CLIENT_ID: 'renga-ui',
  KEYCLOAK_URL: process.env.REACT_APP_RENGA_ENDPOINT || 'http://localhost',
  KEYCLOAK_REALM: 'Renga',
  KEYCLOAK_CLIENT_ID: 'renga-ui'
};


// We use the keycloak.js loaded in index.html (-> best practice).
// A json serialized object which can be used to define the keycloak instance can also be downloaded
// from the keycloak server once the renga ui client has been defined.
// eslint-disable-next-line
const keycloak = Keycloak({
  'realm': params.KEYCLOAK_REALM,
  'auth-server-url': params.KEYCLOAK_URL + '/auth',
  'clientId': params.KEYCLOAK_CLIENT_ID
});

keycloak.init()
  .success((authenticated) => {
    if (authenticated) {

      const client = new GitlabClient('/api/v4/', cookies.get('gitlab_token'), 'bearer');

      ReactDOM.render(<App client={client} keycloak={keycloak} cookies={cookies} params={params}/>,
        document.getElementById('root'));
    } else {
      ReactDOM.render(<AppLoggedOut keycloak={keycloak} cookies={cookies} params={params}/>,
        document.getElementById('root'));
    }
    registerServiceWorker();
  }).error(() => {
    alert('failed to initialize Keycloak.');
  });
