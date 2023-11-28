import { Preview } from "@storybook/react";
// import { enhancer as withReduxEnhancer } from "addon-redux";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import type { AppContextType } from "../src/utils/context/appContext";
import AppContext from "../src/utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../src/utils/context/appParams.constants";
import { createStore } from "../src/utils/helpers/EnhancedState";
import { createCoreApiVersionedUrlConfig } from "../src/utils/helpers/url";

import "../src/styles/index.scss";

// This how the documentation recommends introducing the store into storybook
// https://storybook.js.org/addons/@dreamworld/addon-redux/
export const store = createStore(
  {}
  //[withReduxEnhancer]
);

export const decorators = [
  (Story) => {
    const appContext: AppContextType = {
      client: {
        baseUrl: "http://localhost",
        uploadFileURL: () => "http://localhost",
      },
      coreApiVersionedUrlConfig: createCoreApiVersionedUrlConfig({
        coreApiVersion: "/",
      }),
      location: "location",
      model: undefined,
      notifications: undefined,
      params: { ...DEFAULT_APP_PARAMS },
    };
    return (
      <MemoryRouter initialEntries={["/"]}>
        <AppContext.Provider value={appContext}>
          <Provider store={store}>
            <Story />
          </Provider>
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
