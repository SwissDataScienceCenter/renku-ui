import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
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

const configPromise = fetch('config.json');

configPromise.then((res) => {
  res.json().then((params) => {
    // We use a redux store to hold some global application state.
    const store = createStore(reducer);

    const client = new GitlabClient(params.GITLAB_URL + '/api/v4/', cookies.get('gitlab_token'), 'bearer');

    // Load the user profile and dispatch the result to the store.
    client.getUser().then(profile => {
      store.dispatch(UserState.set(profile))
    });

    // TODO: Replace this after re-implementation of user state.
    client.getProjects({starred: true})
      .then((projects) => {
        const reducedProjects = projects.map((project) => {
          return {
            id: project.id,
            path_with_namespace: project.path_with_namespace
          }});
        store.dispatch(UserState.setStarred(reducedProjects));
      });

    ReactDOM.render(<App client={client} cookies={cookies} params={params} userState={store}/>,
      document.getElementById('root'));

    registerServiceWorker();
  });
});
