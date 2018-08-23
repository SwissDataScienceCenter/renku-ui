import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import { createStore } from './utils/EnhancedState';
// Use our version of bootstrap, not the one in import 'bootstrap/dist/css/bootstrap.css';
import './styles/index.css';
import './index.css';
import App from './App';
// Disable service workers for the moment -- see below where registerServiceWorker is called
// import registerServiceWorker from './utils/ServiceWorker';
import GitlabClient from './gitlab'
import Cookies from 'universal-cookie'
import { UserState, reducer} from './app-state';

const cookies = new Cookies();

const configPromise = fetch('/config.json');

configPromise.then((res) => {
  res.json().then((params) => {

    const loggedIn = cookies.get('access_token') !== undefined;

    // We use a redux store to hold some global application state.
    const store = createStore(reducer);

    const client = new GitlabClient(
      params.GATEWAY_URL,
      cookies,
      params.JUPYTERHUB_URL
    );

    function mapStateToProps(state, ownProps){
      return {...state, ...ownProps}
    }

    // Load the user profile and dispatch the result to the store.
    if (loggedIn) {
      UserState.fetchAppUser(client, store.dispatch);
    } else {
      store.dispatch(UserState.set({}));
    }

    const VisibleApp = connect(mapStateToProps, null, null, {storeKey: 'userState'})(App);
    ReactDOM.render(
      <VisibleApp loggedIn={loggedIn} client={client} cookies={cookies} params={params} userState={store}/>,
      document.getElementById('root')
    );

    // The service worker is used for caching content offline, but it causes problems for URL routing.
    // registerServiceWorker()
  });
});
