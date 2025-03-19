import { Preview } from "@storybook/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import type { AppContextType } from "../app/old-src/utils/context/appContext";
import AppContext from "../app/old-src/utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../app/old-src/utils/context/appParams.constants";
import { createStore } from "../app/old-src/utils/helpers/EnhancedState";
import { createCoreApiVersionedUrlConfig } from "../app/old-src/utils/helpers/url";

import "../app/old-src/styles/renku_bootstrap.scss";

// This how the documentation recommends introducing the store into storybook
// https://storybook.js.org/addons/@dreamworld/addon-redux/
export const store = createStore({});

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
      webSocket: undefined,
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
