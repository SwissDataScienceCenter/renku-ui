import { Preview } from "@storybook/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

import { store } from "../src/store/store";
import type { AppContextType } from "../src/utils/context/appContext";
import AppContext from "../src/utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../src/utils/context/appParams.constants";

import "../src/styles/renku_bootstrap.scss";

export const decorators = [
  (Story) => {
    const appContext: AppContextType = {
      params: { ...DEFAULT_APP_PARAMS },
    };
    return (
      <MemoryRouter initialEntries={["/"]}>
        <AppContext.Provider value={appContext}>
          <Provider store={store}>
            <div style={{ fontFamily: "Inter" }}>
              <Story />
            </div>
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
      inlineStories: true,
    },
    options: {
      storySort: {
        method: "alphabetical",
      },
    },
  },
};
export default preview;
