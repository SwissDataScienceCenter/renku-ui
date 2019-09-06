import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { createStore } from './utils/EnhancedState';
import { reducer} from './app-state';
import { testClient as client } from './api-client'
const store = createStore(reducer);

it('renders without crashing', () => {
  const div = document.createElement('div');

  ReactDOM.render(<App userState={store} client={client} params={{WELCOME_PAGE: 'Some text'}}/>, div);
});
