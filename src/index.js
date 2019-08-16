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
import APIClient from './api-client'
import { UserState, reducer} from './app-state';

const configPromise = fetch('/config.json');

configPromise.then((res) => {
  res.json().then((params) => {

    // We use a redux store to hold some global application state.
    const store = createStore(reducer);

    const client = new APIClient(params.GATEWAY_URL);

    function mapStateToProps(state, ownProps){
      return {...state, ...ownProps}
    }

    // Load the user profile and dispatch the result to the store.
    UserState.fetchAppUser(client, store.dispatch);

    const VisibleApp = connect(mapStateToProps, null, null, {storeKey: 'userState'})(App);
    ReactDOM.render(
      <VisibleApp client={client} params={params} userState={store}/>,
      document.getElementById('root')
    );

    // The service worker is used for caching content offline, but it causes problems for URL routing.
    // registerServiceWorker()
  });
});
