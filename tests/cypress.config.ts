import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    USE_FIXTURES: true,
  },

  video: false,
  viewportWidth: 1600,
  viewportHeight: 1200,

  e2e: {
    // setupNodeEvents(on, config) {
    //   return require("./cypress/plugins/index.ts")(on, config);
    // },
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    setupNodeEvents(on) {
      // Workaround for a Cypress/Chrome interaction. Can be removed after upgrading to Cypress 12.15.0
      // See  https://github.com/cypress-io/cypress-documentation/issues/5479#issuecomment-1719336938
      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.name === "chrome" && browser.isHeadless) {
          launchOptions.args = launchOptions.args.map((arg) => {
            if (arg === "--headless") {
              return "--headless=new";
            }

            return arg;
          });
        }

        return launchOptions;
      });
    },
  },
});
