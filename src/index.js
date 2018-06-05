import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import { createStore } from './utils/EnhancedState';
import 'font-awesome/css/font-awesome.min.css';
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

    // We use a redux store to hold some global application state.
    const store = createStore(reducer);

    const client = new GitlabClient(
      params.GITLAB_URL + '/api/v4/',
      cookies.get('gitlab_token'),
      'bearer',
      params.JUPYTERHUB_URL)
    ;

    function mapStateToProps(state, ownProps){
      return {...state, ...ownProps}
    }

    // Load the user profile and dispatch the result to the store.
    if (client._token) {
      UserState.fetchAppUser(client, store.dispatch);
    } else {
      store.dispatch(UserState.set({}));
    }

    const VisibleApp = connect(mapStateToProps, null, null, {storeKey: 'userState'})(App);
    ReactDOM.render(
      <VisibleApp client={client} cookies={cookies} params={params} userState={store}/>,
      document.getElementById('root')
    );

    // The service worker is used for caching content offline, but it causes problems for URL routing.
    // registerServiceWorker()
  });
});
