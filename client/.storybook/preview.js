import { enhancer as withReduxEnhancer } from 'addon-redux'


import "../src/styles/index.scss";

import AppContext from '../src/utils/context/appContext';
import {createStoreWithEnhancers} from "../src/utils/helpers/EnhancedState.js";

// This how the documentation recommends introducing the store into storybook
// https://storybook.js.org/addons/@dreamworld/addon-redux/
export const store = createStoreWithEnhancers({}, [withReduxEnhancer]);


export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  }
}

export const decorators = [
  (Story) => {
    const appContext = {
      client: {baseUrl: "localhost"},
      params: {},
      location: "location"
    };
    return <AppContext.Provider value={appContext}>
      <Story />
    </AppContext.Provider>
  },
];
