import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.min.css';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import GitlabClient from './gitlab/client'

// Instanciate a gitlab client. For the time being, inject a secret-token
// through an environment variable.
const client = new GitlabClient('/api/v4/', process.env.REACT_APP_GITLAB_SECRET_TOKEN);

ReactDOM.render(<App client={client}/>, document.getElementById('root'));
registerServiceWorker();
