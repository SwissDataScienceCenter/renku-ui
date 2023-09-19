import { enhancer as withReduxEnhancer } from "addon-redux";

import "../src/styles/index.scss";

import AppContext from "../src/utils/context/appContext";
import { createStore } from "../src/utils/helpers/EnhancedState";
import { MemoryRouter } from "react-router-dom";
import { Preview } from "@storybook/react";

// This how the documentation recommends introducing the store into storybook
// https://storybook.js.org/addons/@dreamworld/addon-redux/
export const store = createStore({}, [withReduxEnhancer]);

export const decorators = [
  (Story) => {
    const appContext = {
      client: {
        baseUrl: "http://localhost",
        uploadFileURL: () => "http://localhost",
      },

      params: {},
      location: "location",
    };
    return (
      <MemoryRouter initialEntries={["/"]}>
        <AppContext.Provider value={appContext}>
          <Story />
        </AppContext.Provider>
      </MemoryRouter>
    );
  },
];

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    viewMode: "docs",
    docs: {
      toc: true,
    },
    options: {
      storySort: {
        method: "alphabetical",
      },
    },
  },
};
export default preview;
