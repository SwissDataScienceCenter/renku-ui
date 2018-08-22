import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { createStore } from './utils/EnhancedState';
import { UserState, reducer} from './app-state';
const store = createStore(reducer);

it('renders without crashing', () => {
  const div = document.createElement('div');

  ReactDOM.render(<App userState={store} params={{WELCOME_PAGE: 'Some text'}}/>, div);
});
